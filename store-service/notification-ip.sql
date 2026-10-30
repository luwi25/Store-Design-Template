-- Run after print-24h-and-notifications.sql. Additive: adds the store's IP address
-- (already captured in the activity log for print requests/print-initiated events)
-- to the admin-facing notification inbox and to the data store_push_api hands the
-- Edge Function, so it can also appear in the Lark card. Approvals are unaffected --
-- that notification is store-facing and never carried an IP.
begin;
alter table store_monitor.notifications add column if not exists ip_address text;

create or replace function store_monitor.save_print_notification()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_ip text;
begin
 if TG_OP='INSERT' then
  select details->>'ipAddress' into v_ip from store_monitor.activity where id=NEW.id||'-submitted';
  insert into store_monitor.notifications(store,request_id,kind,template_name,created_at,ip_address)
   values('all',NEW.id,'requested',NEW.template_name,NEW.created_at,v_ip) on conflict do nothing;
 end if;
 if NEW.status='approved' then
  insert into store_monitor.notifications(store,request_id,kind,template_name,created_at)
   values(NEW.store,NEW.id,'approved',NEW.template_name,coalesce(NEW.decided_at,now())) on conflict do nothing;
 end if;
 return NEW;
end;
$$;
revoke all on function store_monitor.save_print_notification() from public,anon,authenticated;

create or replace function store_monitor.save_print_initiated_notification()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if NEW.action='print_initiated' and NEW.store in ('home-express','pesoplus','alkeia-talamban') then
  insert into store_monitor.notifications(store,request_id,kind,template_name,created_at,event_id,source_store,ip_address)
   select 'all',r.id,'print_initiated',NEW.template_name,NEW.created_at,NEW.id,NEW.store,NEW.details->>'ipAddress'
   from store_monitor.print_requests r where r.id=NEW.details->>'requestId' and r.store=NEW.store
   on conflict do nothing;
 end if;
 return NEW;
end;
$$;
revoke all on function store_monitor.save_print_initiated_notification() from public,anon,authenticated;

-- Backfill IP addresses for existing rows from the activity log, best-effort.
update store_monitor.notifications n set ip_address=a.details->>'ipAddress'
 from store_monitor.activity a where n.kind='requested' and n.ip_address is null and a.id=n.request_id||'-submitted';
update store_monitor.notifications n set ip_address=a.details->>'ipAddress'
 from store_monitor.activity a where n.kind='print_initiated' and n.ip_address is null and n.event_id is not null and a.id=n.event_id;

