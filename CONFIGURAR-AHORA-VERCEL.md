# 🚨 CONFIGURAR VARIABLES EN VERCEL - URGENTE

## ❌ **PROBLEMA ACTUAL:**
- ✅ Las tablas están creadas en Supabase
- ❌ La aplicación NO se conecta a Supabase
- ❌ No se guarda nada
- ❌ Aparecen mensajes de error en el navegador

## 🎯 **SOLUCIÓN: Configurar variables en Vercel**

### 📋 **PASO 1: Obtener las claves de Supabase**

1. **Ve a Supabase:**
   - Abre [supabase.com](https://supabase.com)
   - Selecciona tu proyecto
   - Ve a **Settings** → **API** (en el menú lateral)

2. **Copia estos valores:**
   - **URL**: `https://tu-proyecto.supabase.co`
   - **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 📋 **PASO 2: Configurar en Vercel**

1. **Ve a Vercel:**
   - Abre [vercel.com](https://vercel.com)
   - Selecciona tu proyecto
   - Ve a **Settings** → **Environment Variables**

2. **Agregar variable 1:**
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://tu-proyecto.supabase.co` (la URL que copiaste)
   - **Environments**: Selecciona **Production, Preview, Development**
   - Clic en **Save**

3. **Agregar variable 2:**
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (la clave que copiaste)
   - **Environments**: Selecciona **Production, Preview, Development**
   - Clic en **Save**

### 📋 **PASO 3: Redesplegar**

1. **En Vercel:**
   - Ve a **Deployments**
   - Busca el último deployment
   - Clic en los **3 puntos** → **Redeploy**
   - Espera 1-2 minutos

### 📋 **PASO 4: Verificar que funciona**

1. **Ve a tu sitio web**
2. **Presiona F12** → **Console**
3. **Pega este código:**
   ```javascript
   fetch('/api/clientes')
     .then(r => r.json())
     .then(data => console.log('✅ Conexión exitosa:', data))
     .catch(err => console.error('❌ Error:', err));
   ```
4. **Presiona Enter**

### 🎯 **RESULTADO ESPERADO:**
```
✅ Conexión exitosa: []
```

### 🚨 **SI SIGUES VIENDO ERRORES:**

#### **Error típico:**
```
❌ Error: Failed to fetch
❌ Error: 500 Internal Server Error
❌ Error: Environment variable not found
```

#### **Solución:**
1. **Verifica** que las variables estén bien escritas
2. **Espera** 2-3 minutos después del redespliegue
3. **Refresca** la página completamente (Ctrl+F5)

### 🔍 **CÓMO VERIFICAR LAS VARIABLES:**

1. **En Vercel** → **Settings** → **Environment Variables**
2. **Verifica que aparezcan:**
   - ✅ `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - ✅ `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 🎉 **DESPUÉS DE ESTO:**

1. **Los botones funcionarán** correctamente
2. **Se guardarán** los datos en Supabase
3. **No aparecerán** mensajes de error
4. **La aplicación funcionará** completamente

## 🆘 **SI NECESITAS AYUDA:**

**Dime específicamente:**
1. ¿Qué mensajes aparecen en la consola del navegador?
2. ¿Ya configuraste las variables en Vercel?
3. ¿Ya redespliegaste el proyecto?

## ⚡ **RESUMEN RÁPIDO:**

1. **Supabase** → Settings → API → Copiar URL y anon key
2. **Vercel** → Settings → Environment Variables → Agregar las 2 variables
3. **Vercel** → Deployments → Redeploy
4. **Probar** en el navegador

**¡Esto solucionará el problema!** 