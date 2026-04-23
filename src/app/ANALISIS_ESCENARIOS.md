# Análisis de Escenarios del Sistema

## Estado Actual vs Necesidades

### ✅ **ESCENARIO 1: Integración con Google Calendar**
**Situación:** Veterinarias sin sistema que usan Google Calendar compartido

**Estado Actual:** ❌ **NO IMPLEMENTADO**
- No existe integración con Google Calendar
- No hay sincronización bidireccional
- No se detectan eventos creados en Google Calendar

**Lo que se necesita:**
1. **Google Calendar API Integration**
   - Configurar OAuth 2.0 con Google
   - Permisos: `calendar.readonly` y `calendar.events`
   - Sincronización bidireccional de eventos

2. **Webhook/Polling para detectar nuevos eventos**
   - Detectar cuando alguien crea un evento en el calendario compartido
   - Convertir evento de Google Calendar → Solicitud en el sistema
   - Enviar notificación al doctor

3. **Flujo propuesto:**
   ```
   Veterinaria sin sistema 
   → Crea evento en Google Calendar del Dr.
   → Sistema detecta nuevo evento (webhook)
   → Crea automáticamente una Solicitud
   → Notifica al Dr. en el sistema
   → Dr. revisa y acepta/rechaza
   → Si acepta: Evento queda confirmado
   → Si rechaza: Evento se elimina o marca como cancelado
   ```

4. **Datos del evento de Google Calendar:**
   - Título → tipo de servicio
   - Descripción → detalles del paciente
   - Fecha/Hora → fechaSolicitada/horaSolicitada
   - Ubicación → dirección de la clínica
   - Email del organizador → identificar clínica

**Complejidad:** 🟡 **Media-Alta**
**Tiempo estimado:** 2-3 días de desarrollo

---

### ✅ **ESCENARIO 2: API para Veterinarias con Sistema**
**Situación:** Veterinarias con software propio que pueden hacer peticiones API

**Estado Actual:** ✅ **PARCIALMENTE IMPLEMENTADO**
- ✅ Backend Supabase con API REST funcionando
- ✅ Endpoint POST `/make-server-91d1f360/solicitudes` disponible
- ✅ CORS habilitado para aceptar peticiones externas
- ❌ Falta: Sistema de API Keys para autenticación
- ❌ Falta: Documentación de la API
- ❌ Falta: Rate limiting y validaciones

**Lo que ya funciona:**
```javascript
// La clínica puede hacer esto AHORA MISMO:
POST https://{projectId}.supabase.co/functions/v1/make-server-91d1f360/solicitudes
Headers:
  Content-Type: application/json
  Authorization: Bearer {publicAnonKey}

Body:
{
  "clinica": "Clínica Veterinaria VetPlus",
  "tipo": "Ecocardiograma Doppler",
  "paciente": "Max",
  "especie": "Canino - Labrador",
  "fechaSolicitada": "2025-01-20",
  "horaSolicitada": "10:00",
  "urgencia": "alta",
  "descripcion": "Paciente con soplo cardíaco",
  "tarifa": 350,
  "direccion": "Av. Principal 123",
  "estado": "pendiente",
  "fechaSolicitud": "2025-01-18T10:30:00Z"
}

Response:
{
  "success": true,
  "data": { ...solicitud con ID generado }
}
```

**Lo que falta implementar:**
1. **Sistema de API Keys por clínica**
   - Generar API Key única para cada clínica
   - Validar API Key en cada petición
   - Asociar solicitud con la clínica que la envió

2. **Documentación de API**
   - Swagger/OpenAPI docs
   - Ejemplos de código en diferentes lenguajes
   - Códigos de error y manejo

3. **Webhooks para respuestas**
   - Notificar a la clínica cuando el Dr. acepta/rechaza
   - Callback URL configurable por clínica

**Complejidad:** 🟢 **Baja** (90% está hecho)
**Tiempo estimado:** 1 día de desarrollo

---

### ✅ **ESCENARIO 3: Creación Manual por Asistente**
**Situación:** Asistente del doctor crea solicitudes manualmente en el sistema

**Estado Actual:** ❌ **NO IMPLEMENTADO**
- No existe botón "Nueva Solicitud"
- No hay formulario para crear solicitudes manualmente
- Solo se pueden ver las solicitudes existentes

**Lo que se necesita:**
1. **Botón "Nueva Solicitud"** en el módulo Solicitudes
2. **Modal/Formulario con campos:**
   - Seleccionar Clínica (dropdown de userClinicas)
   - Tipo de servicio (Ecocardiograma, Consulta, etc.)
   - Datos del paciente (nombre, especie)
   - Fecha y hora solicitada
   - Nivel de urgencia
   - Descripción
   - Dirección
   - Tarifa

3. **Validaciones:**
   - Campos requeridos
   - Formato de fecha válido
   - No crear en fechas pasadas
   - Verificar disponibilidad en agenda

4. **Flujo:**
   ```
   Asistente presiona "Nueva Solicitud"
   → Formulario se abre
   → Completa todos los campos
   → Presiona "Crear"
   → Solicitud se guarda como "pendiente"
   → Aparece en la lista del doctor
   → Doctor puede aceptar/rechazar normalmente
   ```

**Complejidad:** 🟢 **Baja**
**Tiempo estimado:** 2-3 horas de desarrollo

---

## Resumen de Estado Actual

| Escenario | Estado | % Completado | Prioridad |
|-----------|--------|--------------|-----------|
| 1️⃣ Google Calendar | ❌ No implementado | 0% | 🔴 Alta |
| 2️⃣ API REST | ✅ Funcional | 90% | 🟡 Media |
| 3️⃣ Creación Manual | ❌ No implementado | 0% | 🟢 Baja |

---

## Recomendación de Implementación

### Fase 1 (Crítico - Inmediato):
1. ✅ **Escenario 3**: Creación manual de solicitudes
   - Es lo más rápido de implementar
   - Permite al asistente trabajar desde YA
   - No depende de integraciones externas

### Fase 2 (Importante - Corto plazo):
2. ✅ **Escenario 2**: Completar API REST
   - Agregar sistema de API Keys
   - Crear documentación
   - Habilitar webhooks

### Fase 3 (Avanzado - Mediano plazo):
3. ✅ **Escenario 1**: Integración Google Calendar
   - Requiere más desarrollo
   - Necesita configuración OAuth
   - Pero resuelve el problema de clínicas sin sistema

---

## Arquitectura Propuesta - Flujos Unificados

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA DEL DOCTOR                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │ Solicitudes  │  │    Agenda    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                           ▲                             │
│                           │                             │
│                    ┌──────┴──────┐                     │
│                    │   Backend   │                     │
│                    │   Supabase  │                     │
│                    └──────┬──────┘                     │
│                           │                             │
└───────────────────────────┼─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Asistente  │   │  Clínica con │   │ Clínica sin  │
│   Creación   │   │   Sistema    │   │   Sistema    │
│    Manual    │   │   (API REST) │   │   (Google    │
│              │   │              │   │   Calendar)  │
└──────────────┘   └──────────────┘   └──────────────┘
     Escenario 3       Escenario 2       Escenario 1
```

---

## Próximos Pasos

¿Quieres que implemente alguno de estos escenarios? 

Recomiendo empezar por el **Escenario 3** (Creación Manual) porque:
- ✅ Es rápido de implementar
- ✅ Soluciona el problema inmediato
- ✅ No requiere configuraciones externas
- ✅ El asistente puede empezar a trabajar hoy mismo
