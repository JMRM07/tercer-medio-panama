# 🔍 DIAGNÓSTICO URGENTE - ENCONTRAR EL ERROR

## 🎯 VAMOS A IDENTIFICAR EXACTAMENTE QUÉ ESTÁ FALLANDO

### ⚡ PASO 1: Verificar Variables de Entorno

**Abrir esta URL en tu navegador:**
```
https://tu-proyecto.vercel.app/api/test-config
```

#### ✅ **Si ves esto - Variables OK:**
```json
{
  "success": true,
  "message": "Configuración correcta",
  "connection": "OK"
}
```

#### ❌ **Si ves esto - Variables MAL:**
```json
{
  "error": "Variables de entorno no configuradas"
}
```
**Solución:** Configurar variables en Vercel Settings → Environment Variables

---

### ⚡ PASO 2: Verificar Supabase

1. **Ir a:** https://supabase.com/dashboard
2. **Seleccionar tu proyecto**
3. **Ir a:** Table Editor
4. **Verificar que existe la tabla `clientes`**

#### ✅ **Si existe la tabla:**
- Continúa al Paso 3

#### ❌ **Si NO existe la tabla:**
- **Ir a:** SQL Editor en Supabase
- **Ejecutar este script:**
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    ruc VARCHAR(50) NOT NULL,
    dv VARCHAR(2) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true
);
```

---

### ⚡ PASO 3: Probar API Directamente

**Abrir DevTools (F12) → Console y ejecutar:**

```javascript
fetch('/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nombre: 'Test Cliente',
        ruc: '123456789',
        dv: '01',
        email: 'test@test.com',
        telefono: '123456789'
    })
})
.then(response => response.json())
.then(data => console.log('Resultado:', data))
.catch(error => console.error('Error:', error));
```

#### ✅ **Resultado esperado:**
```json
{
  "success": true,
  "message": "Cliente creado exitosamente"
}
```

#### ❌ **Posibles errores:**

**Error de variables:**
```json
{
  "error": "Variables de entorno no configuradas"
}
```
→ **Solución:** Configurar variables en Vercel

**Error de tabla:**
```json
{
  "error": "relation \"clientes\" does not exist"
}
```
→ **Solución:** Ejecutar script SQL en Supabase

**Error de conexión:**
```json
{
  "error": "Invalid API key"
}
```
→ **Solución:** Verificar SUPABASE_ANON_KEY

---

### ⚡ PASO 4: Verificar en la Interfaz

1. **Abrir tu app en Vercel**
2. **Ir a Clientes**
3. **Abrir DevTools (F12) → Console**
4. **Intentar agregar un cliente**
5. **Ver errores en console**

#### Errores comunes:

**Error de red:**
```
Failed to fetch
```
→ **Problema:** API no disponible

**Error 500:**
```
Error interno del servidor
```
→ **Problema:** Variables o base de datos

**Error de CORS:**
```
CORS error
```
→ **Problema:** Configuración de headers

---

## 🔧 SOLUCIONES RÁPIDAS

### ❌ **Variables no configuradas:**
1. Ir a Vercel Dashboard
2. Proyecto → Settings → Environment Variables
3. Agregar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Redeploy

### ❌ **Tabla no existe:**
1. Ir a Supabase → SQL Editor
2. Ejecutar script de creación de tabla
3. Verificar en Table Editor

### ❌ **Credenciales incorrectas:**
1. Ir a Supabase → Settings → API
2. Copiar nuevamente URL y Key
3. Actualizar en Vercel
4. Redeploy

---

## 📋 CHECKLIST DE DIAGNÓSTICO

### Variables de entorno:
- [ ] `/api/test-config` devuelve success: true
- [ ] SUPABASE_URL configurada en Vercel
- [ ] SUPABASE_ANON_KEY configurada en Vercel

### Base de datos:
- [ ] Tabla `clientes` existe en Supabase
- [ ] Puedes ver la tabla en Table Editor
- [ ] Script SQL ejecutado correctamente

### API:
- [ ] Prueba con fetch() en console funciona
- [ ] No hay errores 500 en la respuesta
- [ ] Headers CORS configurados

### Frontend:
- [ ] No hay errores en console del navegador
- [ ] Mensajes de error específicos visibles
- [ ] Formulario se envía correctamente

---

## 🆘 SI NADA FUNCIONA

**Dime exactamente qué ves cuando:**

1. **Abres:** `https://tu-proyecto.vercel.app/api/test-config`
2. **Ejecutas:** El script fetch() en console
3. **Intentas:** Agregar un cliente en la interfaz
4. **Ves:** En console de DevTools (F12)

**Con esa información específica puedo ayudarte a resolver el problema exacto.**

---

## 🎯 EL OBJETIVO

**Al final de este diagnóstico sabremos EXACTAMENTE:**
- ✅ Si las variables están configuradas
- ✅ Si Supabase funciona
- ✅ Si la API responde
- ✅ Cuál es el error específico

**¡Sigue estos pasos y encontraremos el problema!** 🕵️‍♂️ 