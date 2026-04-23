# 🏗️ Arquitectura del Sistema VetSpecialist

## 📊 Flujo Actual (Desarrollo - Mock Data)

### Estado Actual
```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND REACT                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            App.tsx (Context Provider)                 │  │
│  │  - useState para solicitudes []                       │  │
│  │  - useState para servicios []                         │  │
│  │  - useState para facturas []                          │  │
│  │  - useState para gastos []                            │  │
│  │                                                        │  │
│  │  Funciones:                                           │  │
│  │  • aceptarSolicitud() → Crea servicio                │  │
│  │  • completarServicio() → Cambia estado               │  │
│  │  • generarFactura() → Crea factura                   │  │
│  │  • marcarComoPagada() → Actualiza estado             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  Datos en memoria (se pierden al recargar)                   │
└─────────────────────────────────────────────────────────────┘
```

### ¿Cómo "detecta" solicitudes actualmente?
```javascript
// En App.tsx - Datos precargados al iniciar
const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
  {
    id: 1,
    clinica: 'Clínica VetPlus',
    tipo: 'Ecocardiograma Doppler',
    estado: 'pendiente',
    // ... más datos
  }
]);
```

**Limitación actual:** No hay detección real. Los datos están hardcodeados.

---

## 🚀 Arquitectura de Producción (Con Backend Real)

### Vista General del Sistema

```
┌─────────────────────┐         ┌──────────────────────┐
│  CLÍNICAS           │         │  MÉDICO ESPECIALISTA │
│                     │         │                       │
│  Sistema de         │         │  VetSpecialist App    │
│  la Clínica         │         │  (Tu sistema)         │
│  • Agenda interna   │         │  • Dashboard          │
│  • Pacientes        │         │  • Solicitudes        │
│  • Veterinarios     │         │  • Agenda             │
└──────┬──────────────┘         └──────────┬───────────┘
       │                                    │
       │ API Request                        │ API Request
       │ (Crear solicitud)                  │ (Consultar datos)
       │                                    │
       ▼                                    ▼
┌─────────────────────────────────────────────────────────┐
│              API REST / BACKEND                          │
│                                                           │
│  Endpoints:                                              │
│  • POST   /api/solicitudes                              │
│  • GET    /api/solicitudes                              │
│  • PATCH  /api/solicitudes/:id                          │
│  • POST   /api/servicios                                │
│  • GET    /api/servicios                                │
│  • POST   /api/facturas                                 │
│  • GET    /api/facturas                                 │
│  • POST   /api/gastos                                   │
│                                                           │
│  Autenticación: JWT Tokens                              │
│  Validación: Verificar que la clínica existe            │
│  Notificaciones: WebSockets / Push Notifications        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (Supabase / PostgreSQL)      │
│                                                           │
│  Tablas:                                                 │
│  • usuarios (médicos especialistas)                     │
│  • clinicas (clínicas registradas)                      │
│  • solicitudes                                          │
│  • servicios                                            │
│  • facturas                                             │
│  • gastos                                               │
│  • notificaciones                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo: Desde Solicitud hasta Pago

### 1️⃣ Clínica Solicita un Servicio

```
┌────────────────────────────────────────────────────────────┐
│ PASO 1: Clínica necesita un especialista                  │
└────────────────────────────────────────────────────────────┘

[Clínica VetPlus]
  │
  │ Tiene un paciente: "Toby" con soplo cardíaco
  │
  ▼
[Sistema de la Clínica]
  │ - Busca especialista disponible
  │ - Selecciona: Dr. Juan Pérez (Cardiólogo)
  │
  ▼
[Envía solicitud vía API]

POST https://api.vetspecialist.com/api/solicitudes
Authorization: Bearer TOKEN_CLINICA

{
  "medicoId": "123",
  "clinicaId": "456",
  "tipo": "Ecocardiograma Doppler",
  "paciente": {
    "nombre": "Toby",
    "especie": "Canino - Labrador",
    "edad": "8 años"
  },
  "fechaSolicitada": "2025-12-12",
  "horaSolicitada": "10:00",
  "urgencia": "alta",
  "descripcion": "Paciente con soplo cardíaco grado III",
  "direccion": "Av. Principal 123, Ciudad",
  "tarifa": 350
}
```

### 2️⃣ Sistema Recibe y Procesa la Solicitud

```
┌────────────────────────────────────────────────────────────┐
│ PASO 2: Backend recibe y almacena                          │
└────────────────────────────────────────────────────────────┘

