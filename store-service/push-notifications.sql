-- Run after supabase-setup.sql. Additive: leaves print rules and sales sync alone.
begin;
create table if not exists store_monitor.push_subscriptions (
 endpoint text primary key, subscription jsonb not null,
 updated_at timestamptz not null default now()
);
create table if not exists store_monitor.push_claims (
 request_id text primary key references store_monitor.print_requests(id) on delete cascade,
 created_at timestamptz not null default now()
);
-- Existing subscriptions were Admin subscriptions. Bind new enrollments to their authenticated store.
alter table store_monitor.push_subscriptions add column if not exists store text not null default 'all'
 check(store in ('all','home-express','pesoplus','alkeia-talamban'));
create table if not exists store_monitor.push_approval_claims (
 request_id text primary key references store_monitor.print_requests(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table store_monitor.push_approval_claims enable row level security;
revoke all on store_monitor.push_approval_claims from public,anon,authenticated;
alter table store_monitor.push_subscriptions enable row level security;
alter table store_monitor.push_claims enable row level security;
revoke all on store_monitor.push_subscriptions,store_monitor.push_claims from public,anon,authenticated;

create table if not exists store_monitor.push_print_claims (
 event_id text primary key references store_monitor.activity(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table store_monitor.push_print_claims enable row level security;
revoke all on store_monitor.push_print_claims from public,anon,authenticated;

create or replace function public.store_push_api(p_action text,p_token_hash text default '',p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_store text; v_request store_monitor.print_requests%rowtype; v_rows jsonb; v_count integer; v_event store_monitor.activity%rowtype;
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
  select coalesce(jsonb_agg(subscription),'[]') into v_rows from store_monitor.push_subscriptions
   where store='all' and updated_at>now()-interval '90 days';
  return jsonb_build_object('subscriptions',v_rows,'requestId',v_request.id,'store',v_request.store,'template',v_request.template_name);
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
   'template',v_event.template_name,'type','print_initiated','eventId',v_event.id);
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
