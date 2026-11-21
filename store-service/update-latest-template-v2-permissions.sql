-- Copy this entire file into Supabase SQL Editor and click Run.
-- Requires the existing store_monitor_api setup. Safe to rerun.
-- Updates template permissions only; leaves product and sales data unchanged.
BEGIN;

DO $$
DECLARE
  function_sql text;
  template_id text;
  store_slug text;
  template_ids text[] := ARRAY[
    'ginsey-oslob-v2-front',
    'ginsey-oslob-v2-back',
    'oneplus-pardo-v2-front',
    'oneplus-pardo-v2-back',
    'kazumi-linao-v2-front',
    'kazumi-linao-v2-back'
  ];
BEGIN
  IF to_regprocedure('public.store_monitor_api(text,text,jsonb)') IS NULL THEN
    RAISE EXCEPTION 'Store service setup is missing. Run the full setup SQL first. No changes applied.';
  END IF;

  function_sql := pg_get_functiondef(
    'public.store_monitor_api(text,text,jsonb)'::regprocedure
  );

  FOREACH template_id IN ARRAY template_ids LOOP
    store_slug := split_part(template_id, '-v2-', 1);
    IF position(quote_literal(template_id) IN function_sql) = 0 THEN
      function_sql := replace(
        function_sql,
        quote_literal(store_slug || '-front') || ',' || quote_literal(store_slug || '-back'),
        quote_literal(template_id) || ',' ||
        quote_literal(store_slug || '-front') || ',' || quote_literal(store_slug || '-back')
      );
    END IF;
  END LOOP;

  FOREACH template_id IN ARRAY template_ids LOOP
    IF position(quote_literal(template_id) IN function_sql) = 0 THEN
      RAISE EXCEPTION 'Existing setup differs: could not register %. No changes applied. Use the full update SQL file.', template_id;
    END IF;
  END LOOP;

  EXECUTE function_sql;
END;
$$;

COMMIT;
