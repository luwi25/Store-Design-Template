-- Run this whole file once in the project's Supabase SQL Editor as postgres.
-- Additive, rerunnable setup. Does not touch product data or sales automation.
begin;
create schema if not exists store_monitor;
revoke all on schema store_monitor from public, anon, authenticated;

create table if not exists store_monitor.sessions (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 store text not null check(store in ('home-express','pesoplus','alkeia-talamban','all')),
 expires timestamptz not null
);
create table if not exists store_monitor.login_limits (
 key text primary key, attempts integer not null, until_time timestamptz not null
);
create table if not exists store_monitor.activity (
 seq bigint generated always as identity primary key,
 id text not null unique, store text not null,
 action text not null, template_id text not null default '',
 template_name text not null default '', details jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create index if not exists activity_store_seq on store_monitor.activity(store,seq desc);
create table if not exists store_monitor.print_requests (
 seq bigint generated always as identity primary key,
 id text not null unique, store text not null check(store in ('home-express','pesoplus','alkeia-talamban')),
 template_id text not null, template_name text not null,
 note text not null default '', preview text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 comment text not null default '', created_at timestamptz not null default now(),
 decided_at timestamptz
);
-- Update existing installations as well as fresh schemas.
alter table store_monitor.sessions drop constraint if exists sessions_store_check;
alter table store_monitor.sessions add constraint sessions_store_check check(store in ('home-express','pesoplus','alkeia-talamban','all'));
alter table store_monitor.print_requests drop constraint if exists print_requests_store_check;
alter table store_monitor.print_requests add constraint print_requests_store_check check(store in ('home-express','pesoplus','alkeia-talamban'));

create unique index if not exists one_pending_request on store_monitor.print_requests(store,template_id) where status='pending';
create index if not exists requests_store_template_seq on store_monitor.print_requests(store,template_id,seq desc);
alter table store_monitor.sessions enable row level security;
alter table store_monitor.login_limits enable row level security;
alter table store_monitor.activity enable row level security;
alter table store_monitor.print_requests enable row level security;
revoke all on all tables in schema store_monitor from public, anon, authenticated;
revoke all on all sequences in schema store_monitor from public, anon, authenticated;

-- Only the Edge Function's service role may execute this function.
-- Store role comes from a hashed session; client-provided roles are never trusted.
create or replace function public.store_monitor_api(p_action text, p_token_hash text default '', p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_store text; v_owner text; v_tid text := coalesce(p_data->>'templateId','');
 v_name text := coalesce(p_data->>'templateName',''); v_id text := p_data->>'id';
 v_row store_monitor.print_requests%rowtype;
 v_rows jsonb; v_last jsonb; v_count integer; v_attempts integer;
 v_status text; v_comment text; v_details jsonb := '{}'; v_change jsonb;
 v_from timestamptz; v_to timestamptz; v_before bigint; v_ip text; v_network jsonb;
begin
 if jsonb_typeof(p_data) is distinct from 'object' then
  return jsonb_build_object('error','Invalid request.','status',400);
 end if;
 -- Network metadata is supplied by the Edge Function for this request.
 -- Invalid/missing metadata must never block the action.
 v_ip:=null;
 if length(coalesce(p_data->>'ipAddress','')) between 2 and 45
    and position('/' in (p_data->>'ipAddress'))=0 then
  begin
   v_ip:=host((p_data->>'ipAddress')::inet);
  exception when invalid_text_representation then v_ip:=null;
  end;
 end if;
 v_network:=jsonb_strip_nulls(jsonb_build_object(
  'ipAddress',v_ip,
  'ipSource',case when v_ip is not null and p_data->>'ipSource' in ('cf-connecting-ip','x-forwarded-for') then p_data->>'ipSource' else null end
 ));
 -- These two actions are called only by the Edge Function, before session auth.
 if p_action='login_limit' then
  delete from store_monitor.login_limits where until_time < now();
  insert into store_monitor.login_limits(key,attempts,until_time)
   values(p_data->>'key',1,now()+interval '15 minutes')
   on conflict(key) do update set attempts=store_monitor.login_limits.attempts+1
   returning attempts into v_attempts;
  return jsonb_build_object('allowed',v_attempts<=12);
 elsif p_action='session_create' then
  v_store:=p_data->>'store';
  if v_store is null or v_store not in ('home-express','pesoplus','alkeia-talamban','all') then
   return jsonb_build_object('error','Invalid store.','status',400);
  end if;
  delete from store_monitor.sessions where expires<=now();
  insert into store_monitor.sessions(token_hash,store,expires) values(p_token_hash,v_store,now()+interval '8 hours');
  insert into store_monitor.activity(id,store,action,details)
   values(gen_random_uuid()::text,v_store,'sign_in',v_network);
  return jsonb_build_object('store',v_store);
 end if;
 select store into v_store from store_monitor.sessions where token_hash=p_token_hash and expires>now();
 if v_store is null then return jsonb_build_object('error','Your session expired. Please sign in again.','status',401); end if;
 if p_action='session' then return jsonb_build_object('store',v_store); end if;
 if p_action='logout' then delete from store_monitor.sessions where token_hash=p_token_hash; return '{"ok":true}'; end if;

 if v_tid<>'' then
  v_owner:=case when v_tid in ('home-everyday','home-back','home-collection','home-collection-front') then 'home-express'
   when v_tid in ('alkeia-talamban-front','alkeia-talamban-back') then 'alkeia-talamban'
   when v_tid in ('peso-plus','peso-back','peso-collection-front','peso-collection-back') then 'pesoplus' else null end;
  if v_owner is null or (v_store<>'all' and v_owner<>v_store) then
   return jsonb_build_object('error','This template is not available for your store.','status',403);
  end if;
 end if;
 if p_action in ('event','request_create') and (v_tid='' or length(v_name)>160) then
  return jsonb_build_object('error','Invalid template.','status',400);
 end if;
 if p_action in ('event','request_create','request_get','decision','print') and
  (v_id is null or v_id !~ '^[a-zA-Z0-9_-]{8,80}$') then
  return jsonb_build_object('error','Invalid request identifier.','status',400);
 end if;

 if p_action='event' then
  v_status:=p_data->>'action';
  if v_status is null or v_status not in ('template_opened','product_edited','print_initiated') or (v_status='print_initiated' and v_store<>'all') then
   return jsonb_build_object('error','Invalid activity action.','status',400);
  end if;
  if v_status='product_edited' then
   if length(coalesce(p_data->>'productName',''))>160 or jsonb_typeof(p_data->'changes') is distinct from 'array' then
    return jsonb_build_object('error','Invalid product changes.','status',400);
   end if;
   if jsonb_array_length(p_data->'changes') not between 1 and 8 then return jsonb_build_object('error','Invalid changes.','status',400); end if;
   v_details:=jsonb_build_object('product',p_data->>'productName','changes','[]'::jsonb);
   for v_change in select value from jsonb_array_elements(p_data->'changes') loop
    if coalesce(v_change->>'field','') not in ('name','price','image','discount','textSizes','product') or
       length(coalesce(v_change->>'before',''))>500 or length(coalesce(v_change->>'after',''))>500 then
     return jsonb_build_object('error','Invalid changed field.','status',400);
    end if;
    v_details:=jsonb_set(v_details,'{changes}',(v_details->'changes')||jsonb_build_array(jsonb_build_object('field',v_change->>'field','before',v_change->>'before','after',v_change->>'after')));
   end loop;
  end if;
  insert into store_monitor.activity(id,store,action,template_id,template_name,details)
   values(v_store||':'||v_id,v_store,v_status,v_tid,v_name,v_details||v_network) on conflict(id) do nothing;
  return '{"ok":true}';
 elsif p_action='request_create' then
  if v_store='all' then return jsonb_build_object('error','Store accounts submit print requests.','status',400); end if;
  if length(coalesce(p_data->>'note',''))>1000 or p_data->>'preview' is null or
   length(p_data->>'preview')>750000 or p_data->>'preview' !~ '^data:image/jpeg;base64,/9j/[A-Za-z0-9+/=]+$' then
   return jsonb_build_object('error','A JPEG preview under 750 KB and a note under 1,000 characters are required.','status',400);
  end if;
  -- Serialize create/decision/print for a store/template, including retries.
  perform pg_advisory_xact_lock(hashtextextended(v_store||':'||v_tid,0));
  select * into v_row from store_monitor.print_requests where id=v_id;
  if found then
   if v_row.store<>v_store or v_row.template_id<>v_tid then return jsonb_build_object('error','Request identifier already used.','status',409); end if;
  else
   select * into v_row from store_monitor.print_requests where store=v_store and template_id=v_tid and status='pending';
   if not found then
    insert into store_monitor.print_requests(id,store,template_id,template_name,note,preview)
     values(v_id,v_store,v_tid,v_name,coalesce(p_data->>'note',''),p_data->>'preview') returning * into v_row;
    insert into store_monitor.activity(id,store,action,template_id,template_name,details)
     values(v_id||'-submitted',v_store,'print_requested',v_tid,v_name,v_network);
   end if;
  end if;
  return jsonb_build_object('id',v_row.id,'status',v_row.status,'created_at',v_row.created_at);
 elsif p_action='requests' then
  select coalesce(jsonb_agg(to_jsonb(r)-'preview'-'seq' order by r.seq desc),'[]') into v_rows from (
   select *,case when status='approved' then decided_at+interval '24 hours' else null end as expires_at,
    (status='approved' and decided_at is not null and decided_at+interval '24 hours'>clock_timestamp()) as can_print
    from store_monitor.print_requests
    where (v_store='all' or store=v_store)
    and (coalesce(p_data->>'store','')='' or store=p_data->>'store')
    and (v_tid='' or template_id=v_tid)
    and (coalesce(p_data->>'status','')='' or status=p_data->>'status')
    order by seq desc limit 100
  ) r;
  return jsonb_build_object('requests',v_rows);
 elsif p_action in ('request_get','decision','print') then
  select * into v_row from store_monitor.print_requests where id=v_id;
  if not found then return jsonb_build_object('error','Request not found.','status',404); end if;
  if v_store<>'all' and v_row.store<>v_store then return jsonb_build_object('error','This request belongs to another store.','status',403); end if;
  if p_action='request_get' then return (to_jsonb(v_row)-'seq')||jsonb_build_object(
   'expires_at',case when v_row.status='approved' then v_row.decided_at+interval '24 hours' else null end,
   'can_print',v_row.status='approved' and v_row.decided_at is not null and v_row.decided_at+interval '24 hours'>clock_timestamp()); end if;
  perform pg_advisory_xact_lock(hashtextextended(v_row.store||':'||v_row.template_id,0));
  select * into v_row from store_monitor.print_requests where id=v_id for update;
  if p_action='decision' then
   if v_store<>'all' then return jsonb_build_object('error','Admin access is required.','status',403); end if;
   v_status:=p_data->>'status'; v_comment:=coalesce(p_data->>'comment','');
   if v_status is null or v_status not in ('approved','rejected') or length(v_comment)>1000 then
    return jsonb_build_object('error','Choose Approve or Reject and use a comment under 1,000 characters.','status',400);
   end if;
   if v_row.status<>'pending' then
    if v_row.status=v_status and v_row.comment=v_comment then return '{"ok":true}'; end if;
    return jsonb_build_object('error','Another admin already decided this request. Refresh the list.','status',409);
   end if;
   update store_monitor.print_requests set status=v_status,comment=v_comment,decided_at=now() where id=v_id;
   insert into store_monitor.activity(id,store,action,template_id,template_name,details)
    values(v_id||'-decision','all',v_status,v_row.template_id,v_row.template_name,jsonb_build_object('store',v_row.store,'comment',v_comment)||v_network);
  else
   if v_row.status='approved' and (v_row.decided_at is null or v_row.decided_at+interval '24 hours'<=clock_timestamp()) then
    return jsonb_build_object('error','Approval expired. Send a new print request to admin.','status',403);
   end if;
   if v_store='all' or v_row.status<>'approved' or exists(
    select 1 from store_monitor.print_requests where store=v_store and template_id=v_row.template_id and seq>v_row.seq
   ) then return jsonb_build_object('error','Admin approval is required before printing.','status',403); end if;
   if coalesce(p_data->>'eventId','') !~ '^[a-zA-Z0-9_-]{8,80}$' then return jsonb_build_object('error','Invalid print event.','status',400); end if;
   insert into store_monitor.activity(id,store,action,template_id,template_name,details)
    values(v_store||':'||(p_data->>'eventId'),v_store,'print_initiated',v_row.template_id,v_row.template_name,jsonb_build_object('requestId',v_id)||v_network) on conflict(id) do nothing;
  end if;
  return '{"ok":true}';
 elsif p_action='activity' then
  if v_store<>'all' then return jsonb_build_object('error','Admin access is required.','status',403); end if;
  if coalesce(p_data->>'from','')<>'' then v_from:=((p_data->>'from')::date)::timestamp at time zone 'Asia/Manila'; end if;
  if coalesce(p_data->>'to','')<>'' then v_to:=(((p_data->>'to')::date)+1)::timestamp at time zone 'Asia/Manila'; end if;
  if coalesce(p_data->>'before','')<>'' then v_before:=(p_data->>'before')::bigint; end if;
  select coalesce(jsonb_agg((to_jsonb(a)-'seq')||jsonb_build_object('cursor',a.seq) order by a.seq desc),'[]'),count(*)
   into v_rows,v_count from (
    select * from store_monitor.activity where
     ((coalesce(p_data->>'store','')='' and store in ('home-express','pesoplus','alkeia-talamban'))
      or (coalesce(p_data->>'store','')<>'' and (store=p_data->>'store' or details->>'store'=p_data->>'store')))
     and (coalesce(p_data->>'action','')='' or action=p_data->>'action')
     and (v_tid='' or template_id=v_tid) and (v_from is null or created_at>=v_from)
     and (v_to is null or created_at<v_to) and (v_before is null or seq<v_before)
     order by seq desc limit 100
   ) a;
  select coalesce(jsonb_agg(to_jsonb(a)),'[]') into v_last from (
   select store,max(created_at) as last_active from store_monitor.activity group by store
  ) a;
  return jsonb_build_object('events',v_rows,'lastActive',v_last,'next',case when v_count=100 then v_rows->99->'cursor' else null end);
 end if;
 return jsonb_build_object('error','Endpoint not found.','status',404);
exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format or numeric_value_out_of_range then
 return jsonb_build_object('error','Invalid filter value.','status',400);
end;
$$;
revoke all on function public.store_monitor_api(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.store_monitor_api(text,text,jsonb) to service_role;
notify pgrst, 'reload schema';
commit;
