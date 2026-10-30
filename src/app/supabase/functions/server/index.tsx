import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as db from './db.ts';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Token'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Supabase Admin Client for Auth management
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_PATH = '/make-server-91d1f360';

// Storage Helper
const getSignedUrl = async (bucket: string, path: string) => {
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketName = `make-91d1f360-${bucket}`;
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
    }

    const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 60 * 60); // 1 hour
    
    if (error) throw error;
    return data.signedUrl;
};

const getUploadUrl = async (bucket: string, path: string) => {
     // Ensure bucket exists
     const { data: buckets } = await supabase.storage.listBuckets();
     const bucketName = `make-91d1f360-${bucket}`;
     const bucketExists = buckets?.some(b => b.name === bucketName);
     
     if (!bucketExists) {
         await supabase.storage.createBucket(bucketName, { public: false });
     }

     const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUploadUrl(path);

    if (error) throw error;
    return data;
}

// Auth Middleware
const PUBLIC_PATHS = [`${BASE_PATH}/signup`, `${BASE_PATH}/register-complete`];

app.use(`${BASE_PATH}/*`, async (c, next) => {
  if (c.req.method === 'OPTIONS' || PUBLIC_PATHS.includes(c.req.path)) {
    return next();
  }

  // User identity is passed in X-User-Token header.
  // Authorization header carries publicAnonKey for the Supabase gateway.
  const userToken = c.req.header('X-User-Token');
  if (!userToken) {
    return c.json({ error: 'Sesión requerida' }, 401);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(userToken);
    if (!user) {
      return c.json({ error: 'Sesión inválida o expirada' }, 401);
    }
    c.set('user', user);
  } catch (e) {
    console.log(`Auth middleware: failed to validate user token: ${e}`);
    return c.json({ error: 'Sesión inválida o expirada' }, 401);
  }

  await next();
});

// Auth Routes
app.post(`${BASE_PATH}/signup`, async (c) => {
  const { email, password, name, userType } = await c.req.json();
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: userType }, // role: 'clinic' | 'specialist'
    email_confirm: true // Automatically confirm the user's email since an email server hasn't been configured.
  });

  if (error) {
      return c.json({ error: error.message }, 400);
  }
  return c.json({ user: data.user });
});

