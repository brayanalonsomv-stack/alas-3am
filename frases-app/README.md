# Frases del Alma 🖤

Generador de frases emocionales con IA para redes sociales.

---

## Cómo subir esto a internet (paso a paso)

### Paso 1 — Crea tu cuenta en GitHub
1. Ve a https://github.com y crea una cuenta gratuita
2. Haz clic en "New repository"
3. Ponle el nombre `frases-del-alma`
4. Déjalo público y haz clic en "Create repository"

### Paso 2 — Sube los archivos
En la página de tu repositorio recién creado:
1. Haz clic en "uploading an existing file"
2. Arrastra TODOS los archivos de esta carpeta
3. Haz clic en "Commit changes"

### Paso 3 — Crea tu cuenta en Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign up" → "Continue with GitHub"
3. Autoriza la conexión

### Paso 4 — Despliega el proyecto
1. En Vercel haz clic en "Add New Project"
2. Selecciona tu repositorio `frases-del-alma`
3. Haz clic en "Deploy" (Vercel detecta Next.js automáticamente)

### Paso 5 — Agrega tu API Key de Anthropic
1. Ve a https://console.anthropic.com y crea una cuenta
2. En "API Keys" genera una nueva key
3. En Vercel ve a tu proyecto → Settings → Environment Variables
4. Agrega: `ANTHROPIC_API_KEY` = (pega tu key aquí)
5. Haz clic en "Redeploy"

### ¡Listo! 🎉
Tu página estará en `https://frases-del-alma.vercel.app` (o similar)

---

## Costo aproximado
- GitHub: GRATIS
- Vercel: GRATIS (hasta 100GB de bandwidth/mes)
- Anthropic API: ~$0.01 por cada 100 frases generadas (prácticamente gratis)

---

## Personalización
- Cambia el nombre en `pages/index.js` → línea del `<title>` y `<h1>`
- Agrega más frases o categorías en `pages/api/generar.js`
- Cambia colores en `styles/Home.module.css`
