# 📚 GUÍA COMPLETA: Cómo subir archivos a Vercel

## 🚨 **IMPORTANTE: NO subes archivos directamente a Vercel**

### **PROCESO CORRECTO:**
```
Tu PC → GitHub → Vercel (automático)
```

---

## 📋 **PASO 1: INSTALAR GIT (si no lo tienes)**

### **A. Verificar si tienes Git:**
```bash
git --version
```

### **B. Si no tienes Git, descargarlo:**
1. Ve a: **[git-scm.com/download/win](https://git-scm.com/download/win)**
2. Descarga el instalador
3. Instala con opciones por defecto
4. Reinicia la terminal

---

## 📋 **PASO 2: CREAR REPOSITORIO EN GITHUB**

### **A. Crear cuenta en GitHub (si no tienes):**
1. Ve a **[github.com](https://github.com)**
2. Haz clic en **"Sign up"**
3. Crea tu cuenta gratuita

### **B. Crear nuevo repositorio:**
1. En GitHub, haz clic en **"New repository"** (botón verde)
2. **Repository name:** `tercer-medio-panama`
3. **Description:** `Aplicación de gestión empresarial`
4. ☑️ **Public** (marcado)
5. ☑️ **Add a README file** (marcado)
6. Haz clic en **"Create repository"**

### **C. Copiar URL del repositorio:**
```
https://github.com/TU-USUARIO/tercer-medio-panama.git
```

---

## 📋 **PASO 3: SUBIR ARCHIVOS A GITHUB**

### **A. Abrir terminal en tu carpeta:**
```bash
# Navegar a la carpeta github-ready
cd "C:\Users\Usuario\Documents\HTML\proyecto 2\github-ready"
```

### **B. Configurar Git (primera vez):**
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

### **C. Inicializar y subir archivos:**
```bash
# 1. Inicializar repositorio
git init

# 2. Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/tercer-medio-panama.git

# 3. Agregar todos los archivos
git add .

# 4. Hacer commit
git commit -m "Deploy: Aplicación Tercer Medio Panamá completa"

# 5. Subir a GitHub
git branch -M main
git push -u origin main
```

### **D. Verificar en GitHub:**
1. Refresca tu repositorio en GitHub
2. Deberías ver todos tus archivos (31 archivos)
3. Confirma que ves la carpeta `api/` con 7 archivos

---

## 📋 **PASO 4: CONECTAR GITHUB CON VERCEL**

### **A. Crear cuenta en Vercel:**
1. Ve a **[vercel.com](https://vercel.com)**
2. Haz clic en **"Sign up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a GitHub

### **B. Crear nuevo proyecto:**
1. En Vercel Dashboard, haz clic en **"New Project"**
2. Busca tu repositorio: `tercer-medio-panama`
3. Haz clic en **"Import"**

### **C. Configurar proyecto:**
1. **Project Name:** `tercer-medio-panama`
2. **Framework Preset:** Dejar en **"Other"**
3. **Root Directory:** Dejar en **"./"**
4. **Build Command:** Dejar vacío
5. **Output Directory:** Dejar vacío
6. Haz clic en **"Deploy"**

---

## 📋 **PASO 5: CONFIGURAR VARIABLES DE ENTORNO**

### **A. Mientras Vercel está desplegando:**
1. Ve a **Settings** (en la parte superior)
2. Haz clic en **"Environment Variables"**

### **B. Agregar variables una por una:**
```
Nombre: DB_HOST
Valor: aws.connect.psdb.cloud
[Add]

Nombre: DB_USER  
Valor: tu-usuario-planetscale
[Add]

Nombre: DB_PASSWORD
Valor: tu-password-planetscale
[Add]

Nombre: DB_NAME
Valor: tercer_medio_panama
[Add]

Nombre: DB_PORT
Valor: 3306
[Add]

Nombre: JWT_SECRET
Valor: mi-clave-secreta-super-larga-123
[Add]
```

---

## 📋 **PASO 6: CONFIGURAR PLANETSCALE (Base de datos)**

### **A. Crear cuenta en PlanetScale:**
1. Ve a **[planetscale.com](https://planetscale.com)**
2. **"Sign up"** → **"Continue with GitHub"**
3. Autoriza PlanetScale

### **B. Crear base de datos:**
1. **"Create a database"**
2. **Name:** `tercer-medio-panama`
3. **Region:** `US East (N. Virginia)`
4. **"Create database"**

### **C. Obtener credenciales:**
1. En tu base de datos → **"Settings"** → **"Passwords"**
2. **"New password"**
3. **Name:** `vercel-production`
4. **"Create password"**
5. **¡IMPORTANTE!** Copia y pega las credenciales inmediatamente

### **D. Actualizar variables en Vercel:**
1. Vuelve a Vercel → Settings → Environment Variables
2. Actualiza `DB_HOST`, `DB_USER`, `DB_PASSWORD` con los valores de PlanetScale

---

## 📋 **PASO 7: REDEPLOY Y VERIFICAR**

### **A. Forzar redeploy:**
1. Ve a **"Deployments"** en Vercel
2. Haz clic en los **3 puntos** del último deployment
3. **"Redeploy"**

### **B. Verificar funcionamiento:**
```bash
# 1. Tu aplicación principal
https://tercer-medio-panama.vercel.app

# 2. Página de diagnóstico
https://tercer-medio-panama.vercel.app/test-api.html

# 3. API de prueba
https://tercer-medio-panama.vercel.app/api/auth
```

---

## ✅ **RESULTADO FINAL:**

- **GitHub:** Código fuente almacenado
- **Vercel:** Aplicación desplegada y funcionando
- **PlanetScale:** Base de datos en la nube
- **URL pública:** Tu aplicación accesible desde cualquier lugar

---

## 🆘 **COMANDOS DE EMERGENCIA:**

### **Si algo sale mal:**
```bash
# Para hacer cambios y resubir:
git add .
git commit -m "fix: Corrección"
git push origin main
# Vercel redesplegará automáticamente
```

### **Si no funciona Git:**
```bash
# Verificar Git instalado
git --version

# Configurar Git (si es primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

---

## 🎯 **RESUMEN DEL FLUJO:**

```
1. 📁 Archivos en tu PC (github-ready/)
2. ⬆️  Git push → GitHub
3. 🔗 GitHub conectado con Vercel  
4. 🚀 Vercel despliega automáticamente
5. 🌐 ¡Aplicación online!
```

**📞 ¿En qué paso necesitas ayuda específica?**
- ¿Instalar Git?
- ¿Crear repositorio en GitHub?
- ¿Comandos de terminal?
- ¿Configurar Vercel? 