// Complete registration: creates user + clinic/specialist data atomically
app.post(`${BASE_PATH}/register-complete`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType, clinica, perfil, verificacion, titulo, nombre, apellido, telefono, clinicasAfiliadas } = body;

    // 1. Create user via admin API (or recover existing user from a previous failed attempt)
    let userId: string;

    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        // User was created by a previous failed registration attempt.
        // Find the existing user and update their password/metadata so login works.
        console.log(`register-complete: user ${email} already exists, recovering...`);

        const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listError) {
          console.log(`register-complete: failed to list users: ${listError.message}`);
          return c.json({ error: `No se pudo recuperar el usuario existente: ${listError.message}` }, 500);
        }

        const existingUser = listData?.users?.find((u: any) => u.email === email);
        if (!existingUser) {
          console.log(`register-complete: user ${email} reported as existing but not found in list`);
          return c.json({ error: 'El usuario existe pero no se pudo localizar. Contacta soporte.' }, 500);
        }

        // Only the owner of the account (same password) may resume a previous registration.
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
        const { error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.log(`register-complete: ${email} already registered and password does not match`);
          return c.json({ error: 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.' }, 409);
        }

        userId = existingUser.id;
        console.log(`register-complete: recovered existing user ${email} (${userId})`);
      } else {
        console.log(`register-complete: auth error creating user ${email}: ${authError.message}`);
        return c.json({ error: authError.message }, 400);
      }
    } else {
      userId = userData.user.id;
      console.log(`register-complete: user created ${email} (${userId}), type=${userType}`);
    }

    // 2. Create associated data in KV store (skip if already exists from previous attempt)
    if (userType === 'clinic' && clinica) {
      // Check if a clinic for this owner already exists
      const existingClinicas = await db.getByPrefix('clinicas:');
      const alreadyExists = existingClinicas.find((c: any) => c.ownerId === userId);

      if (alreadyExists) {
        console.log(`register-complete: clinica already exists for user ${userId}, returning existing`);
        return c.json({ success: true, userId, clinicaId: alreadyExists.id, clinica: alreadyExists });
      }

      const clinicaId = clinica.id || crypto.randomUUID();
      const clinicaRecord = {
        id: clinicaId,
        nombre: clinica.nombre,
        tipo: clinica.tipo,
        contacto: email,
        telefono: clinica.telefono || '',
        direccion: clinica.direccion || '',
        ciudad: clinica.ciudad || '',
        color: 'blue',
        ownerId: userId,
        serviciosNecesarios: clinica.serviciosNecesarios || [],
        horario: clinica.horario || {},
        diasOperacion: clinica.diasOperacion || [],
      };
      await db.set(`clinicas:${clinicaId}`, clinicaRecord);
      console.log(`register-complete: clinica created ${clinica.nombre} (${clinicaId})`);
      return c.json({ success: true, userId, clinicaId, clinica: clinicaRecord });
    } else {
      // Specialist registration — check if specialist already exists for this email
      let especialistaId = null;
      const existingEspecialistas = await db.getByPrefix('especialistas:');
      const alreadyExists = existingEspecialistas.find((e: any) => e.email === email);

      if (alreadyExists) {
        console.log(`register-complete: especialista already exists for ${email}, skipping creation`);
        especialistaId = alreadyExists.id;
      } else if (perfil) {
        especialistaId = Date.now();
        const especialistaRecord = {
          id: especialistaId,
          nombre: nombre,
          apellido: apellido,
          especialidad: perfil.especialidadPrincipal,
          email: email,
          telefono: telefono || '',
          tarifa: perfil.tarifaConsulta || 0,
          experiencia: perfil.anosExperiencia || 0,
          descripcion: perfil.bio || '',
          ciudad: perfil.ciudad || '',
          modalidad: perfil.modalidad || [],
          activo: true,
          rating: 0,
          serviciosRealizados: 0,
          verificacion: verificacion || { estado: 'pendiente' },
          ownerId: userId,
        };
        await db.set(`especialistas:${especialistaId}`, especialistaRecord);
        console.log(`register-complete: especialista created ${nombre} ${apellido} (${especialistaId})`);
      }

      // Affiliated clinics — check existing before creating
      const createdClinicas: any[] = [];
      if (clinicasAfiliadas && Array.isArray(clinicasAfiliadas) && clinicasAfiliadas.length > 0) {
        const existingClinicas = await db.getByPrefix('clinicas:');
        const ownerClinicas = existingClinicas.filter((c: any) => c.ownerId === userId);

        if (ownerClinicas.length > 0) {
          console.log(`register-complete: ${ownerClinicas.length} affiliated clinicas already exist for user ${userId}`);
          createdClinicas.push(...ownerClinicas);
        } else {
          for (const cl of clinicasAfiliadas) {
            const clId = cl.id || crypto.randomUUID();
            const clRecord = {
              id: clId,
              nombre: cl.nombre,
              contacto: cl.contacto || '',
              telefono: '',
              direccion: '',
              ciudad: cl.ciudad || '',
              color: 'blue',
              ownerId: userId,
            };
            await db.set(`clinicas:${clId}`, clRecord);
            createdClinicas.push(clRecord);
          }
          console.log(`register-complete: ${createdClinicas.length} affiliated clinicas created`);
        }
      }

      return c.json({ success: true, userId, especialistaId, clinicas: createdClinicas });
    }
  } catch (err: any) {
    console.log(`register-complete: unexpected error: ${err.message}`);
    return c.json({ error: err.message || 'Error interno en registro' }, 500);
  }
});

// Specific routes FIRST (before generic CRUD to avoid :id capturing them)

// Acceso a datos por usuario.
// Un registro es visible si: es del usuario (ownerId), está dirigido a su ficha de especialista,
// pertenece a una clínica suya, o cuelga de un registro visible (solicitud → servicio → factura → pago).
// Los registros antiguos sin ownerId siguen visibles para todos, salvo los que llegan por integración.
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

const esSuperAdmin = (user: any) =>
    user?.app_metadata?.role === 'admin' ||
    ADMIN_EMAILS.includes(String(user?.email || '').toLowerCase());

const RECURSOS_COMPARTIDOS = new Set(['especialistas', 'roles']);

