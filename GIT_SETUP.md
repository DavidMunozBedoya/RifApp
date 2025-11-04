# 📦 Guía para Subir tu Proyecto a GitHub

## ✅ Ya completado:
- ✅ Repositorio git inicializado
- ✅ Archivos agregados
- ✅ Primer commit realizado

## 📝 Pasos siguientes:

### Paso 1: Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre del repositorio: `RifApp` (o el que prefieras)
3. Descripción (opcional): "Sistema de apuestas con Node.js, Express y MongoDB"
4. Visibilidad: Elige **Público** o **Privado**
5. **NO marques** "Initialize this repository with a README"
6. Haz clic en **"Create repository"**

### Paso 2: Copiar la URL de tu repositorio
Después de crear el repositorio, GitHub te mostrará una página con instrucciones.
Copia la URL de tu repositorio, será algo como:
- `https://github.com/TU_USUARIO/RifApp.git` (HTTPS)
- `git@github.com:TU_USUARIO/RifApp.git` (SSH)

### Paso 3: Conectar y subir el código
Ejecuta estos comandos en tu terminal (reemplaza `TU_USUARIO` y `RifApp` con tus datos):

```bash
# Conectar tu repositorio local con GitHub (usa la URL que copiaste)
git remote add origin https://github.com/TU_USUARIO/RifApp.git

# Verificar que se conectó correctamente
git remote -v

# Subir tu código a GitHub
git branch -M main
git push -u origin main
```

### Si GitHub te pide autenticación:

**Opción A: Personal Access Token (Recomendado)**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Usa ese token como contraseña cuando git te lo pida

**Opción B: GitHub CLI**
```bash
# Instalar GitHub CLI (si no lo tienes)
# Windows: winget install GitHub.cli
# Luego:
gh auth login
git push -u origin main
```

## 🎉 ¡Listo!
Una vez completado, tu código estará en GitHub y podrás desplegarlo en Render o Railway.
