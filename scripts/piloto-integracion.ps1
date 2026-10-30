#Requires -Version 5.1
<#
.SYNOPSIS
  Ayuda a poner en marcha y probar la integración VetSpecialist ↔ Veterinari.

.DESCRIPTION
  1) Comprueba /api/health
  2) Crea el integrador (si pasas -AdminSecret)
  3) Prueba ping con la API key
  4) Recuerda los pasos de Supabase/SQL que debes hacer a mano

.EXAMPLE
  .\scripts\piloto-integracion.ps1
  .\scripts\piloto-integracion.ps1 -AdminSecret "tu_secreto_largo" -NombreIntegrador "Veterinari"
  .\scripts\piloto-integracion.ps1 -ApiKey "vsk_live_..." 
#>
param(
  [string]$BaseUrl = "https://med-specialist-manag-syst.vercel.app",
  [string]$AdminSecret = $env:ADMIN_SECRET,
  [string]$ApiKey = $env:VETSPECIALIST_API_KEY,
  [string]$NombreIntegrador = "Veterinari",
  [string]$WebhookUrl = ""
)

$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "=== VetSpecialist · piloto de integración ===" -ForegroundColor Cyan
Write-Host "Base: $BaseUrl"
Write-Host ""

function Invoke-Json {
  param([string]$Method, [string]$Url, [hashtable]$Headers = @{}, [string]$Body = $null)
  $params = @{ Method = $Method; Uri = $Url; Headers = $Headers; ContentType = "application/json" }
  if ($Body) { $params.Body = $Body }
  return Invoke-RestMethod @params
}

# --- 1. Health ---
Write-Host "1) Health check..." -ForegroundColor Yellow
try {
  $h = Invoke-Json -Method GET -Url "$BaseUrl/api/health"
  Write-Host "   OK: $($h | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
  Write-Host "   FALLO: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "   ¿El proyecto está desplegado? ¿Rewrites de /api en vercel.json?" -ForegroundColor Red
  exit 1
}

# Detectar configuración incompleta (503 típico al usar DB sin env)
Write-Host ""
Write-Host "2) Variables en Vercel..." -ForegroundColor Yellow
Write-Host "   Debe existir en Production y Preview:" -ForegroundColor DarkGray
Write-Host "   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SECRET, CRON_SECRET, PORTAL_URL"
Write-Host "   Si faltan: vercel.com → Settings → Environment Variables → Redeploy"

# --- 3. Crear integrador ---
if ($AdminSecret) {
  Write-Host ""
  Write-Host "3) Crear integrador '$NombreIntegrador'..." -ForegroundColor Yellow
  try {
    $r = Invoke-Json -Method POST -Url "$BaseUrl/api/admin/integradores" `
      -Headers @{ "X-Admin-Secret" = $AdminSecret } `
      -Body (@{ nombre = $NombreIntegrador } | ConvertTo-Json)
    Write-Host "   Creado. GUARDA ESTOS VALORES (solo se muestran una vez):" -ForegroundColor Green
    Write-Host "   apiKey:        $($r.apiKey)" -ForegroundColor White
    Write-Host "   webhookSecret: $($r.webhookSecret)" -ForegroundColor White
    Write-Host "   id:            $($r.id)" -ForegroundColor DarkGray
    $ApiKey = $r.apiKey
    $out = Join-Path $PSScriptRoot "..\docs\_secrets_integrador_NO_SUBIR.json"
    @{
      creadoEn = (Get-Date).ToString("o")
      integrador = $NombreIntegrador
      id = $r.id
      apiKey = $r.apiKey
      webhookSecret = $r.webhookSecret
    } | ConvertTo-Json | Set-Content -Path $out -Encoding UTF8
    Write-Host "   Copia local (NO subir a GitHub): $out" -ForegroundColor DarkYellow
  } catch {
    Write-Host "   FALLO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ¿ADMIN_SECRET configurado en Vercel y redeploy hecho?" -ForegroundColor Red
  }
} else {
  Write-Host ""
  Write-Host "3) Integrador: omitido (pasa -AdminSecret o define `$env:ADMIN_SECRET)" -ForegroundColor DarkGray
}

# --- 4. Ping ---
if ($ApiKey) {
  Write-Host ""
  Write-Host "4) Ping con API key..." -ForegroundColor Yellow
  try {
    $p = Invoke-Json -Method GET -Url "$BaseUrl/api/v1/ping" `
      -Headers @{ Authorization = "Bearer $ApiKey" }
    Write-Host "   OK: $($p | ConvertTo-Json -Compress)" -ForegroundColor Green
  } catch {
    Write-Host "   FALLO: $($_.Exception.Message)" -ForegroundColor Red
  }

  if ($WebhookUrl) {
    Write-Host ""
    Write-Host "5) Configurar webhook..." -ForegroundColor Yellow
    try {
      $w = Invoke-Json -Method PUT -Url "$BaseUrl/api/v1/webhook" `
        -Headers @{ Authorization = "Bearer $ApiKey" } `
        -Body (@{ url = $WebhookUrl } | ConvertTo-Json)
      Write-Host "   Webhook: $($w.url)" -ForegroundColor Green
      $t = Invoke-Json -Method POST -Url "$BaseUrl/api/v1/webhook/prueba" `
        -Headers @{ Authorization = "Bearer $ApiKey" }
      Write-Host "   Evento de prueba encolado: $($t.eventoId)" -ForegroundColor Green
    } catch {
      Write-Host "   FALLO webhook: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
} else {
  Write-Host ""
  Write-Host "4) Ping: omitido (pasa -ApiKey o crea el integrador arriba)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== Checklist manual (Supabase) ===" -ForegroundColor Cyan
Write-Host " [ ] Ejecutar supabase/migrations/20261004000000_integracion_v1.sql"
Write-Host " [ ] Activar extensiones pg_cron y pg_net"
Write-Host " [ ] Ejecutar 20261004000100_integracion_cron_webhooks.sql (con CRON_SECRET real)"
Write-Host " [ ] Edge Function: ADMIN_EMAILS + deploy make-server-91d1f360"
Write-Host " [ ] Portal: Configuración → Sistema → Asignar datos antiguos"
Write-Host " [ ] Entregar a Veterinari: docs/HANDOFF_VETERINARI_V1.md + apiKey"
Write-Host ""
