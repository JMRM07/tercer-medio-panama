# 🗑️ Guía para Probar el Botón de Eliminar

## 📋 Pasos para Probar la Funcionalidad

### 1. **Verificar Variables de Entorno en Vercel**
```
⚠️ IMPORTANTE: Asegúrate de que las variables estén configuradas en Vercel:
- SUPABASE_URL: https://nlejwziqwoxjyrqtdwja.supabase.co
- SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWp3emlxd294anlycXRkd2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTk5MjMsImV4cCI6MjA2NzE3NTkyM30.Qyv6urLZRGZ55gLlN3ktMNfxq8hCiyA4QXfMQZZRc0E
```

### 2. **Abrir la Aplicación**
1. Ve a tu página de Vercel: https://tu-app.vercel.app
2. Inicia sesión con tus credenciales
3. Navega a "Gestión de Clientes"

### 3. **Crear un Cliente de Prueba**
1. **Completa el formulario:**
   - Nombre: "Cliente de Prueba"
   - RUC: "12345678"
   - DV: "01"
   - Email: "prueba@test.com"
   - Teléfono: "+507 1234-5678"

2. **Haz clic en "Guardar Cliente"**
3. **Verifica que aparezca en la tabla**

### 4. **Probar el Botón de Eliminar**
1. **Haz clic en el botón 🗑️** junto al cliente que acabas de crear
2. **Verifica que se muestre el modal de confirmación**
3. **Revisa que el mensaje diga**: "¿Está seguro que desea eliminar al cliente 'Cliente de Prueba'?"
4. **Haz clic en "Eliminar"**
5. **Verifica que:**
   - El botón cambie a "Eliminando..."
   - Aparezca un mensaje de éxito
   - El cliente desaparezca de la tabla
   - El modal se cierre automáticamente

### 5. **Verificar en la Consola del Navegador**
**Abre las herramientas de desarrollo (F12) y revisa que aparezcan estos logs:**

```
✅ Logs esperados:
- "Configurando X botones de eliminar"
- "Botón de eliminar clickeado, ID: X"
- "Solicitando eliminación del cliente con ID: X"
- "Mostrando modal de confirmación para cliente: Cliente de Prueba"
- "Eliminando cliente con ID: X"
- "✅ Cliente eliminado: [datos del cliente]"
```

### 6. **Pruebas Adicionales**
1. **Prueba cancelar la eliminación:**
   - Haz clic en 🗑️
   - Haz clic en "Cancelar"
   - Verifica que el modal se cierre y el cliente permanezca

2. **Prueba cerrar el modal:**
   - Haz clic en 🗑️
   - Haz clic en la X (cerrar)
   - Verifica que el modal se cierre

3. **Prueba hacer clic fuera del modal:**
   - Haz clic en 🗑️
   - Haz clic en el área gris fuera del modal
   - Verifica que el modal se cierre

## 🔧 Si Algo No Funciona

### ❌ **El botón no responde:**
- Revisa la consola para ver errores
- Verifica que los logs aparezcan
- Recarga la página

### ❌ **El modal no aparece:**
- Verifica en la consola si dice "No se encontró el modal de confirmación"
- Asegúrate de que el HTML tenga el modal

### ❌ **Error al eliminar:**
- Verifica las variables de entorno en Vercel
- Usa el endpoint de diagnóstico: `/api/diagnostico`
- Revisa que la tabla `clientes` exista en Supabase

### ❌ **El cliente no se elimina:**
- Verifica que el ID sea correcto
- Revisa los logs del API
- Asegúrate de que tengas permisos en Supabase

## 🌐 URLs Útiles

- **Aplicación:** https://tu-app.vercel.app
- **Diagnóstico:** https://tu-app.vercel.app/api/diagnostico
- **Prueba API:** https://tu-app.vercel.app/api/test-config
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard

## 📞 Siguiente Paso

Una vez que hayas probado el botón de eliminar, avísame:
- ✅ Si funciona correctamente
- ❌ Si hay algún error (comparte los logs de la consola)

¡Estamos muy cerca de tener todo funcionando perfectamente! 🚀 