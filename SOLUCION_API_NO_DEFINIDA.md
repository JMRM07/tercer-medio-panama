# 🚨 SOLUCIÓN: "La API no está definida"

## 🔍 **DIAGNÓSTICO DEL PROBLEMA**

El error "la API no está definida" significa que las **funciones serverless no están funcionando** en Vercel. 

## 🛠️ **SOLUCIÓN PASO A PASO:**

### **PASO 1: Verificar el problema específico**
```bash
# Abre esta página en tu proyecto desplegado:
https://tu-proyecto.vercel.app/test-api.html

# Esto te dirá exactamente qué está fallando
```

### **PASO 2: Los problemas más comunes y sus soluciones**

#### **🔥 PROBLEMA A: Error 404 - APIs no encontradas**
**Causa:** Las funciones serverless no se desplegaron correctamente.

**Solución:**
1. Ve a **Vercel Dashboard** → Tu proyecto → **Deployments**
2. Haz clic en el último deployment
3. Ve a **Function Logs** y busca errores en rojo
4. Si ves errores de build, sigue al Paso 3

#### **🔥 PROBLEMA B: Error 500 - Error interno del servidor**
**Causa:** Faltan variables de entorno.

**Solución:**
1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Agrega estas variables:
```
DB_HOST=tu-host-planetscale
DB_USER=tu-usuario-db
DB_PASSWORD=tu-password-db
DB_NAME=tercer_medio_panama
DB_PORT=3306
JWT_SECRET=mi-clave-secreta-muy-larga-123
```
3. Haz **Redeploy** del proyecto

#### **🔥 PROBLEMA C: Error de conexión**
**Causa:** Problemas de red o CORS.

**Solución:** Verifica que estés accediendo a la URL correcta de Vercel (no localhost).

---

## **PASO 3: Verificar archivos críticos**

### **Verificar que tienes estos archivos en GitHub:**
```bash
✅ vercel.json              - Configuración
✅ package.json             - Dependencias  
✅ api/auth.js              - Función login/registro
✅ api/clientes.js          - Función clientes
✅ api/cotizaciones.js      - Función cotizaciones
✅ api/contratos.js         - Función contratos
✅ api/facturas.js          - Función facturas
✅ api/reportes.js          - Función reportes
✅ api/configuracion.js     - Función configuración
```

Si falta alguno, súbelo a GitHub y Vercel redesplegará automáticamente.

---

## **PASO 4: Configurar PlanetScale (Base de datos)**

### **A. Crear cuenta en PlanetScale:**
1. Ve a [planetscale.com](https://planetscale.com)
2. Crea cuenta gratuita
3. Haz clic en **"Create database"**
4. Nombre: `tercer-medio-panama`
5. Región: **US East**

### **B. Obtener credenciales:**
1. Ve a tu base de datos → **Settings** → **Passwords**
2. Haz clic en **"New password"**
3. Nombre: `vercel-production`
4. **Copia las credenciales** (se muestran solo una vez)

### **C. Configurar en Vercel:**
1. **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Agrega cada variable:
```
DB_HOST=aws.connect.psdb.cloud
DB_USER=tu-usuario-copiado
DB_PASSWORD=tu-password-copiado
DB_NAME=tercer-medio-panama
DB_PORT=3306
JWT_SECRET=mi-clave-secreta-super-larga-12345
```
3. Haz clic en **Save**

---

## **PASO 5: Forzar redeploy**

### **Opción A: Desde Vercel Dashboard**
1. Ve a **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **"Redeploy"**

### **Opción B: Desde GitHub**
```bash
# Hacer un pequeño cambio y push
git add .
git commit -m "fix: Forzar redeploy para APIs"
git push origin main
```

---

## **PASO 6: Verificar funcionamiento**

### **Prueba estas URLs en orden:**
```bash
# 1. Página principal
https://tu-proyecto.vercel.app

# 2. Página de diagnóstico
https://tu-proyecto.vercel.app/test-api.html

# 3. API de prueba directa
https://tu-proyecto.vercel.app/api/auth
```

### **Resultados esperados:**
1. **Página principal:** Se carga sin errores
2. **Diagnóstico:** Muestra "✅ API responde correctamente"
3. **API directa:** No muestra error 404

---

## **🆘 SOLUCIÓN RÁPIDA SI NADA FUNCIONA:**

### **Verificar en este orden:**
```bash
☑️ 1. Archivos en GitHub (especialmente carpeta /api)
☑️ 2. Variables de entorno en Vercel
☑️ 3. PlanetScale activo y con credenciales correctas
☑️ 4. Último deployment sin errores rojos
☑️ 5. URL correcta (no localhost)
```

### **Comandos de emergencia:**
```bash
# Si cambias algo en GitHub
git add . && git commit -m "fix: API" && git push

# Si cambias variables en Vercel
# Ve a Settings → Environment Variables → Redeploy
```

---

## **📞 CÓDIGOS DE ERROR COMUNES:**

| Error | Significado | Solución |
|-------|-------------|----------|
| 404 | APIs no encontradas | Verificar carpeta /api en GitHub |
| 500 | Variables faltantes | Configurar variables en Vercel |
| 502 | Build fallido | Ver logs en Vercel Deployments |
| CORS | Problema de dominio | Usar URL de Vercel, no localhost |

---

## **✅ RESULTADO FINAL:**

Después de seguir estos pasos:
- ✅ Las APIs funcionarán correctamente
- ✅ Registro e inicio de sesión trabajarán
- ✅ Todas las funciones estarán disponibles
- ✅ No habrá más errores de "API no definida"

**🎯 ¡Tu aplicación estará 100% funcional en Vercel!** 