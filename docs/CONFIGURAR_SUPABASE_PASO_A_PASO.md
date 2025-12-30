# 🚀 Guía Paso a Paso: Configurar Supabase

Sigue estos pasos para configurar Supabase en tu proyecto.

## 📋 Paso 1: Crear Proyecto en Supabase

1. **Abre tu navegador** y ve a: https://supabase.com
2. **Inicia sesión** o crea una cuenta (es gratis)
3. **Clic en "New Project"**
4. **Completa el formulario:**
   - **Name**: `dspxteams` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (⚠️ **GUÁRDALA**, la necesitarás)
   - **Region**: Elige la más cercana a ti
   - **Pricing Plan**: Free tier está bien para empezar
5. **Clic en "Create new project"**
6. ⏳ Espera 1-2 minutos mientras se crea el proyecto

## 🔑 Paso 2: Obtener las Credenciales

Una vez que tu proyecto esté listo:

1. En el dashboard de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API** en el submenú
3. Verás tres valores importantes:

   **📋 Copia estos valores:**

   - **Project URL**
     - Se ve así: `https://xxxxxxxxxxxxx.supabase.co`
     - ⬇️ Copia este valor → `NEXT_PUBLIC_SUPABASE_URL`

   - **anon public** (en la sección "Project API keys")
     - Es una clave larga que empieza con `eyJ...`
     - ⬇️ Copia este valor → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   - **service_role** (en la misma sección, pero más abajo)
     - También empieza con `eyJ...`
     - ⚠️ **ES SECRETO** - nunca lo compartas ni lo subas a GitHub
     - ⬇️ Copia este valor → `SUPABASE_SERVICE_ROLE_KEY`

## ⚙️ Paso 3: Configurar Variables de Entorno

Abre tu archivo `.env.local` y agrega estas líneas al final:

```env
# Supabase (EPIC 2)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**Reemplaza:**
- `https://tu-proyecto.supabase.co` con tu **Project URL**
- `tu_anon_key_aqui` con tu **anon public** key
- `tu_service_role_key_aqui` con tu **service_role** key

**💡 Tip**: Guarda el archivo después de agregar las variables.

## 🗄️ Paso 4: Ejecutar las Migraciones SQL

Ahora necesitamos crear las tablas y configurar RLS en Supabase:

1. **En Supabase Dashboard**, ve a **SQL Editor** en el menú lateral
2. **Clic en "New query"**
3. **Abre el archivo** `supabase/migrations/000_complete_setup.sql` en tu editor de código
4. **Copia TODO el contenido** del archivo
5. **Pega el contenido** en el SQL Editor de Supabase
6. **Clic en "Run"** (o presiona `Ctrl+Enter`)
7. ⏳ Espera unos segundos...

**✅ Deberías ver:**
```
Success. No rows returned
```

Si ves algún error, revisa:
- ¿Estás usando el SQL Editor correcto?
- ¿Copiaste todo el contenido?

## ✅ Paso 5: Verificar que Todo Funcionó

En el SQL Editor, ejecuta estas queries para verificar:

```sql
-- Verificar schemas
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('app', 'platform');

-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'app';

-- Verificar función
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'app' AND routine_name = 'current_firebase_uid';
```

**Deberías ver:**
- 2 schemas: `app` y `platform`
- 2 tablas: `organizations` y `memberships`
- 1 función: `current_firebase_uid`

## 🧪 Paso 6: Probar la Configuración

Vuelve a tu terminal y **reinicia el servidor de desarrollo**:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia
npm run dev
```

Si todo está bien configurado, **no deberías ver errores** relacionados con Supabase.

## 🎉 ¡Listo!

Tu Supabase está configurado. Ahora puedes:

1. Crear organizaciones y memberships desde tu código
2. Las políticas RLS protegerán tus datos automáticamente
3. Continuar con EPIC 3

## 🆘 ¿Problemas?

### Error: "Invalid API key"
- ✅ Verifica que copiaste las keys correctas desde Supabase
- ✅ Verifica que no haya espacios extra en `.env.local`
- ✅ Reinicia el servidor después de cambiar `.env.local`

### Error: "relation does not exist"
- ✅ Verifica que ejecutaste la migración SQL correctamente
- ✅ Revisa que veas las tablas en el SQL Editor

### Error: "function does not exist"
- ✅ Verifica que ejecutaste la migración completa
- ✅ Verifica que la función `app.current_firebase_uid()` existe

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, revisa:
- `docs/SUPABASE_SETUP.md` - Documentación técnica
- Los logs del servidor de desarrollo
- La consola del navegador

