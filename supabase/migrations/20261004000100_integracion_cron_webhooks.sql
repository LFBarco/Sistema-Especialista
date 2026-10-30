-- Envío automático de avisos (webhooks) cada minuto.
-- Requiere las extensiones pg_cron y pg_net (Supabase > Database > Extensions).
-- Antes de ejecutar, reemplazar REEMPLAZAR_CRON_SECRET por el mismo valor
-- configurado en la variable de entorno CRON_SECRET de Vercel.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('integracion-webhooks')
 where exists (select 1 from cron.job where jobname = 'integracion-webhooks');

select cron.schedule(
  'integracion-webhooks',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://med-specialist-manag-syst.vercel.app/api/internal/webhooks/dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer REEMPLAZAR_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
