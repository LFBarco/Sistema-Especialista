# Configuración de Autenticación - Web App Veterinaria

## ⚠️ ERROR ACTUAL: "Unsupported provider: provider is not enabled"

Este error ocurre porque **los proveedores de autenticación no están habilitados en Supabase**. Sigue estas instrucciones para solucionarlo.

---

## 📋 Solución: Habilitar Email Provider (Recomendado)

### Paso 1: Acceder al Dashboard de Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"Authentication"**
4. Selecciona **"Providers"**

### Paso 2: Habilitar Email Provider
1. En la lista de proveedores, busca **"Email"**
2. Haz clic en el proveedor **"Email"**
3. Activa el toggle **"Enable Email provider"**
4. **IMPORTANTE:** También activa **"Confirm email"** si quieres que los usuarios verifiquen su email (opcional para pruebas)
5. Haz clic en **"Save"** para guardar los cambios

### Paso 3: Crear un usuario de prueba
Una vez habilitado el Email Provider, puedes crear un usuario de prueba de dos formas:

#### Opción A: Desde el Dashboard de Supabase
1. Ve a **Authentication** → **Users**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Ingresa:
   - Email: `test@vetapp.com`
   - Password: `Test123456!`
   - Confirm password: `Test123456!`
4. (Opcional) Desactiva **"Auto Confirm User"** si quieres simular verificación de email
5. Haz clic en **"Create user"**

#### Opción B: Desde la aplicación
1. Usa el botón de registro en la app
2. El servidor creará el usuario automáticamente con `email_confirm: true` (línea 93 en `/supabase/functions/server/index.tsx`)

### Paso 4: Probar el login
1. Recarga la página de login
2. Ingresa las credenciales del usuario de prueba
3. Deberías poder acceder al sistema sin errores

---

## 🔐 Alternativa: Habilitar Google OAuth (Opcional)

Si prefieres usar Google OAuth en lugar de Email/Password, sigue estos pasos:

### Paso 1: Configurar Google OAuth en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**
4. Ve a **APIs & Services** → **Credentials**
5. Crea un **OAuth 2.0 Client ID**
6. Configura el **Authorized redirect URI** como:
   ```
   https://<TU_PROJECT_ID>.supabase.co/auth/v1/callback
   ```
7. Copia el **Client ID** y **Client Secret**

### Paso 2: Configurar Google Provider en Supabase
1. Ve a Supabase Dashboard → **Authentication** → **Providers**
2. Busca y haz clic en **"Google"**
3. Activa el toggle **"Enable Google provider"**
4. Pega el **Client ID** y **Client Secret** de Google
5. Haz clic en **"Save"**

### Paso 3: Probar Google Login
1. Recarga la app
2. Haz clic en el botón **"Google Workspace"**
3. Serás redirigido a Google para autenticarte

---

## 🧪 Credenciales de Prueba Sugeridas

Para facilitar las pruebas, usa estas credenciales:

### Usuario Especialista
- **Email:** `especialista@vetapp.com`
- **Password:** `Vet2026!Specialist`
- **Rol:** Veterinario Especialista

### Usuario Clínica
- **Email:** `clinica@vetapp.com`
- **Password:** `Vet2026!Clinic`
- **Rol:** Administrador de Clínica

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Supabase Auth - Email Provider](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase Auth - Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Auth - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Archivos Relevantes en el Proyecto
- **Backend Auth:** `/supabase/functions/server/index.tsx` (líneas 86-100)
- **Frontend Auth:** `/App.tsx` (líneas 1954-2017)
- **UI de Login:** `/components/PremiumLogin.tsx`

---

## 🚨 Troubleshooting

### Error: "Invalid login credentials"
**Solución:** Verifica que el usuario exista en Supabase Dashboard → Authentication → Users

### Error: "Email not confirmed"
**Solución:** 
1. Ve a Supabase Dashboard → Authentication → Users
2. Busca el usuario
3. Haz clic en los 3 puntos → **"Confirm email"**

### Error: "User already registered"
**Solución:** Usa credenciales diferentes o elimina el usuario existente en el Dashboard

### El banner de configuración no aparece
**Solución:** Haz clic en el banner azul/morado que dice **"¿Problemas al iniciar sesión?"**

---

## ✅ Checklist de Configuración

- [ ] Email Provider habilitado en Supabase
- [ ] Usuario de prueba creado
- [ ] Login con Email/Password funcional
- [ ] (Opcional) Google OAuth configurado
- [ ] Bucket `make-91d1f360-comprobantes` creado automáticamente
- [ ] Variables de entorno configuradas (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.)

---

## 💡 Próximos Pasos

Una vez que el login funcione correctamente:

1. **Registro de usuarios:** Usa el flujo de registro desde la UI
2. **Gestión de clínicas:** Asigna clínicas a usuarios en el Dashboard
3. **Row Level Security:** Configura políticas RLS para proteger datos sensibles
4. **Confirmación de email:** Configura un servidor SMTP para envío de emails

---

**Última actualización:** 8 de febrero de 2026
