# ⚙️ CONFIGURACIÓN DE VARIABLES DE ENTORNO

## 🎯 **VARIABLES OBLIGATORIAS**

Para que tu aplicación funcione correctamente, necesitas configurar estas variables:

### **1. En Vercel (OBLIGATORIO):**

Ve a tu proyecto en Vercel:
1. **Settings** → **Environment Variables**
2. Agrega estas variables:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Para Desarrollo Local (.env):**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuración JWT (opcional)
JWT_SECRET=tu_clave_super_secreta_aqui
JWT_EXPIRES_IN=24h

# Configuración local
PORT=3000
NODE_ENV=development
```

## 🔑 **CÓMO OBTENER LAS CLAVES DE SUPABASE:**

1. Ve a [supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia estos valores:
   - **URL**: `https://tu-proyecto.supabase.co`
   - **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 **CONFIGURAR EN VERCEL:**

### **Paso 1: Acceder a Variables**
```
1. Ve a vercel.com
2. Selecciona tu proyecto
3. Settings → Environment Variables
```

### **Paso 2: Agregar Variables**
```
Variable: SUPABASE_URL
Valor: https://tu-proyecto.supabase.co

Variable: SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Paso 3: Redesplegar**
```
1. Ve a Deployments
2. Haz clic en "Redeploy" en el último deployment
3. Espera que termine (1-2 minutos)
```

## ✅ **VERIFICAR QUE FUNCIONÓ:**

### **Método 1: Consola del Navegador**
```javascript
// Pega esto en la consola (F12):
fetch('/api/clientes')
  .then(r => r.json())
  .then(data => console.log('✅ Funciona:', data))
  .catch(err => console.error('❌ Error:', err));
```

### **Método 2: Usar el Verificador**
1. Ve a: `tu-sitio.vercel.app/verificar-errores.html`
2. Haz clic en "Diagnóstico Completo"
3. Verifica que no hay errores

### **Método 3: Probar la Función**
```javascript
// Pega esto en la consola:
diagnosticar();
```

## 🚨 **ERRORES COMUNES:**

### **Error: "404 Not Found /api/clientes"**
- **Causa**: Variables no configuradas en Vercel
- **Solución**: Agregar SUPABASE_URL y SUPABASE_ANON_KEY en Vercel

### **Error: "500 Internal Server Error"**
- **Causa**: Variables incorrectas o error en Supabase
- **Solución**: Verificar que las claves sean correctas

### **Error: "Network Error"**
- **Causa**: Problemas de conexión
- **Solución**: Verificar internet y que Vercel esté activo

## 📋 **LISTA DE VERIFICACIÓN:**

- [ ] ✅ Creé un proyecto en Supabase
- [ ] ✅ Ejecuté el script SQL en Supabase
- [ ] ✅ Copié la URL del proyecto
- [ ] ✅ Copié la anon key
- [ ] ✅ Agregué variables en Vercel
- [ ] ✅ Redespliegué el proyecto
- [ ] ✅ Probé que funciona

## 🆘 **SI SIGUES TENIENDO PROBLEMAS:**

1. **Revisa los logs de Vercel:**
   - Ve a Functions → View Function Logs
   - Busca errores específicos

2. **Verifica en la consola:**
   - Presiona F12 en tu sitio
   - Ve a Console
   - Busca errores en rojo

3. **Usa el verificador:**
   - Ve a `/verificar-errores.html`
   - Ejecuta todas las pruebas
   - Copia los resultados

Con estas variables configuradas correctamente, tu aplicación debería funcionar sin errores. 