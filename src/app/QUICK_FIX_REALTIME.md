# ⚡ Solución Rápida: Habilitar Realtime

## 🎯 El Problema

Ves este mensaje en la consola:
```
⚠️ Realtime no respondió en 10s, cambiando a Polling...
```

**Causa:** Realtime no está habilitado en la tabla `kv_store_91d1f360` de Supabase.

**Solución:** 2 minutos de configuración.

---

## ✅ Solución en 3 Pasos

### Paso 1: Abre SQL Editor

1. Ve a tu **Dashboard de Supabase**
2. En el menú izquierdo, busca el icono **`</>`** (SQL Editor)
3. Haz clic en **"+ New query"**

![SQL Editor Location](https://supabase.com/docs/img/sql-editor.png)

---

### Paso 2: Ejecuta este SQL

Copia y pega este código en el editor:

```sql
-- Habilitar Realtime para la tabla kv_store
ALTER PUBLICATION supabase_realtime ADD TABLE kv_store_91d1f360;
```

Luego haz clic en **"Run"** (o presiona `Ctrl + Enter`)

---

### Paso 3: Verifica que funcionó

Ejecuta este query:

```sql
-- Verificar que Realtime está habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_91d1f360';
```

**Deberías ver:**

```
schemaname | tablename
-----------+-----------------
public     | kv_store_91d1f360
```

✅ **¡Listo!** Ahora recarga tu aplicación (F5).

---

## 🎉 Resultado Esperado

Después de recargar, en la **consola del navegador** (F12) deberías ver:

```
🔄 Intentando iniciar Supabase Realtime...
✅ Canal de Pagos: Subscrito correctamente
✅ Canal de Facturas: Subscrito correctamente
✅ Canal de Servicios: Subscrito correctamente
✅ Canal de Solicitudes: Subscrito correctamente
```

Y en el **header de la aplicación**, el indicador WiFi estará **verde con pulso** 🟢

---

## 🐛 Si algo sale mal

### Error: "relation does not exist"

**Causa:** La tabla `kv_store_91d1f360` no existe todavía.

**Solución:** Usa la aplicación primero (modo demo) para que se cree la tabla, luego ejecuta el SQL.

---

### Error: "permission denied"

**Causa:** No tienes permisos de admin en el proyecto.

**Solución:** Asegúrate de estar usando el usuario administrador del proyecto.

---

### Sigo viendo el warning de Polling

**Solución:**
1. Asegúrate de que el query devolvió resultados
2. Recarga la aplicación con `Ctrl + Shift + R` (hard reload)
3. Verifica en la consola si hay otros errores

---

## 🔵 Alternativa: Quedarse con Polling

Si no quieres configurar Realtime, **no hagas nada**.

**El sistema funciona perfectamente con Polling:**
- ✅ Actualización automática cada 5 segundos
- ✅ Sin configuración adicional
- ✅ Suficiente para demos y testing

**Diferencias:**
- Realtime: < 200ms de latencia
- Polling: 0-5 segundos de latencia

---

## 📚 Más Información

- **Setup completo:** `/SETUP_REALTIME.md`
- **Documentación técnica:** `/REALTIME_SYNC.md`
- **Resumen:** `/REALTIME_SUMMARY.md`

---

**¿Necesitas ayuda?** Abre la consola del navegador (F12) y comparte los logs que ves.
