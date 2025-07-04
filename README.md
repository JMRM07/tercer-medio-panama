# Tercer Medio Panama - Sistema de Gestión

Sistema integral de gestión para **Tercer Medio Panama** desarrollado en Node.js con soporte para MySQL y SQL Server.

## 🚀 Características

- **Gestión de Clientes**: Registro, edición y consulta de clientes
- **Cotizaciones**: Creación y seguimiento de cotizaciones
- **Contratos**: Gestión completa de contratos
- **Facturas**: Sistema de facturación integrado
- **Reportes**: Generación de reportes detallados
- **Multi-Base de Datos**: Soporte para MySQL y SQL Server

## 📋 Requisitos Previos

- **Node.js** (versión 14 o superior)
- **MySQL** o **SQL Server** 
- **Git** (para clonar el repositorio)

## 🛠️ Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/tercer-medio-panama.git
cd tercer-medio-panama
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
# Copia el archivo de ejemplo
copy config.env.example configuracion.env

# Edita configuracion.env con tus datos de base de datos
```

### 4. Inicializar Base de Datos
```bash
node setup-database.js
```

### 5. Iniciar Aplicación
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## ⚙️ Configuración

### Archivo `configuracion.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tercer_medio_panama
PORT=3000
```

### Base de Datos Soportadas
- **MySQL**: Configuración por defecto
- **SQL Server**: Cambiar configuración en `config/database.js`

## 📁 Estructura del Proyecto

```
proyecto/
├── assets/           # Recursos estáticos
├── config/           # Configuración de base de datos  
├── routes/           # Rutas de la API
├── middleware/       # Middleware de autenticación
├── *.html           # Páginas web
├── *.js             # Lógica de frontend
├── *.css            # Estilos
└── server.js        # Servidor principal
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor |
| `npm run dev` | Modo desarrollo con recarga automática |
| `node setup-database.js` | Inicializa la base de datos |

## 📱 Funcionalidades

### 👥 Gestión de Clientes
- Registro de nuevos clientes
- Edición de información existente
- Búsqueda y filtrado avanzado

### 💰 Cotizaciones
- Creación de cotizaciones detalladas
- Seguimiento de estado
- Conversión a contratos

### 📄 Contratos
- Gestión completa de contratos
- Estados: Pendiente, Activo, Completado
- Histórico de cambios

### 🧾 Facturación
- Generación automática de facturas
- Control de pagos
- Reportes financieros

## 🛡️ Seguridad

- Autenticación JWT
- Middleware de seguridad
- Validación de datos de entrada
- Protección CORS configurada

## 📊 Reportes

El sistema incluye varios tipos de reportes:
- Ventas por período
- Estado de contratos
- Análisis de clientes
- Reportes financieros

## 🚀 Despliegue

### Desarrollo Local
```bash
# Modo desarrollo
npm run dev
```

### Producción
```bash
# Configurar variables de entorno de producción
# Ejecutar en modo producción
NODE_ENV=production npm start
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto.

## 🔄 Actualizaciones

### Versión 1.0.0
- Sistema base completo
- Gestión de clientes, cotizaciones, contratos y facturas
- Soporte multi-base de datos
- Sistema de reportes

---

**Desarrollado para Tercer Medio Panama** 