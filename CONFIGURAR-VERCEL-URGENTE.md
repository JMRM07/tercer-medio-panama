# 🚨 CONFIGURAR VERCEL - URGENTE

## ❌ PROBLEMA ACTUAL
**El cliente no se guarda porque las variables de entorno no están configuradas en Vercel.**

## ⚡ SOLUCIÓN RÁPIDA

### 1. **Ir a Vercel Dashboard**
```
https://vercel.com/dashboard
```

### 2. **Seleccionar tu proyecto**
- Buscar: `tercer-medio-panama` o `JMRM07/tercer-medio-panama`
- Hacer clic en el proyecto

### 3. **Configurar Variables de Entorno**
1. **Ir a Settings** → **Environment Variables**
2. **Agregar estas 2 variables:**

```bash
SUPABASE_URL
Valor: https://tu-proyecto.supabase.co

SUPABASE_ANON_KEY  
Valor: tu_clave_publica_de_supabase
```

### 4. **Obtener las variables de Supabase**
1. Ir a: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **Settings** → **API**
4. Copiar:
   - **Project URL** → usar como `SUPABASE_URL`
   - **anon public** → usar como `SUPABASE_ANON_KEY`

### 5. **Redesplegar**
- En Vercel, ir a **Deployments**
- Hacer clic en **Redeploy** en el último deployment

## 🔧 VERIFICAR CONFIGURACIÓN

### Endpoint de prueba creado:
```
https://tu-proyecto.vercel.app/api/test-config
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Configuración correcta",
  "connection": "OK"
}
```

**Si hay error:**
```json
{
  "error": "Variables de entorno no configuradas",
  "instructions": "Configura SUPABASE_URL y SUPABASE_ANON_KEY en Vercel"
}
```

## 📝 CHECKLIST RÁPIDO

- [ ] Abrir Vercel Dashboard
- [ ] Seleccionar proyecto
- [ ] Ir a Settings → Environment Variables
- [ ] Agregar `SUPABASE_URL`
- [ ] Agregar `SUPABASE_ANON_KEY`
- [ ] Hacer Redeploy
- [ ] Probar endpoint: `/api/test-config`
- [ ] Probar agregar cliente en la app

## 🆘 SI TIENES PROBLEMAS

### Error más común:
```
Error interno del servidor
```

**Causa:** Variables de entorno no configuradas en Vercel

**Solución:** Seguir los pasos de arriba

### Verificar que Supabase funciona:
1. Ir a tu proyecto en Supabase
2. Ir a **Table Editor**
3. Verificar que existe la tabla `clientes`
4. Si no existe, ejecutar el script SQL básico

## ⏱️ TIEMPO ESTIMADO
- **Configuración:** 5 minutos
- **Despliegue:** 2-3 minutos
- **Total:** ~8 minutos

## 🎯 RESULTADO FINAL
Después de configurar las variables:
- ✅ Los clientes se guardarán correctamente
- ✅ No habrá errores de "Error interno del servidor"
- ✅ La aplicación funcionará 100%

---

**¡Configura las variables de entorno en Vercel y tu aplicación funcionará perfectamente!** 