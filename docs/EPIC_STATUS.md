# EPIC Status - XTG SaaS Platform

Este documento rastrea el estado de implementación de cada EPIC del proyecto.

---

## EPIC 0 — Repository & Project Foundation

**Estado**: ✅ COMPLETED

**Fecha de completado**: 2024-12-29

### Completado

- ✅ Next.js 16.1.1 con TypeScript strict
- ✅ TailwindCSS configurado con tokens SVL
- ✅ shadcn/ui instalado y configurado
- ✅ Estructura de carpetas completa
- ✅ Layouts base (Platform, Admin, Driver, Auth)
- ✅ Environment validation (Zod)
- ✅ Logging utility
- ✅ Design tokens documentados

---

## EPIC 1 — Authentication (Firebase)

**Estado**: ✅ COMPLETED

**Fecha de completado**: 2024-12-29

### Implementación

#### Variables de Entorno Requeridas

**Firebase (Cliente)**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Firebase (Server / Admin)**
```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Auth Cookie**
```env
AUTH_COOKIE_NAME=xtg_session
AUTH_COOKIE_SECURE=false  # true en producción
AUTH_COOKIE_MAX_AGE=604800  # 7 días en segundos
```

#### Flujo de Sesión

1. **Login**
   - Usuario ingresa email/password en `/auth/login`
   - Cliente autentica con Firebase Auth (`signInWithEmailAndPassword`)
   - Cliente obtiene `idToken`
   - Cliente llama `POST /api/auth/session` con `idToken`
   - Server crea Firebase Session Cookie usando `firebase-admin`
   - Server setea cookie `httpOnly`, `secure`, `sameSite=lax`
   - Cliente redirige a `/admin` (o ruta original)

2. **Verificación Server-Side**
   - Cada request protegido verifica cookie en middleware
   - Server components llaman `getCurrentUser()` que verifica cookie con `firebaseAdminAuth.verifySessionCookie()`
   - Si cookie válida → retorna `DecodedIdToken`
   - Si cookie inválida/expirada → retorna `null`

3. **Logout**
   - Cliente llama `POST /api/auth/logout`
   - Server elimina cookie
   - Cliente redirige a `/auth/login`

#### Archivos Creados

- `lib/firebase/config.ts` - Configuración Firebase cliente
- `lib/firebase/auth.ts` - Firebase Auth cliente
- `lib/firebase/admin.ts` - Firebase Admin SDK server
- `lib/auth/session.ts` - Utilidades de sesión (`getCurrentUser`, `getSessionCookie`)
- `middleware.ts` - Protección de rutas
- `app/api/auth/session/route.ts` - Endpoint crear session cookie
- `app/api/auth/logout/route.ts` - Endpoint logout
- `app/api/auth/me/route.ts` - Endpoint verificar usuario actual
- `app/(auth)/login/page.tsx` - Página de login
- `components/auth/LogoutButton.tsx` - Componente logout

#### Security Best Practices Implementadas

- ✅ Session cookies `httpOnly` (no accesibles desde JavaScript)
- ✅ No uso de localStorage para sesión
- ✅ Verificación server-side de tokens
- ✅ Clave privada Firebase solo en env (no en repo)
- ✅ Middleware solo verifica presencia de cookie (verificación real server-side)

---

## EPIC 2 — Supabase + Multi-Tenant Core + RLS

**Estado**: ✅ COMPLETED

**Fecha de completado**: 2024-12-29

### Implementación

#### Variables de Entorno Requeridas

**Supabase**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Estructura de Base de Datos

**Schemas:**
- `app` - Datos de la aplicación (multi-tenant)
- `platform` - Datos de la plataforma (SaaS owner)

**Tablas en `app` schema:**
- `organizations` - Organizaciones (tenants)
- `memberships` - Relación Firebase UID ↔ Organización (con roles)

**Índices críticos:**
- `idx_memberships_firebase_uid` - Búsqueda rápida por Firebase UID
- `idx_memberships_org_id` - Búsqueda por organización
- `idx_memberships_org_status` - Filtrado por org y status

#### Row Level Security (RLS)

**Políticas implementadas:**
- Usuarios solo ven su propia organización
- Usuarios solo ven memberships de su organización
- Usuarios pueden actualizar su propia membership

**Función helper:**
- `app.current_firebase_uid()` - Obtiene Firebase UID desde headers para RLS

#### Archivos Creados

**Migraciones:**
- `supabase/migrations/001_initial_schema.sql` - Schemas y tablas iniciales
- `supabase/migrations/002_rls_policies.sql` - Políticas RLS básicas
- `supabase/migrations/003_firebase_auth_helper.sql` - Helper para Firebase Auth + RLS

**Clientes Supabase:**
- `lib/supabase/client.ts` - Cliente para navegador (con RLS)
- `lib/supabase/server.ts` - Cliente para servidor (con contexto de usuario)
- `lib/supabase/service.ts` - Cliente service role (solo Platform, bypass RLS)

**Funciones Helper:**
- `lib/db/organizations.ts` - Funciones para obtener organizaciones
- `lib/db/memberships.ts` - Funciones para gestionar memberships

#### Security Best Practices Implementadas

- ✅ RLS habilitado en todas las tablas del schema `app`
- ✅ Políticas RLS basadas en Firebase UID
- ✅ Aislamiento multi-tenant a nivel de base de datos
- ✅ Service role solo para operaciones de Platform
- ✅ Validación de acceso a nivel de aplicación

#### Próximos Pasos (EPIC 3)

- Refinar políticas RLS según roles (RBAC)
- Implementar guards server-side
- Crear sistema de permisos

---

## EPIC 3 — Roles & RBAC Enforcement

**Estado**: ✅ COMPLETED

**Fecha de completado**: 2024-12-29

### Implementación

#### Roles Definidos

**DSP Roles (app-level):**
- `OPS` - Operations manager (full access)
- `DISPATCH` - Dispatch coordinator
- `HR` - Human resources
- `SAFETY` - Safety officer
- `FINANCE` - Finance manager
- `DRIVER` - Driver (limited access)

**Platform Roles (platform-level):**
- `PLATFORM_OWNER` - Platform owner (SaaS provider)
- `PLATFORM_ADMIN` - Platform administrator

#### Sistema de Permisos

**Matriz de permisos implementada:**
- Cada rol tiene permisos específicos definidos
- Permisos incluyen: `drivers.*`, `vehicles.*`, `routes.*`, `dispatch.*`, `reports.*`, `settings.*`, `users.*`, `finance.*`, `safety.*`, `tracking.*`
- DRIVER tiene acceso limitado (solo datos propios)

#### Guards Server-Side

**Funciones implementadas:**
- `requireAuth()` - Verifica autenticación
- `requireActiveOrg()` - Verifica organización activa
- `requireRole(role)` - Verifica rol específico
- `requireAnyRole(roles[])` - Verifica uno de varios roles
- `requireOrgAccess(orgId)` - Verifica acceso a organización
- `requirePermission(permission)` - Verifica permiso específico
- `requireAnyPermission(permissions[])` - Verifica uno de varios permisos

#### Componentes y Hooks

**Cliente:**
- `hooks/usePermissions.ts` - Hook React para obtener permisos
- `components/auth/ProtectedNav.tsx` - Componente que filtra UI según permisos
- `app/api/auth/permissions/route.ts` - Endpoint para obtener permisos del usuario

#### Audit Logs

**Tabla creada:**
- `app.audit_logs` - Registro de acciones críticas
- Campos: `organization_id`, `user_id`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`
- RLS habilitado - usuarios solo ven logs de su organización