[API Backend]
  ├─ Valida autenticación (TOKEN_CLINICA es válido?)
  ├─ Valida que la clínica existe y está activa
  ├─ Valida que el médico existe
  ├─ Valida campos requeridos
  │
  ▼
[Base de Datos]
  INSERT INTO solicitudes (...)
  │
  ▼
[Sistema de Notificaciones]
  ├─ WebSocket → Notificación en tiempo real al médico
  ├─ Push Notification → App móvil del médico
  ├─ Email → Correo al médico
  └─ SMS → Mensaje de texto (opcional)
```

### 3️⃣ Médico Ve la Solicitud

```
┌────────────────────────────────────────────────────────────┐
│ PASO 3: Frontend detecta nueva solicitud                   │
└────────────────────────────────────────────────────────────┘

[VetSpecialist Frontend]
  │
  │ Opción A: Polling (Consulta periódica)
  │ ────────────────────────────────────────
  │ setInterval(() => {
  │   fetch('/api/solicitudes?estado=pendiente')
  │     .then(res => setSolicitudes(res.data))
  │ }, 30000) // Cada 30 segundos
  │
  │ Opción B: WebSocket (Tiempo real) ⭐ RECOMENDADO
  │ ────────────────────────────────────────
  │ const socket = new WebSocket('ws://api...')
  │ socket.onmessage = (event) => {
  │   const nuevaSolicitud = JSON.parse(event.data)
  │   setSolicitudes(prev => [...prev, nuevaSolicitud])
  │   showNotification("Nueva solicitud recibida!")
  │ }
  │
  ▼
[Módulo Solicitudes]
  • Badge rojo con número actualizado
  • Notificación visual/sonora
  • Lista actualizada automáticamente
```

### 4️⃣ Médico Acepta la Solicitud

```
┌────────────────────────────────────────────────────────────┐
│ PASO 4: Médico acepta y se crea el servicio                │
└────────────────────────────────────────────────────────────┘

[Frontend - Componente Solicitudes]
  │ Usuario hace click en "Aceptar"
  │
  ▼
[Función aceptarSolicitud()]
  
  // Actualizar solicitud
  PATCH /api/solicitudes/123
  { "estado": "aceptada" }
  
  // Crear servicio en agenda
  POST /api/servicios
  {
    "solicitudId": 123,
    "fecha": "2025-12-12",
    "hora": "10:00",
    "clinica": "Clínica VetPlus",
    "paciente": "Toby",
    "estado": "confirmado",
    "tarifa": 350
  }
  
  ▼
[Base de Datos]
  • UPDATE solicitudes SET estado='aceptada'
  • INSERT INTO servicios (...)
  
  ▼
[Notificación a Clínica]
  • Email: "Tu solicitud ha sido aceptada"
  • WebSocket: Actualización en tiempo real
  • API callback: POST a sistema de la clínica
```

### 5️⃣ Completar Servicio y Generar Factura

```
┌────────────────────────────────────────────────────────────┐
│ PASO 5: Después del servicio                               │
└────────────────────────────────────────────────────────────┘

[Médico completa el servicio]
  PATCH /api/servicios/789
  { "estado": "completado", "notas": "Ecocardiograma normal" }
  
  ▼
[Generar factura automáticamente]
  POST /api/facturas
  {
    "servicioId": 789,
    "clinicaId": 456,
    "monto": 350,
    "concepto": "Ecocardiograma Doppler - Toby"
  }
  
  ▼
[Sistema envía factura]
  • Email a la clínica con PDF
  • Disponible para descarga
  • Estado: "enviada"
```

### 6️⃣ Seguimiento de Pago

```
┌────────────────────────────────────────────────────────────┐
│ PASO 6: Control de cuentas por cobrar                      │
└────────────────────────────────────────────────────────────┘

[Módulo Finanzas]
  • Lista de facturas pendientes
  • Alertas de vencimiento
  • Cuando llega el pago → Marcar como pagada
  
  PATCH /api/facturas/FAC-001
  { "estado": "pagada", "fechaPago": "2025-12-20" }
```

---

## 🔌 Implementación con APIs

### Ejemplo: Componente con API Real

```typescript
// hooks/useServicios.ts
import { useState, useEffect } from 'react';