create or replace function public.store_inbox_api(p_action text,p_token_hash text default '',p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor text; rows jsonb; unread bigint; before_seq bigint; affected integer;
begin
 select store into actor from store_monitor.sessions where token_hash=p_token_hash and expires>now();
 if actor is null then return jsonb_build_object('error','Please sign in again.','status',401); end if;
 if p_action='read' then
  update store_monitor.notifications set read_at=coalesce(read_at,now())
   where store=actor and (seq::text=p_data->>'id' or request_id=p_data->>'requestId');
  get diagnostics affected=row_count;
  if affected=0 then return jsonb_build_object('error','Notification not found.','status',404); end if;
 elsif p_action='read_all' then
  update store_monitor.notifications set read_at=now() where store=actor and read_at is null;
 elsif p_action not in ('list','count') then
  return jsonb_build_object('error','Unknown notification action.','status',400);
 end if;
 select count(*) into unread from store_monitor.notifications where store=actor and read_at is null;
 if p_action<>'list' then return jsonb_build_object('unread',unread); end if;
 if coalesce(p_data->>'before','') ~ '^[0-9]{1,18}$' then before_seq=(p_data->>'before')::bigint; end if;
 select coalesce(jsonb_agg(to_jsonb(n) order by n.seq desc),'[]') into rows from (
  select seq::text as id,seq,request_id,kind,template_name,created_at,read_at,source_store,event_id,ip_address from store_monitor.notifications
   where store=actor and (before_seq is null or seq<before_seq) order by seq desc limit 50
 ) n;
 return jsonb_build_object('notifications',rows,'unread',unread);
end;
$$;
revoke all on function public.store_inbox_api(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.store_inbox_api(text,text,jsonb) to service_role;

create or replace function public.store_push_api(p_action text,p_token_hash text default '',p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_store text; v_request store_monitor.print_requests%rowtype; v_rows jsonb; v_count integer; v_event store_monitor.activity%rowtype; v_ip text;
begin
 -- Only the service role can call this RPC, including delivery cleanup.
 if p_action='expired' then
  delete from store_monitor.push_subscriptions where endpoint=p_data->>'endpoint' and subscription=p_data->'subscription';
  return '{"ok":true}';
 end if;
 select store into v_store from store_monitor.sessions where token_hash=p_token_hash and expires>now();
 if v_store is null then return jsonb_build_object('error','Please sign in again.','status',401); end if;
 if p_action='claim' then
  select * into v_request from store_monitor.print_requests where id=p_data->>'id' and store=v_store
   and status='pending' and created_at>now()-interval '5 minutes';
  if not found then return '{"subscriptions":[]}'; end if;
  insert into store_monitor.push_claims(request_id) values(v_request.id) on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=0 then return '{"subscriptions":[]}'; end if;
  select details->>'ipAddress' into v_ip from store_monitor.activity where id=v_request.id||'-submitted';
  select coalesce(jsonb_agg(subscription),'[]') into v_rows from store_monitor.push_subscriptions
   where store='all' and updated_at>now()-interval '90 days';
  return jsonb_build_object('subscriptions',v_rows,'requestId',v_request.id,'store',v_request.store,'template',v_request.template_name,'ipAddress',v_ip);
 end if;
 if p_action='claim_print' then
  select * into v_event from store_monitor.activity where id=v_store||':'||(p_data->>'eventId')
   and store=v_store and store<>'all' and action='print_initiated'
   and details->>'requestId'=p_data->>'id' and created_at>now()-interval '5 minutes';
  if not found then return '{"subscriptions":[]}'; end if;
  insert into store_monitor.push_print_claims(event_id) values(v_event.id) on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=0 then return '{"subscriptions":[]}'; end if;
  select coalesce(jsonb_agg(subscription),'[]') into v_rows from store_monitor.push_subscriptions
   where store='all' and updated_at>now()-interval '90 days';
  return jsonb_build_object('subscriptions',v_rows,'requestId',p_data->>'id','store',v_event.store,
   'template',v_event.template_name,'type','print_initiated','eventId',v_event.id,'ipAddress',v_event.details->>'ipAddress');
 end if;
 if p_action='claim_approval' then
  if v_store<>'all' then return jsonb_build_object('error','Admin access is required.','status',403); end if;
  select * into v_request from store_monitor.print_requests where id=p_data->>'id'
   and status='approved' and decided_at>now()-interval '5 minutes';
  if not found then return '{"subscriptions":[]}'; end if;
  insert into store_monitor.push_approval_claims(request_id) values(v_request.id) on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=0 then return '{"subscriptions":[]}'; end if;
  select coalesce(jsonb_agg(subscription),'[]') into v_rows from store_monitor.push_subscriptions
   where store=v_request.store and updated_at>now()-interval '90 days';
  return jsonb_build_object('subscriptions',v_rows,'requestId',v_request.id,'store',v_request.store,
   'template',v_request.template_name,'type','approved');
 end if;
 if p_action='subscribe' then
  if length(coalesce(p_data->>'endpoint','')) not between 10 and 2048 or jsonb_typeof(p_data->'keys') is distinct from 'object' then
   return jsonb_build_object('error','Invalid subscription.','status',400);
  end if;
  -- Serialize enrollment and bound delivery work to 100 notification devices.
  perform pg_advisory_xact_lock(hashtextextended('store-push-enrollment',0));
  delete from store_monitor.push_subscriptions where updated_at<=now()-interval '90 days';
  if (select count(*) from store_monitor.push_subscriptions)>=100 and not exists(select 1 from store_monitor.push_subscriptions where endpoint=p_data->>'endpoint') then
   return jsonb_build_object('error','Notification device limit reached. Disable an unused device first.','status',409);
  end if;
  insert into store_monitor.push_subscriptions(endpoint,subscription,store) values(p_data->>'endpoint',p_data,v_store)
   on conflict(endpoint) do update set subscription=excluded.subscription,store=excluded.store,updated_at=now();
  return '{"ok":true}';
 elsif p_action='unsubscribe' then
  delete from store_monitor.push_subscriptions where endpoint=p_data->>'endpoint' and store=v_store;
  return '{"ok":true}';
 elsif p_action='status' then
  return jsonb_build_object('enabled',exists(select 1 from store_monitor.push_subscriptions where endpoint=p_data->>'endpoint' and store=v_store and updated_at>now()-interval '90 days'));
 end if;
 return jsonb_build_object('error','Unknown notification action.','status',400);
end;
$$;
revoke all on function public.store_push_api(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.store_push_api(text,text,jsonb) to service_role;
commit;
