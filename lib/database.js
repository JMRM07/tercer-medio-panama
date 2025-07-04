// Configuración de base de datos para Vercel 
import mysql from 'mysql2/promise'; 
 
export async function connectDB() { 
  const connection = await mysql.createConnection({ 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT 
  });   
  return connection; 
} 