export function useServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicios();
    
    // WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket('wss://api.vetspecialist.com/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NUEVA_SOLICITUD') {
        // Actualizar lista automáticamente
        setServicios(prev => [...prev, data.solicitud]);
      }
    };

    return () => ws.close();
  }, []);

  const fetchServicios = async () => {
    try {
      const response = await fetch('/api/solicitudes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const aceptarSolicitud = async (id: number) => {
    try {
      // 1. Actualizar solicitud
      await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'aceptada' })
      });

      // 2. Crear servicio
      const solicitud = servicios.find(s => s.id === id);
      await fetch('/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          solicitudId: id,
          fecha: solicitud.fechaSolicitada,
          hora: solicitud.horaSolicitada,
          clinica: solicitud.clinica,
          // ... más datos
        })
      });

      // 3. Actualizar UI
      fetchServicios();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return { servicios, loading, aceptarSolicitud };
}
```

---

## 🔐 API de Integración para Clínicas

### Documentación para las Clínicas

```
📘 API VetSpecialist - Guía de Integración

Endpoint: https://api.vetspecialist.com

1. Autenticación
   POST /auth/login
   { "clinicaId": "...", "apiKey": "..." }
   → Retorna: { "token": "JWT_TOKEN" }

2. Crear Solicitud de Servicio
   POST /api/solicitudes
   Headers: Authorization: Bearer TOKEN
   Body: {
     "medicoId": "123",
     "tipo": "Ecocardiograma",
     "paciente": {...},
     "fechaSolicitada": "2025-12-12",
     "urgencia": "alta"
   }
   
   → Retorna: {
     "solicitudId": 456,
     "estado": "pendiente",
     "mensaje": "Solicitud enviada al especialista"
   }

3. Consultar Estado de Solicitud
   GET /api/solicitudes/456
   
   → Retorna: {
     "id": 456,
     "estado": "aceptada",
     "fechaConfirmada": "2025-12-12",
     "horaConfirmada": "10:00"
   }

4. Webhook (Notificaciones)
   La clínica puede registrar una URL para recibir notificaciones:
   
   POST https://clinica-vetplus.com/webhooks/vetspecialist
   {
     "evento": "solicitud_aceptada",
     "solicitudId": 456,
     "fecha": "2025-12-12",
     "hora": "10:00"
   }
```

---

## 📱 Notificaciones en Tiempo Real

### Tecnologías Disponibles

```
1. WebSockets (Recomendado)
   ✅ Bidireccional
   ✅ Tiempo real
   ✅ Baja latencia
   
2. Server-Sent Events (SSE)
   ✅ Unidireccional (servidor → cliente)
   ✅ Fácil implementación
   ⚠️  Solo del servidor al cliente
   
3. Push Notifications
   ✅ Funciona con app cerrada
   ✅ Nativos del sistema operativo
   ⚠️  Requiere permisos del usuario
   
4. Polling (No recomendado)
   ⚠️  Consume más recursos
   ⚠️  Delay entre consultas
   ✅ Más simple de implementar
```

---

## 🎯 Resumen

### Flujo Simplificado

```
1. Clínica → API POST /solicitudes
2. Backend → Guarda en DB + Notifica al médico
3. Médico → Ve solicitud en su app (WebSocket)
4. Médico → Acepta solicitud
5. Backend → Crea servicio + Notifica a clínica
6. Médico → Completa servicio
7. Sistema → Genera factura automáticamente
8. Clínica → Paga factura
9. Médico → Marca como pagada
```

### Estado Actual vs. Producción

| Característica | Actual (Mock) | Producción (Real) |
|----------------|---------------|-------------------|
| Datos | En memoria | Base de datos |
| Solicitudes | Precargadas | API de clínicas |
| Persistencia | ❌ Se pierde | ✅ Permanente |
| Notificaciones | ❌ No hay | ✅ Tiempo real |
| Multi-usuario | ❌ Un médico | ✅ Múltiples |
| Seguridad | ❌ Sin auth | ✅ JWT + Roles |

---

## 🚀 Próximos Pasos para Producción

1. **Configurar Backend**
   - Node.js + Express o Python + FastAPI
   - Base de datos PostgreSQL
   - Autenticación JWT

2. **Implementar WebSockets**
   - Socket.io para notificaciones
   - Supabase Realtime

3. **Crear API REST**
   - Endpoints CRUD completos
   - Documentación con Swagger

4. **Integración con Clínicas**
   - API Keys para autenticación
   - Webhooks para notificaciones
   - SDK/Libraries para facilitar integración

5. **Despliegue**
   - Frontend: Vercel/Netlify
   - Backend: Railway/Render/AWS
   - Base de datos: Supabase/PlanetScale
