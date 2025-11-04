# 🚀 Guía de Despliegue - Sistema de Apuestas

Esta guía te ayudará a desplegar tu aplicación en hosting gratuito usando **Render** (recomendado) o **Railway**.

---

## 📋 Prerrequisitos

1. **Cuenta de GitHub**: Tu código debe estar en un repositorio de GitHub
2. **Cuenta de MongoDB Atlas** (gratis): Para la base de datos en la nube
3. **Cuenta en Render** o **Railway** (ambas gratuitas)

---

## 🗄️ Paso 1: Configurar MongoDB Atlas (Base de Datos)

### 1.1 Crear cuenta en MongoDB Atlas
1. Ve a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Selecciona el plan **FREE (M0 Sandbox)**

### 1.2 Crear un Cluster
1. Elige la región más cercana a ti
2. Crea el cluster (puede tardar 3-5 minutos)

### 1.3 Configurar acceso a la base de datos
1. Ve a **Database Access** (Acceso a Base de Datos)
2. Crea un nuevo usuario:
   - Username: `rifapp-admin` (o el que prefieras)
   - Password: Genera una contraseña segura y **GUÁRDALA**
   - Database User Privileges: `Read and write to any database`

### 1.4 Configurar red (IP Whitelist)
1. Ve a **Network Access**
2. Haz clic en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0) - para desarrollo
   - ⚠️ En producción, es mejor limitar las IPs

### 1.5 Obtener la cadena de conexión (Connection String)
1. Ve a **Database** → **Connect**
2. Selecciona **Connect your application**
3. Elige **Node.js** y la versión más reciente
4. Copia la cadena de conexión, será algo como:
   ```
   mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Reemplaza `<password>`** con la contraseña que creaste
6. **Agrega el nombre de la base de datos** al final:
   ```
   mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/MICONEXION?retryWrites=true&w=majority
   ```
7. **¡GUARDA ESTA URL COMPLETA!** La necesitarás en el siguiente paso

---

## 🌐 Paso 2: Desplegar en Render (Recomendado)

### 2.1 Preparar tu repositorio
1. Asegúrate de que tu código esté en GitHub
2. Verifica que tengas estos archivos:
   - `package.json`
   - `server.js`
   - `index.html`
   - `render.yaml` (ya lo creamos)

### 2.2 Crear cuenta en Render
1. Ve a [https://render.com](https://render.com)
2. Crea una cuenta (puedes usar GitHub para iniciar sesión)

### 2.3 Crear un nuevo servicio Web
1. En el dashboard, haz clic en **New +** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio de tu aplicación

### 2.4 Configurar el servicio
- **Name**: `rifapp` (o el nombre que prefieras)
- **Region**: Elige la región más cercana
- **Branch**: `main` (o `master`)
- **Root Directory**: Déjalo vacío (si tu código está en la raíz)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Selecciona **Free**

### 2.5 Configurar Variables de Entorno
En la sección **Environment Variables**, agrega:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/MICONEXION?retryWrites=true&w=majority
DB_NAME=MICONEXION
COLLECTION_NAME=Rifa
```

**⚠️ IMPORTANTE**: Reemplaza `usuario:contraseña@cluster0.xxxxx.mongodb.net` con tu cadena de conexión real de MongoDB Atlas.

### 2.6 Desplegar
1. Haz clic en **Create Web Service**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera 3-5 minutos mientras se despliega
4. Verás una URL tipo: `https://rifapp.onrender.com`
5. **¡Listo!** Tu aplicación estará disponible en esa URL

---

## 🚂 Alternativa: Desplegar en Railway

### 1. Crear cuenta en Railway
1. Ve a [https://railway.app](https://railway.app)
2. Inicia sesión con GitHub

### 2. Crear un nuevo proyecto
1. Haz clic en **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Selecciona tu repositorio

### 3. Configurar Variables de Entorno
1. Ve a la pestaña **Variables**
2. Agrega las mismas variables que en Render:
   - `MONGO_URI`
   - `DB_NAME`
   - `COLLECTION_NAME`

### 4. Desplegar
1. Railway detectará automáticamente que es un proyecto Node.js
2. Desplegará automáticamente
3. Obtendrás una URL tipo: `https://rifapp-production.up.railway.app`

---

## ✅ Verificar que funciona

1. Visita la URL que te proporcionó Render/Railway
2. Deberías ver tu aplicación funcionando
3. Prueba registrar una apuesta
4. Verifica que la tabla muestre los datos

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que la `MONGO_URI` esté correcta
- Asegúrate de que reemplazaste `<password>` con tu contraseña real
- Verifica que agregaste la IP de Render/Railway en MongoDB Atlas Network Access
- O usa `0.0.0.0/0` para permitir todas las IPs (solo para desarrollo)

### Error: "Port already in use"
- Render/Railway asignan automáticamente el puerto
- Asegúrate de que en `server.js` uses `process.env.PORT || 3000`

### La aplicación no carga
- Revisa los logs en el dashboard de Render/Railway
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que el repositorio tenga todos los archivos necesarios

---

## 📝 Notas Importantes

1. **Plan Gratuito de Render**:
   - Tu aplicación puede "dormir" después de 15 minutos de inactividad
   - El primer acceso después de dormir puede tardar 30-60 segundos
   - Puedes actualizar al plan pago para evitar esto

2. **Plan Gratuito de Railway**:
   - Tiene $5 de crédito gratis al mes
   - Puede ser suficiente para aplicaciones pequeñas

3. **MongoDB Atlas Free**:
   - 512 MB de almacenamiento
   - Perfecto para proyectos pequeños
   - Si necesitas más, puedes actualizar el plan

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y disponible en internet. Comparte la URL con quien quieras que la use.
