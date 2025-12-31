# DPSxTeams - XTG SaaS Platform

Plataforma SaaS multi-tenant para Delivery Service Partners (DSP) construida con Next.js, Firebase Auth, Supabase y Stripe.

## 📋 Descripción del Proyecto

DPSxTeams es una plataforma SaaS completa que permite a los DSP (Delivery Service Partners) gestionar sus operaciones de entrega, incluyendo:

- **Gestión de conductores** - Perfiles, rutas y turnos
- **Gestión de vehículos** - Flota y mantenimiento
- **Seguimiento en tiempo real** - Tracking GPS y métricas de velocidad
- **Portal para conductores** - Interfaz móvil para operadores
- **Consola de administración** - Panel completo para operaciones
- **Monetización** - Integración con Stripe para suscripciones

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 16.1.1 (App Router), TypeScript (strict mode)
- **UI**: TailwindCSS 4, shadcn/ui, Design Tokens SVL
- **Autenticación**: Firebase Authentication (Session Cookies)
- **Base de Datos**: Supabase PostgreSQL con Row Level Security (RLS)
- **Pagos**: Stripe (Subscriptions, Webhooks)
- **Arquitectura**: Multi-tenant con aislamiento a nivel de base de datos

### Estructura de Schemas

- **`app` schema**: Datos multi-tenant de las organizaciones (DSP)
- **`platform` schema**: Datos de la plataforma SaaS (solo accesible con service role)

### Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas multi-tenant
- ✅ RBAC (Role-Based Access Control) con validación server-side
- ✅ Guards server-side para protección de rutas
- ✅ Session cookies httpOnly (no accesibles desde JavaScript)
- ✅ Audit logs para acciones críticas
- ✅ Aislamiento completo entre organizaciones

## 📊 Estado del Proyecto

### ✅ EPICs Completados

#### EPIC 0 — Repository & Project Foundation
- ✅ Next.js 16.1.1 con TypeScript strict
- ✅ TailwindCSS configurado con tokens SVL
- ✅ shadcn/ui instalado y configurado
- ✅ Estructura de carpetas completa
- ✅ Layouts base (Platform, Admin, Driver, Auth)
- ✅ Environment validation (Zod)
- ✅ Logging utility

#### EPIC 1 — Authentication (Firebase)
- ✅ Firebase Authentication integrado
- ✅ Session cookies seguras (httpOnly)
- ✅ Middleware de protección de rutas
- ✅ Endpoints de autenticación (`/api/auth/session`, `/api/auth/logout`, `/api/auth/me`)
- ✅ Verificación server-side de tokens

#### EPIC 2 — Supabase + Multi-Tenant Core + RLS
- ✅ Schemas `app` y `platform` creados
- ✅ Tablas base: `organizations`, `memberships`, `users`
- ✅ Row Level Security (RLS) implementado
- ✅ Clientes Supabase (client, server, service)
- ✅ Helper function `app.current_firebase_uid()` para RLS
- ✅ Aislamiento multi-tenant a nivel de base de datos

#### EPIC 3 — Roles & RBAC Enforcement
- ✅ Sistema de roles implementado (OPS, DISPATCH, HR, SAFETY, FINANCE, DRIVER)
- ✅ Matriz de permisos completa
- ✅ Guards server-side (`requireAuth`, `requireRole`, `requirePermission`, etc.)
- ✅ Hook React `usePermissions` para cliente
- ✅ Componente `ProtectedNav` para UI condicional
- ✅ Tabla de audit logs con RLS
- ✅ Políticas RLS refinadas según roles

### ⏳ EPICs Pendientes

- **EPIC 4** — Stripe Monetization & Entitlements
- **EPIC 5** — Platform Console (SaaS Owner)
- **EPIC 6** — Admin Core (DSP MVP)
- **EPIC 7** — Driver Portal
- **EPIC 8** — Tracking & Speed Module
- **EPIC 9** — Hardening, QA & Deploy

