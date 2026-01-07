# Migración de Waitlist

## ⚠️ IMPORTANTE: Si tienes error de RLS

Si ves el error **"new row violates row-level security policy"**, ejecuta primero el fix rápido:

### Fix Rápido (Ejecuta esto primero si tienes errores)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido completo del archivo **`QUICK_FIX_WAITLIST_RLS.sql`**
5. Haz clic en **Run** o presiona `Cmd/Ctrl + Enter`
6. Deberías ver que se creó la política correctamente

## Instrucciones para aplicar la migración completa en Supabase

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido completo del archivo `create_waitlist_table.sql`
5. Haz clic en **Run** o presiona `Cmd/Ctrl + Enter`
6. Verifica que la migración se ejecutó correctamente

### Opción 2: Desde la línea de comandos (si tienes Supabase CLI)

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O aplicar la migración específica
supabase migration up create_waitlist_table
```

## Verificación

Después de aplicar la migración, puedes verificar que todo funciona:

1. Ve a **Table Editor** en Supabase Dashboard
2. Deberías ver la tabla `waitlist` con las columnas:
   - `id` (UUID)
   - `email` (TEXT, único)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. Prueba la función:
   - Ve a **SQL Editor**
   - Ejecuta: `SELECT get_waitlist_count();`
   - Debería retornar `0` inicialmente

## Estructura de la tabla

```sql
waitlist
├── id (UUID, Primary Key)
├── email (TEXT, Unique, Not Null)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Políticas de Seguridad (RLS)

- ✅ **INSERT**: Cualquiera puede agregar su email (público)
- ✅ **SELECT (conteo)**: Cualquiera puede ver el conteo total (función pública)
- ✅ **SELECT (datos)**: Solo admins pueden ver los emails individuales
- ✅ **Función pública**: `get_waitlist_count()` retorna el conteo sin exponer emails

## Endpoints API

- `POST /api/waitlist` - Agregar email a la lista
- `GET /api/waitlist/count` - Obtener conteo total