**Funciones helper:**
- `lib/db/audit.ts` - `createAuditLog()`, `getAuditLogs()`

#### RLS Refinado

**Políticas actualizadas:**
- Políticas RLS refinadas según roles (migración 003)
- DRIVER solo puede ver/actualizar su propia membership
- Otras políticas más granulares según roles

#### Archivos Creados

**Core RBAC:**
- `lib/auth/roles.ts` - Definiciones de roles
- `lib/auth/permissions.ts` - Matriz de permisos
- `lib/auth/rbac.ts` - Funciones RBAC (getCurrentUserRole, checkPermission, getRBACContext)
- `lib/auth/guards.ts` - Guards server-side

**Cliente:**
- `hooks/usePermissions.ts` - Hook React
- `components/auth/ProtectedNav.tsx` - Componente protegido
- `app/api/auth/permissions/route.ts` - API endpoint

**Database:**
- `supabase/migrations/003_rls_role_policies.sql` - Políticas RLS refinadas
- `supabase/migrations/004_audit_logs.sql` - Tabla de audit logs
- `lib/db/audit.ts` - Helpers para audit logs

#### Security Best Practices Implementadas

- ✅ Guards bloquean acceso no autorizado server-side
- ✅ UI oculta acciones no autorizadas
- ✅ DRIVER no puede acceder a rutas admin
- ✅ Permisos validados antes de cada acción crítica
- ✅ Audit logs para acciones importantes
- ✅ RLS refina acceso según roles

#### Próximos Pasos (EPIC 4)

- Implementar Stripe para monetización
- Sistema de entitlements y límites por plan

---

## EPIC 4 — Stripe Monetization & Entitlements

**Estado**: ⏳ PENDING

---

## EPIC 5 — Platform Console (SaaS Owner)

**Estado**: ⏳ PENDING

---

## EPIC 6 — Admin Core (DSP MVP)

**Estado**: ⏳ PENDING

---

## EPIC 7 — Driver Portal

**Estado**: ⏳ PENDING

---

## EPIC 8 — Tracking & Speed Module

**Estado**: ⏳ PENDING

---

## EPIC 9 — Hardening, QA & Deploy

**Estado**: ⏳ PENDING

---

**Última actualización**: 2024-12-29

