# Configuración de Supabase - EPIC 2

Esta guía explica cómo configurar Supabase para el proyecto XTG SaaS Platform.

## Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota el **Project URL** y las **API Keys**

### 2. Obtener Credenciales

En el dashboard de Supabase:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRETO - nunca exponer)

### 3. Configurar Variables de Entorno

Agrega las siguientes variables a tu `.env.local`:

```env
# Supabase (requerido para EPIC 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Ejecutar Migraciones

Las migraciones SQL están en `supabase/migrations/`. Ejecútalas en el orden:

1. **001_initial_schema.sql** - Crea schemas y tablas
2. **002_rls_policies.sql** - Crea políticas RLS básicas
3. **003_firebase_auth_helper.sql** - Helper para Firebase Auth + RLS

**Opción 1: SQL Editor en Supabase Dashboard**
- Ve a **SQL Editor** en Supabase
- Copia y pega cada migración en orden
- Ejecuta cada una

**Opción 2: Supabase CLI** (recomendado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref your-project-ref

# Ejecutar migraciones
supabase db push
```

### 5. Verificar Configuración

Después de ejecutar las migraciones, verifica:

1. **Schemas creados:**
   - `app` - Datos multi-tenant
   - `platform` - Datos de plataforma

2. **Tablas en `app` schema:**
   - `organizations`
   - `memberships`

3. **RLS habilitado:**
   - Ambas tablas deben tener RLS activo

4. **Función helper:**
   - `app.current_firebase_uid()` debe existir

## Estructura de Base de Datos

### Schema `app`

**organizations**
- `id` (UUID, PK)
- `name` (TEXT)
- `slug` (TEXT, UNIQUE)
- `status` (TEXT, default: 'active')
- `created_at` (TIMESTAMPTZ)

**memberships**
- `id` (UUID, PK)
- `firebase_uid` (TEXT, UNIQUE) - NEXO con Firebase Auth
- `organization_id` (UUID, FK → organizations)
- `role` (TEXT) - OPS, DISPATCH, HR, SAFETY, FINANCE, DRIVER
- `status` (TEXT, default: 'active')
- `created_at` (TIMESTAMPTZ)

## Row Level Security (RLS)

Las políticas RLS garantizan que:

- Los usuarios solo ven su propia organización
- Los usuarios solo ven memberships de su organización
- El aislamiento multi-tenant está garantizado a nivel de base de datos

La función `app.current_firebase_uid()` lee el Firebase UID desde los headers HTTP (`x-firebase-uid`) que envía el cliente de Supabase.

## Uso en el Código

### Cliente para Navegador
```typescript
import { supabaseClient } from "@/lib/supabase/client";
```

### Cliente para Servidor
```typescript
import { getServerClient } from "@/lib/supabase/server";

const { client, user } = await getServerClient();
```

### Cliente Service Role (solo Platform)
```typescript
import { supabaseService } from "@/lib/supabase/service";
```

## Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar `NEXT_PUBLIC_` para variables del cliente

### Error: "RLS policy violation"
- Verifica que el usuario tenga una membership activa
- Verifica que el header `x-firebase-uid` se esté enviando correctamente

### Error: "Function app.current_firebase_uid() does not exist"
- Ejecuta la migración `003_firebase_auth_helper.sql`
- Verifica que la función esté en el schema `app`

## Próximos Pasos

Después de configurar Supabase:

1. Crear una organización de prueba
2. Crear una membership para tu usuario de Firebase
3. Probar las queries con RLS activo
4. Continuar con EPIC 3 (Roles & RBAC)

