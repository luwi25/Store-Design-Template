-- Run after supabase-setup.sql. Notifications and read state are shared per store account.
begin;
create table if not exists store_monitor.notifications (
 seq bigint generated always as identity primary key,
 store text not null, request_id text not null references store_monitor.print_requests(id) on delete cascade,
 kind text not null check(kind in ('requested','approved')),
 template_name text not null, created_at timestamptz not null default now(), read_at timestamptz,
 unique(store,request_id,kind)
);
create index if not exists notifications_store_seq on store_monitor.notifications(store,seq desc);
alter table store_monitor.notifications enable row level security;
revoke all on store_monitor.notifications from public,anon,authenticated;
create or replace function store_monitor.save_print_notification()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' then
  insert into store_monitor.notifications(store,request_id,kind,template_name,created_at)
   values('all',NEW.id,'requested',NEW.template_name,NEW.created_at) on conflict do nothing;
 end if;
 if NEW.status='approved' then
  insert into store_monitor.notifications(store,request_id,kind,template_name,created_at)
   values(NEW.store,NEW.id,'approved',NEW.template_name,coalesce(NEW.decided_at,now())) on conflict do nothing;
 end if;
 return NEW;
end;
$$;
revoke all on function store_monitor.save_print_notification() from public,anon,authenticated;
drop trigger if exists print_notification_saved on store_monitor.print_requests;
create trigger print_notification_saved after insert or update of status on store_monitor.print_requests
 for each row execute function store_monitor.save_print_notification();
-- Preserve existing request history when enabling the inbox. Reruns preserve read state.
insert into store_monitor.notifications(store,request_id,kind,template_name,created_at)
 select 'all',id,'requested',template_name,created_at from store_monitor.print_requests on conflict do nothing;
insert into store_monitor.notifications(store,request_id,kind,template_name,created_at)
 select store,id,'approved',template_name,coalesce(decided_at,created_at) from store_monitor.print_requests
 where status='approved' on conflict do nothing;
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
  select seq::text as id,seq,request_id,kind,template_name,created_at,read_at from store_monitor.notifications
   where store=actor and (before_seq is null or seq<before_seq) order by seq desc limit 50
 ) n;
 return jsonb_build_object('notifications',rows,'unread',unread);
end;
$$;
revoke all on function public.store_inbox_api(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.store_inbox_api(text,text,jsonb) to service_role;
commit;