const RECURSO_PADRE: Record<string, { recurso: string; campo: string }> = {
    servicios: { recurso: 'solicitudes', campo: 'solicitudId' },
    facturas: { recurso: 'servicios', campo: 'servicioId' },
    pagos: { recurso: 'facturas', campo: 'facturaId' },
    conciliaciones: { recurso: 'facturas', campo: 'facturaId' },
};

const crearAcceso = (user: any) => {
    const cargas = new Map<string, Promise<any[]>>();
    const cargar = (recurso: string) => {
        if (!cargas.has(recurso)) cargas.set(recurso, db.getByPrefix(`${recurso}:`));
        return cargas.get(recurso)!;
    };

    let contexto: Promise<{ esp: Set<string>; clin: Set<string> }> | null = null;
    const obtenerContexto = () => contexto ??= (async () => {
        const email = String(user?.email || '').toLowerCase();
        const [esps, clins] = await Promise.all([cargar('especialistas'), cargar('clinicas')]);
        return {
            esp: new Set(esps
                .filter((e: any) => email && String(e?.email || '').toLowerCase() === email)
                .map((e: any) => String(e.id))),
            clin: new Set(clins
                .filter((cl: any) => cl?.ownerId && cl.ownerId === user?.id)
                .map((cl: any) => String(cl.id))),
        };
    })();

    const visiblesPorRecurso = new Map<string, Promise<Set<string>>>();
    const idsVisibles = (recurso: string): Promise<Set<string>> => {
        if (!visiblesPorRecurso.has(recurso)) {
            visiblesPorRecurso.set(recurso, (async () => {
                const items = await cargar(recurso);
                const ids = new Set<string>();
                for (const item of items) {
                    if (await puedeVer(recurso, item)) ids.add(String(item.id));
                }
                return ids;
            })());
        }
        return visiblesPorRecurso.get(recurso)!;
    };

    const puedeVer = async (recurso: string, item: any): Promise<boolean> => {
        if (!item) return false;
        if (esSuperAdmin(user) || RECURSOS_COMPARTIDOS.has(recurso)) return true;
        if (item.ownerId && item.ownerId === user?.id) return true;

        const ctx = await obtenerContexto();
        const enEsp = (v: any) => v != null && ctx.esp.has(String(v));
        if (enEsp(item.especialistaId) || enEsp(item.doctorPropietario?.id) || enEsp(item.doctorSolicitante?.id)) return true;
        if (item.clinicaId != null && ctx.clin.has(String(item.clinicaId))) return true;

        const padre = RECURSO_PADRE[recurso];
        if (padre && item[padre.campo] != null) {
            const ids = await idsVisibles(padre.recurso);
            if (ids.has(String(item[padre.campo]))) return true;
        }

        if (item.ownerId) return false;
        if (item.origen?.tipo === 'integracion') return false;
        return true;
    };

    const puedeModificar = async (recurso: string, item: any): Promise<boolean> => {
        if (esSuperAdmin(user)) return true;
        if (recurso === 'especialistas') {
            if (item.ownerId) return item.ownerId === user?.id;
            const email = String(user?.email || '').toLowerCase();
            return !item.email || (!!email && String(item.email).toLowerCase() === email);
        }
        return puedeVer(recurso, item);
    };

    return { cargar, puedeVer, puedeModificar };
};

const sinOwner = (body: any) => {
    const { ownerId: _ownerId, ...resto } = body || {};
    return resto;
};

// Generic CRUD handler factory
const createHandler = (prefix: string) => {
    return {
        list: async (c: any) => {
            const user = c.get('user');
            const acceso = crearAcceso(user);
            const data = await acceso.cargar(prefix);

            const visibles: any[] = [];
            for (const item of data) {
                if (await acceso.puedeVer(prefix, item)) visibles.push(item);
            }

            const role = user?.user_metadata?.rol || 'admin';
            const sedesIds = user?.user_metadata?.sedesIds || [];
            if (role === 'admin') return c.json(visibles);

            return c.json(visibles.filter((item: any) => {
                if (!item.sedeId) return true;
                return sedesIds.includes(item.sedeId);
            }));
        },
        create: async (c: any) => {
            const user = c.get('user');
            const body = await c.req.json();
            const id = body.id || crypto.randomUUID();
            const key = `${prefix}:${id}`;

            const existente = await db.get(key);
            if (existente) {
                const acceso = crearAcceso(user);
                if (!(await acceso.puedeModificar(prefix, existente))) {
                    return c.json({ error: 'No autorizado' }, 403);
                }
                const ownerId = existente.ownerId;
                await db.set(key, { ...sinOwner(body), id, ...(ownerId ? { ownerId } : {}) });
                return c.json({ success: true, id });
            }

            await db.set(key, { ...sinOwner(body), id, ownerId: user.id });
            return c.json({ success: true, id });
        },
        update: async (c: any) => {
            const user = c.get('user');
            const id = c.req.param('id');
            const body = await c.req.json();
            const key = `${prefix}:${id}`;

            const existente = await db.get(key);
            if (existente && !(await crearAcceso(user).puedeModificar(prefix, existente))) {
                return c.json({ error: 'No autorizado' }, 403);
            }
            const ownerId = existente ? existente.ownerId : user.id;
            await db.set(key, { ...sinOwner(body), id, ...(ownerId ? { ownerId } : {}) });
            return c.json({ success: true });
        },
        delete: async (c: any) => {
            const user = c.get('user');
            const id = c.req.param('id');
            const key = `${prefix}:${id}`;

            const existente = await db.get(key);
            if (existente && !(await crearAcceso(user).puedeModificar(prefix, existente))) {
                return c.json({ error: 'No autorizado' }, 403);
            }
            await db.del(key);
            return c.json({ success: true });
        }
    }
};

// Profile endpoint - user-scoped
app.put(`${BASE_PATH}/perfil/current`, async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.id || 'anonymous';
        const body = await c.req.json();
        await db.set(`perfil:${userId}`, { ...body, userId });
        return c.json({ success: true });
    } catch (e: any) {
        console.log(`perfil/current PUT error: ${e.message}`);
        return c.json({ error: e.message }, 500);
    }
});

// Configuracion fiscal - user-scoped
app.get(`${BASE_PATH}/configuracion-fiscal`, async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.id || 'anonymous';
        const data = await db.getByPrefix(`config-fiscal:${userId}`);
        return c.json(data.length > 0 ? data[0] : null);
    } catch (e: any) {
        console.log(`configuracion-fiscal GET error: ${e.message}`);
        return c.json(null);
    }
});

app.put(`${BASE_PATH}/configuracion-fiscal`, async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.id || 'anonymous';
        const body = await c.req.json();
        await db.set(`config-fiscal:${userId}`, { ...body, userId });
        return c.json({ success: true });
    } catch (e: any) {
        console.log(`configuracion-fiscal PUT error: ${e.message}`);
        return c.json({ error: e.message }, 500);
    }
});

// Configuracion agenda - user-scoped
app.get(`${BASE_PATH}/configuracion-agenda`, async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.id || 'anonymous';
        const data = await db.getByPrefix(`config-agenda:${userId}`);
        return c.json(data.length > 0 ? data[0] : null);
    } catch (e: any) {
        console.log(`configuracion-agenda GET error: ${e.message}`);
        return c.json(null);
    }
});

app.put(`${BASE_PATH}/configuracion-agenda`, async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.id || 'anonymous';
        const body = await c.req.json();
        await db.set(`config-agenda:${userId}`, { ...body, userId });
        return c.json({ success: true });
    } catch (e: any) {
        console.log(`configuracion-agenda PUT error: ${e.message}`);
        return c.json({ error: e.message }, 500);
    }
});

// Facturas series
app.get(`${BASE_PATH}/facturas-series`, async (c) => {
    try {
        const data = await db.getByPrefix('facturas-series:');
        return c.json(data);
    } catch (e: any) {
        console.log(`facturas-series GET error: ${e.message}`);
        return c.json([]);
    }
});

// Generic CRUD handlers (after specific routes)
const resources = ['solicitudes', 'servicios', 'facturas', 'gastos', 'clinicas', 'sedes', 'usuarios', 'especialistas', 'accesos', 'notificaciones', 'roles', 'pagos', 'conciliaciones', 'facturacion-recurrente', 'descuentos', 'perfil', 'configuracion-servicios'];
resources.forEach(resource => {
    const handler = createHandler(resource);
    app.get(`${BASE_PATH}/${resource}`, handler.list);
    app.post(`${BASE_PATH}/${resource}`, handler.create);
    app.put(`${BASE_PATH}/${resource}/:id`, handler.update);
    app.delete(`${BASE_PATH}/${resource}/:id`, handler.delete);
});

