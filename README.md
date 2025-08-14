# Portafolio — María José Duarte Torres

Bienvenido/a al portafolio profesional de María José Duarte Torres: arquitecta, investigadora y programadora.

## Estructura del proyecto

- **index.html**: Página principal de portafolio, incluye todas las secciones en sliders/carouseles horizontales.
- **styles.css**: Estilos puros CSS, minimalista y adaptable. Puede usar Tailwind vía CDN.
- **app.js**: Lógica JS para cargar datos, renderizar sliders, manejar filtros, modales y tema claro/oscuro.
- **content/**: Archivos JSON con datos de cada sección (edita aquí tus proyectos).
  - `architecture.json`: Proyectos de arquitectura.
  - `code.json`: Proyectos de programación.
  - `research.json`: Publicaciones/investigación.
  - `podcast.json`: Episodios o enlaces de podcast.
- **assets/**: Imágenes y PDFs relacionados. Usa `placeholder.png` si no tienes imágenes (puedes reemplazarlo).
- **robots.txt** y **sitemap.xml**: Para SEO y permitir indexación.
- **sw.js**: Service Worker simple para cachear assets y contenido (opcional, mejora offline).
- **README.md**: Este archivo.

## ¿Cómo editar los datos?

1. **Proyectos y contenido**: Abre los archivos en `content/` y edita/agrega tus ítems siguiendo el esquema de ejemplo.
2. **Imágenes y PDFs**: Coloca tus imágenes y archivos PDF en la carpeta `assets/`. Actualiza las rutas en los archivos JSON para que apunten a tus archivos.
3. **Datos de contacto/enlaces**: Modifica los enlaces rápidos en la sección contacto de `index.html` si lo necesitas.

## Publicar en GitHub Pages

1. Haz push del repositorio con todos los archivos.
2. Ve a la configuración de GitHub Pages en tu repo y selecciona la rama principal (`main` o `master`).
3. La página estará disponible en: