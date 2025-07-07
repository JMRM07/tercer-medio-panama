# 🚨 INSTRUCCIONES URGENTES - SUPABASE

## 🎯 **PROBLEMA IDENTIFICADO**
La tabla `clientes` en Supabase **NO tiene la columna `codigo`** que el código necesita.

## 🔧 **SOLUCIÓN RÁPIDA**

### **Paso 1: Acceder a Supabase**
1. Ve a https://supabase.com
2. Inicia sesión
3. Selecciona tu proyecto
4. Ve a **SQL Editor** (icono de base de datos)

### **Paso 2: Ejecutar Script**
1. Copia **TODO** el contenido del archivo `AGREGAR-COLUMNA-CODIGO.sql`
2. Pégalo en el SQL Editor
3. Haz clic en **"Run"** (Ejecutar)

### **Paso 3: Verificar Resultado**
Deberías ver algo como:
```
Columna codigo agregada exitosamente | total_clientes: 0
```

Y luego una tabla mostrando la estructura con la nueva columna `codigo`.

## 📋 **LO QUE HACE EL SCRIPT**

1. ✅ **Agrega** la columna `codigo` a la tabla `clientes`
2. ✅ **Genera códigos** automáticamente para registros existentes
3. ✅ **Crea índice** para mejor rendimiento
4. ✅ **Verifica** que todo esté funcionando

## 🎉 **RESULTADO ESPERADO**

Una vez ejecutado el script:
- ✅ La tabla `clientes` tendrá la columna `codigo`
- ✅ El diagnóstico pasará **todas las pruebas**
- ✅ La aplicación funcionará **perfectamente**

## ⚡ **EJECUTAR AHORA**

1. **Copia** el contenido de `AGREGAR-COLUMNA-CODIGO.sql`
2. **Pégalo** en Supabase SQL Editor
3. **Ejecuta** el script
4. **Prueba** nuevamente el diagnóstico

## 🔍 **VERIFICAR ÉXITO**

Después de ejecutar el script:
1. Ve a tu aplicación
2. Accede a: `https://tu-app.vercel.app/api/diagnostico`
3. Deberías ver **6 pruebas PASADAS** ✅

## 🚨 **SI ALGO SALE MAL**

Si hay algún error al ejecutar el script:
1. Copia el mensaje de error exacto
2. Compártelo conmigo
3. Hay scripts alternativos disponibles

**¡Ejecuta el script AHORA y tu aplicación funcionará!** 🚀 