// Storage Endpoints
const BUCKETS_PERMITIDOS = ['comprobantes'];

app.post(`${BASE_PATH}/storage/upload-url`, async (c) => {
    const { bucket, path } = await c.req.json();
    if (!BUCKETS_PERMITIDOS.includes(bucket)) return c.json({ error: 'Bucket no permitido' }, 403);
    try {
        const result = await getUploadUrl(bucket, path);
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post(`${BASE_PATH}/storage/signed-url`, async (c) => {
    const { bucket, path } = await c.req.json();
    if (!BUCKETS_PERMITIDOS.includes(bucket)) return c.json({ error: 'Bucket no permitido' }, 403);
    try {
        const url = await getSignedUrl(bucket, path);
        return c.json({ url });
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

// Bulk create for seeding
app.post(`${BASE_PATH}/seed`, async (c) => {
    if (!esSuperAdmin(c.get('user'))) return c.json({ error: 'Solo administradores' }, 403);
    const { type, data } = await c.req.json();
    if (!Array.isArray(data)) return c.json({ error: 'Data must be an array' }, 400);
    
    // Check if data already exists to avoid overwriting? 
    // For seeding, we might want to overwrite or skip.
    // Let's just loop and set.
    
    for (const item of data) {
        const id = item.id;
        await db.set(`${type}:${id}`, item);
    }
    
    return c.json({ success: true, count: data.length });
});

// Asigna al administrador los registros antiguos que no tienen dueño (ownerId).
// No toca las solicitudes que llegaron por integración ni los recursos compartidos.
const RECURSOS_CON_DUENO = [
    'solicitudes', 'servicios', 'facturas', 'gastos', 'clinicas', 'sedes', 'usuarios',
    'accesos', 'notificaciones', 'pagos', 'conciliaciones', 'facturacion-recurrente',
    'descuentos', 'configuracion-servicios',
];

app.post(`${BASE_PATH}/admin/asignar-dueno`, async (c) => {
    const user = c.get('user');
    if (!esSuperAdmin(user)) return c.json({ error: 'Solo administradores' }, 403);
    try {
        const resumen: Record<string, number> = {};
        let total = 0;
        for (const recurso of RECURSOS_CON_DUENO) {
            const filas = await db.getKeysByPrefix(`${recurso}:`);
            const huerfanas = filas.filter((f: any) =>
                f?.value && typeof f.value === 'object' && !f.value.ownerId && f.value.origen?.tipo !== 'integracion');
            await Promise.all(huerfanas.map((f: any) => db.set(f.key, { ...f.value, ownerId: user.id })));
            if (huerfanas.length > 0) resumen[recurso] = huerfanas.length;
            total += huerfanas.length;
        }
        return c.json({ success: true, total, resumen });
    } catch (e: any) {
        console.log(`asignar-dueno error: ${e.message}`);
        return c.json({ error: e.message }, 500);
    }
});

// Reset Data Endpoint
app.post(`${BASE_PATH}/reset-data`, async (c) => {
    if (!esSuperAdmin(c.get('user'))) return c.json({ error: 'Solo administradores' }, 403);
    try {
        const resources = [
            'solicitudes', 'servicios', 'facturas', 'gastos', 'clinicas', 
            'sedes', 'usuarios', 'especialistas', 'accesos', 'notificaciones', 
            'roles', 'pagos', 'conciliaciones', 'facturacion-recurrente', 
            'descuentos', 'perfil'
        ];

        let totalDeleted = 0;

        for (const resource of resources) {
            const items = await db.getByPrefix(`${resource}:`);
            const keys = items.map((item: any) => `${resource}:${item.id}`);
            
            if (keys.length > 0) {
                // mdel is not available in db.ts, so we use del in parallel
                await Promise.all(keys.map((key: string) => db.del(key)));
                totalDeleted += keys.length;
            }
        }

        return c.json({ success: true, message: `Se eliminaron ${totalDeleted} registros.` });
    } catch (e: any) {
        console.log(`reset-data error: ${e.message}`);
        return c.json({ error: e.message }, 500);
    }
});

Deno.serve(app.fetch);