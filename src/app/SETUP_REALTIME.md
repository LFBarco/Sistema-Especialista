# 🚀 Configuración de Supabase Realtime - Guía Paso a Paso

## 📌 Resumen

La aplicación ahora tiene **sincronización en tiempo real** entre portales. Para que funcione correctamente, necesitas habilitar **Realtime** en Supabase.

**🎯 Si no lo configuras:** El sistema automáticamente cambiará a **modo Polling** (actualización cada 5 segundos), que funciona perfectamente pero no es instantáneo.

---

## ✅ Opción 1: Habilitar Realtime en Supabase (Recomendado)

### Paso 1: Abrir SQL Editor

1. Ve a tu **Dashboard de Supabase**
2. En el sidebar izquierdo, haz clic en **SQL Editor** (icono `</>`)
3. Crea una nueva query (botón "+ New query")

### Paso 2: Verificar Estado Actual

Ejecuta este query para ver si Realtime ya está habilitado:

```sql
-- Verificar si la tabla tiene Realtime habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_91d1f360';
```

**Resultados posibles:**

#### ✅ Si devuelve resultados:
```
schemaname | tablename
-----------+-----------------
public     | kv_store_91d1f360
```
**¡Perfecto!** Realtime ya está habilitado. No necesitas hacer nada más.

#### ❌ Si NO devuelve resultados:
Continúa con el Paso 3.

---

### Paso 3: Habilitar Realtime

Si el query anterior no devolvió resultados, ejecuta:

```sql
-- Habilitar Realtime para la tabla kv_store
ALTER PUBLICATION supabase_realtime ADD TABLE kv_store_91d1f360;
```

**Deberías ver:**
```
✅ Success. No rows returned
```

---

### Paso 4: Verificar que Funciona

Ejecuta de nuevo el query del Paso 2:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_91d1f360';
```

Ahora **SÍ** debería devolver:
```
schemaname | tablename
-----------+-----------------
public     | kv_store_91d1f360
```

---

### Paso 5: Recargar la Aplicación

1. Vuelve a tu aplicación
2. Recarga la página (F5)
3. Abre la **consola del navegador** (F12)
4. Deberías ver:

```
🔄 Intentando iniciar Supabase Realtime...
✅ Canal de Pagos: Subscrito correctamente
✅ Canal de Facturas: Subscrito correctamente
✅ Canal de Servicios: Subscrito correctamente
✅ Canal de Solicitudes: Subscrito correctamente
```

---

## 🔵 Opción 2: Usar Modo Polling (Automático)

Si **NO puedes o NO quieres** habilitar Realtime en Supabase:

### ✅ El sistema automáticamente usa Polling

**Características:**
- ✅ Actualización automática cada **5 segundos**
- ✅ **Sin configuración** necesaria
- ✅ Funciona en **todos los planes** de Supabase
- ⚠️ Latencia de 0-5 segundos (vs instantáneo)

**Cómo verificar que está en Polling:**

1. Abre la consola del navegador (F12)
2. Deberías ver:

```
🔄 Intentando iniciar Supabase Realtime...
⚠️ Realtime no respondió en 10s, cambiando a Polling...
🔄 Iniciando polling cada 5 segundos...
```

3. En el header de la aplicación, verás el indicador de sincronización
4. Haz clic en el icono WiFi para ver detalles

---

## 🎨 Indicador Visual

En la esquina superior derecha del **header**, junto a las notificaciones:

### 🟢 Icono Verde con Pulso
- **Realtime activo** → Sincronización instantánea
- **Polling activo** → Auto-refresh cada 5s

### 🔴 Icono Rojo
- Sin sincronización (recarga la página)

**Haz clic en el indicador** para ver:
- Modo de sincronización actual
- Número de canales activos
- Descripción de features

---

## 🧪 Cómo Probar la Sincronización

### Test con 2 Ventanas

1. **Abre dos ventanas del navegador**
   - Ventana A: Portal Especialista
   - Ventana B: Portal Clínica

2. **En Ventana A (Especialista)**
   - Ve a "Conciliación Financiera"
   - Busca una factura pendiente
   - Registra un pago

3. **En Ventana B (Clínica)**
   - Ve a "Estado de Cuenta"
   - **Con Realtime:** Verás el cambio INSTANTÁNEAMENTE
   - **Con Polling:** Verás el cambio en máximo 5 segundos
   - Recibirás notificación: 💰 "Nuevo pago registrado"

---

## 🐛 Troubleshooting

### ❌ Problema: "CHANNEL_ERROR" en consola

**Causa:** Realtime no está habilitado en la tabla.

**Solución:**
1. Ejecuta el query del Paso 3 (ALTER PUBLICATION)
2. Recarga la aplicación
3. Si persiste, verifica que estás en el proyecto correcto

---

### ❌ Problema: No veo cambios entre ventanas

**Causa:** Puede que estés viendo datos cacheados.

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica si ves logs de cambios:
   ```
   💰 Cambio detectado en Pagos: {...}
   ```
3. Si no ves logs, verifica el indicador de sincronización
4. Haz clic en el indicador WiFi para ver el estado

---

### ❌ Problema: "Realtime no respondió en 10s"

**Causa:** La publicación de Realtime no incluye la tabla.

**Soluciones:**

#### Opción A: Verificar publicación
```sql
-- Ver todas las tablas en la publicación
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

#### Opción B: Recrear publicación
```sql
-- Solo si la publicación está corrupta
ALTER PUBLICATION supabase_realtime DROP TABLE kv_store_91d1f360;
ALTER PUBLICATION supabase_realtime ADD TABLE kv_store_91d1f360;
```

#### Opción C: Usar Polling
- No hagas nada, el sistema automáticamente usa Polling
- Funciona perfectamente para la mayoría de casos

---

## 📊 Comparación: Realtime vs Polling

| Característica | Realtime | Polling |
|---------------|----------|---------|
| **Latencia** | < 200ms | 0-5s |
| **Uso de red** | Bajo (WebSocket) | Medio (HTTP cada 5s) |
| **Escalabilidad** | Alta | Media |
| **Configuración** | Requiere SQL | Automática |
| **Compatibilidad** | Requiere plan compatible | Todos los planes |
| **Recomendado para** | Producción | Demo/Testing |

---

## 🎯 Recomendación

### Para Producción
✅ **Habilita Realtime** (Paso 1-5)
- Mejor experiencia de usuario
- Sincronización instantánea
- Menor uso de red

### Para Testing/Demo
✅ **Deja que use Polling automáticamente**
- Sin configuración
- Funciona inmediatamente
- Suficiente para demos

---

## 📚 Referencias

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres Publications](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Realtime Quotas](https://supabase.com/docs/guides/realtime/quotas)

---

## ✅ Checklist Final

- [ ] Ejecuté el query de verificación
- [ ] Si era necesario, ejecuté ALTER PUBLICATION
- [ ] Recargué la aplicación
- [ ] Veo logs en la consola
- [ ] El indicador de sincronización está verde
- [ ] Probé con 2 ventanas y funciona

---

**Última actualización:** 8 de Febrero, 2026  
**Versión:** 1.0.0  
**Soporte:** Si tienes problemas, revisa la consola del navegador para ver logs detallados
