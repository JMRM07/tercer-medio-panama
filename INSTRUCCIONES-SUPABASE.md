# 🚀 Configuración de Base de Datos en Supabase

## 📋 Resumen

Este documento te guiará paso a paso para configurar toda la estructura de base de datos necesaria para tu proyecto en Supabase.

## 🛠️ Pasos para Configurar la Base de Datos

### 1. Acceder a Supabase
- Ve a [https://supabase.com/](https://supabase.com/)
- Inicia sesión en tu cuenta
- Selecciona tu proyecto existente o crea uno nuevo

### 2. Ejecutar el Script SQL
- En el dashboard de Supabase, dirígete a **SQL Editor** (Editor SQL)
- Haz clic en **"New query"** (Nueva consulta)
- Abre el archivo `setup-supabase-completo.sql` que se creó
- Copia todo el contenido del archivo
- Pega el script completo en el editor SQL de Supabase
- Haz clic en **"Run"** (Ejecutar)

### 3. Verificar la Creación de Tablas
Después de ejecutar el script, verifica que se crearon todas las tablas:
- Ve a **Table Editor** (Editor de tablas)
- Deberías ver las siguientes tablas creadas:
  - ✅ `usuarios`
  - ✅ `clientes`
  - ✅ `cotizaciones`
  - ✅ `contratos` 
  - ✅ `facturas`
  - ✅ `configuracion`

### 4. Configurar Variables de Entorno
Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
SUPABASE_URL=tu-url-de-supabase
SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

Para obtener estos valores:
- Ve a **Settings** → **API** en tu proyecto de Supabase
- Copia la **URL** y la **anon key**

## 📊 Estructura de Tablas Creadas

### 🔐 Tabla `usuarios`
- Gestión de usuarios del sistema
- Campos: id, usuario, nombre, email, telefono, password_hash, fecha_registro, activo

### 👥 Tabla `clientes`
- Información de clientes
- Campos: id, codigo, nombre, ruc, dv, email, telefono, direccion, activo, created_at, updated_at

### 💰 Tabla `cotizaciones`
- Gestión de cotizaciones
- Campos: id, codigo, numero_documento, cliente_id, cliente_nombre, etc.
- Estados: borrador, pendiente, aprobada, rechazada, facturada, anulada

### 📋 Tabla `contratos`
- Gestión de contratos
- Campos: id, numero_contrato, cliente_id, fechas, tarifa, horas, totales, etc.
- Estados: borrador, activo, finalizado, cancelado

### 🧾 Tabla `facturas`
- Gestión de facturas
- Campos: id, numero_factura, tipo_documento, cliente_id, totales, etc.
- Tipos: cotizacion, contrato

### ⚙️ Tabla `configuracion`
- Configuración del sistema
- Valores por defecto: ITBMS (7%), moneda base (USD), tasa de cambio (1)

## 🔒 Configuración de Seguridad

El script incluye **Row Level Security (RLS)** configurado para:
- **Usuarios autenticados**: Acceso completo a todas las tablas
- **Usuarios anónimos**: Acceso completo (temporal para desarrollo)

> ⚠️ **IMPORTANTE**: Las políticas actuales permiten acceso completo para facilitar el desarrollo. Para producción, considera restringir las políticas según tus necesidades de seguridad.

## 🚀 Próximos Pasos

1. **Verificar conexión**: Prueba que tu aplicación se conecte correctamente
2. **Probar APIs**: Verifica que las funciones serverless funcionen
3. **Datos de prueba**: Considera agregar algunos datos de prueba
4. **Seguridad**: Ajusta las políticas RLS según tus necesidades

## 🆘 Solución de Problemas

### Error: "relation does not exist"
- Verifica que todas las tablas se crearon correctamente
- Ejecuta el script nuevamente si es necesario

### Error: "permission denied"
- Revisa las políticas RLS
- Asegúrate de que las claves de API sean correctas

### Error de conexión
- Verifica las variables de entorno
- Confirma que la URL y las claves sean correctas

## 📞 Contacto

Si tienes problemas con la configuración, revisa:
1. Los logs del SQL Editor en Supabase
2. La consola de desarrollador de tu navegador
3. Los logs de tu aplicación 