> **Nota**: Aunque algunos EPICs están marcados como pendientes, existen migraciones de base de datos que sugieren trabajo en progreso en varios módulos (Stripe, Platform, Admin, Driver Portal, Tracking).

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- npm, yarn, pnpm o bun
- Cuenta de Firebase (para autenticación)
- Proyecto de Supabase (para base de datos)
- Cuenta de Stripe (para pagos, opcional)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd DPSxTeams
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crear archivo `.env.local` con las siguientes variables:

   ```env
   # Firebase (Cliente)
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=

   # Firebase (Server / Admin)
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Auth Cookie
   AUTH_COOKIE_NAME=xtg_session
   AUTH_COOKIE_SECURE=false  # true en producción
   AUTH_COOKIE_MAX_AGE=604800  # 7 días en segundos

   # Stripe (Opcional)
   STRIPE_SECRET_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```

4. **Aplicar migraciones de base de datos**

   Ejecutar las migraciones en Supabase SQL Editor en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - ... (ver carpeta `supabase/migrations/` para orden completo)

5. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
DPSxTeams/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Rutas de administración DSP
│   ├── (driver)/          # Portal para conductores
│   ├── (platform)/        # Consola de plataforma SaaS
│   ├── (auth)/            # Rutas de autenticación
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── admin/            # Componentes admin
│   ├── driver/           # Componentes driver
│   └── tracking/         # Componentes de tracking
├── lib/                   # Utilidades y lógica de negocio
│   ├── auth/             # Autenticación y RBAC
│   ├── db/               # Funciones de base de datos
│   ├── firebase/         # Configuración Firebase
│   ├── supabase/         # Clientes Supabase
│   ├── stripe/           # Integración Stripe
│   └── tracking/         # Lógica de tracking
├── supabase/
│   └── migrations/       # Migraciones de base de datos
├── hooks/                # React Hooks
└── docs/                 # Documentación
```

## 🔐 Roles y Permisos

### Roles DSP (app-level)

- **OPS** - Operations manager (acceso completo)
- **DISPATCH** - Coordinador de despacho
- **HR** - Recursos humanos
- **SAFETY** - Oficial de seguridad
- **FINANCE** - Gerente de finanzas
- **DRIVER** - Conductor (acceso limitado a datos propios)

### Roles Platform (platform-level)

- **PLATFORM_OWNER** - Propietario de la plataforma (SaaS provider)
- **PLATFORM_ADMIN** - Administrador de plataforma

## 📚 Documentación

- [EPIC Status](./docs/EPIC_STATUS.md) - Estado detallado de cada EPIC
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - Guía de configuración de Supabase
- [Design Tokens](./docs/design-tokens.md) - Tokens de diseño SVL
- [Tracking Security Tests](./docs/TRACKING_SECURITY_TESTS.md) - Tests de seguridad del módulo de tracking

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Formateo de código
npm run format
npm run format:check
```

## 🔄 Migraciones de Base de Datos

Las migraciones se encuentran en `supabase/migrations/` y deben aplicarse en orden numérico. Ver documentación en `docs/SUPABASE_SETUP.md` para más detalles.

## 🛡️ Seguridad

Este proyecto implementa múltiples capas de seguridad:

1. **Autenticación**: Firebase Auth con session cookies httpOnly
2. **Autorización**: RBAC con validación server-side
3. **Aislamiento de datos**: RLS en Supabase
4. **Guards**: Protección de rutas y acciones críticas
5. **Audit logs**: Registro de acciones importantes
6. **Validación**: Validación de entrada con Zod

## 📝 Licencia

[Especificar licencia]

## 👥 Contribución

[Instrucciones de contribución]

---

**Última actualización**: Diciembre 2024

Para más información sobre el estado del proyecto, consulta [EPIC_STATUS.md](./docs/EPIC_STATUS.md).
