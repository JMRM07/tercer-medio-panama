# 🚨 CONFIGURACIÓN URGENTE DE VERCEL

## ⚠️ IMPORTANTE: Hacer ESTO PRIMERO

### **1. Accede a tu Dashboard de Vercel**
```
https://vercel.com/dashboard
```

### **2. Selecciona tu Proyecto**
- Busca el proyecto "tercer-medio-panama" o similar
- Haz clic en él

### **3. Ve a Settings**
- En la página del proyecto, haz clic en "Settings"
- Luego haz clic en "Environment Variables"

### **4. Agrega las Variables de Entorno**

**Variable 1:**
- **Name:** `SUPABASE_URL`
- **Value:** `https://nlejwziqwoxjyrqtdwja.supabase.co`
- **Environments:** Marca todas (Production, Preview, Development)

**Variable 2:**
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWp3emlxd294anlycXRkd2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTk5MjMsImV4cCI6MjA2NzE3NTkyM30.Qyv6urLZRGZ55gLlN3ktMNfxq8hCiyA4QXfMQZZRc0E`
- **Environments:** Marca todas (Production, Preview, Development)

### **5. Guarda y Redeploy**
- Haz clic en "Save" para cada variable
- Ve a "Deployments"
- Haz clic en "Redeploy" en el deployment más reciente

### **6. Verifica que Funcione**
```
Ve a: https://tu-app.vercel.app/api/diagnostico
Debe mostrar: ✅ Variables de entorno configuradas
```

## 🔧 Si No Tienes Acceso a Vercel

### **Opción A: Verificar Conexión GitHub**
1. Ve a https://github.com/JMRM07/tercer-medio-panama
2. Ve a Settings → Secrets and variables → Actions
3. Verifica que Vercel esté conectado

### **Opción B: Nuevo Deploy**
1. Ve a https://vercel.com
2. Haz clic en "New Project"
3. Conecta tu repositorio GitHub
4. Agrega las variables de entorno DURANTE la configuración

## 📱 Capturas de Pantalla Paso a Paso

### **Paso 1: Dashboard de Vercel**
```
[Dashboard] → [Tu Proyecto] → [Settings] → [Environment Variables]
```

### **Paso 2: Agregar Variable**
```
Name: SUPABASE_URL
Value: https://nlejwziqwoxjyrqtdwja.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

### **Paso 3: Agregar Segunda Variable**
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWp3emlxd294anlycXRkd2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTk5MjMsImV4cCI6MjA2NzE3NTkyM30.Qyv6urLZRGZ55gLlN3ktMNfxq8hCiyA4QXfMQZZRc0E
Environments: ✅ Production ✅ Preview ✅ Development
```

### **Paso 4: Redeploy**
```
[Deployments] → [Más reciente] → [Redeploy]
```

## ✅ Verificación Final

### **Test 1: Diagnóstico API**
```
URL: https://tu-app.vercel.app/api/diagnostico
Resultado esperado: Todas las pruebas en verde
```

### **Test 2: Prueba de Conexión**
```
URL: https://tu-app.vercel.app/api/test-config
Resultado esperado: Estado "healthy"
```

### **Test 3: Aplicación Principal**
```
URL: https://tu-app.vercel.app
Resultado esperado: Login funciona, página carga sin errores
```

## 🚨 Errores Comunes

### **Error: "Variables no definidas"**
- Asegúrate de marcar ALL environments
- Espera 1-2 minutos después del redeploy

### **Error: "Proyecto no encontrado"**
- Verifica que GitHub esté conectado
- Busca el proyecto con nombre similar

### **Error: "No puedo acceder a Settings"**
- Verifica que seas el owner del proyecto
- Pide permisos de admin si es necesario

## 📞 Siguiente Paso

**Una vez configurado, avísame:**
1. "✅ Variables configuradas" - si todo salió bien
2. "❌ Error: [descripción]" - si hay algún problema

**Luego podremos probar el botón de eliminar!** 🚀

## 🔗 Enlaces Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/JMRM07/tercer-medio-panama
- **Supabase Dashboard:** https://supabase.com/dashboard

---

**¡Esta configuración es CRÍTICA para que todo funcione!** ⚡ 