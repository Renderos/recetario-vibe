# Sazón · Recetario 🍳

Aplicación web para explorar recetas del mundo: búscalas por nombre, recórrelas por categoría, abre el detalle con ingredientes y pasos, y guarda tus favoritas. Se construyó con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS v4**, usando **Vibe Coding** con Claude Code como copiloto.

**🔗 Demo en producción:** _URL_PENDIENTE_

> El proceso de desarrollo guiado por IA (prompts, iteraciones, decisiones y desafíos) está documentado en [VIBE_CODING.md](./VIBE_CODING.md).

---

## Funcionalidades

| Ruta | Tipo | Qué hace |
| --- | --- | --- |
| `/` | Server + Client | Hero, **receta sorpresa** (Client Component → `/api/random`) y categorías destacadas |
| `/categorias` | Server Component | Las 14 categorías de TheMealDB (prerenderizada y cacheada) |
| `/categorias/[nombre]` | Server Component | Recetas de una categoría (`generateStaticParams`, 404 si no existe) |
| `/recetas/[id]` | Server Component | Detalle: ingredientes, pasos numerados, etiquetas, video y botón de favorito |
| `/buscar` | Client Component | Buscador con debounce, sugerencias y `?q=` en la URL (→ `/api/recipes`) |
| `/favoritos` | Client Component | Favoritos en `localStorage`; cada receta se pide a `/api/recipes/[id]` |

### API interna (Route Handlers)

| Endpoint | Respuesta |
| --- | --- |
| `GET /api/recipes?q=pasta` | `{ query, count, recipes }` · 400 si `q` tiene menos de 2 caracteres |
| `GET /api/recipes/:id` | Receta completa · 404 si no existe |
| `GET /api/random` | Receta aleatoria (nunca se cachea) |
| `GET /api/categories` | `{ count, categories }` |

Todos los errores devuelven `{ "error": "mensaje" }` con el código HTTP adecuado (400, 404 o 502 si TheMealDB falla).

### Requisitos de la actividad cubiertos

- **Next.js 16.4 + App Router + TypeScript** (modo estricto).
- **6 páginas** distintas + 4 Route Handlers que consumen la API externa [TheMealDB](https://www.themealdb.com/api.php).
- **Server y Client Components combinados**: p. ej. `RecipeCard` (Server) incrusta `FavoriteButton` (Client).
- **Hooks de React**: `useState` y `useEffect` en el buscador, la receta sorpresa, favoritos y la navbar; `useSyncExternalStore` para `localStorage`.
- **Responsive**: grillas de 1→2→3 columnas y menú hamburguesa en móvil. Incluye modo oscuro automático.
- **Loading UI**: `loading.tsx` global y por ruta con skeletons; estados de carga propios en los Client Components.
- **Error UI**: `error.tsx` (global y del detalle de receta), `global-error.tsx`, `not-found.tsx` y estados de error con botón *Reintentar* en el cliente.
- **Variables de entorno** en `.env.local` (plantilla en `.env.example`); la API key solo se usa en el servidor.

---

## Stack

- [Next.js 16](https://nextjs.org) con Cache Components (`'use cache'` + `cacheLife`) y Turbopack
- React 19 · TypeScript 5 · Tailwind CSS 4
- `next/image` para optimizar las fotos y `next/font` (Fraunces + Inter)
- Despliegue en [Vercel](https://vercel.com)

## Estructura

```
src/
├── app/
│   ├── api/                  # Route Handlers (recipes, recipes/[id], random, categories)
│   ├── buscar/               # Búsqueda (Client)
│   ├── categorias/           # Listado + [nombre] (Server)
│   ├── favoritos/            # Favoritos (Client)
│   ├── recetas/[id]/         # Detalle (Server) + loading + error
│   ├── layout.tsx            # Layout raíz con Navbar y Footer
│   ├── loading.tsx · error.tsx · not-found.tsx · global-error.tsx
│   └── page.tsx              # Inicio
├── components/               # UI reutilizable (Server y Client)
├── hooks/use-favorites.ts    # Favoritos en localStorage
└── lib/
    ├── mealdb.ts             # Servicio server-only que habla con TheMealDB
    ├── api-response.ts       # Respuestas de error uniformes
    ├── categories-es.ts      # Traducción de categorías
    └── types.ts              # Tipos de dominio
```

---

## Instalación y uso local

Requisitos: **Node.js 20.9+** y npm.

```bash
git clone https://github.com/Renderos/recetario-vibe.git
cd recetario-vibe
npm install
cp .env.example .env.local   # en Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>.

### Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `MEALDB_API_URL` | No | URL base de TheMealDB. Por defecto `https://www.themealdb.com/api/json/v1` |
| `MEALDB_API_KEY` | No | API key de TheMealDB. `1` es la key pública de desarrollo |
| `NEXT_PUBLIC_APP_NAME` | No | Nombre visible de la app. Por defecto `Sazón` |

`.env.local` está en `.gitignore`; solo se versiona `.env.example`.

### Scripts

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run start   # sirve el build
npm run lint    # ESLint
```

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new) (detecta Next.js automáticamente).
2. En **Settings → Environment Variables** añade las variables de `.env.example`.
3. Despliega. Cada push a `main` genera un nuevo despliegue de producción.

O con la CLI: `vercel --prod`.

---

Datos y fotos: [TheMealDB](https://www.themealdb.com). Proyecto académico del Bootcamp Full Stack Jr. 35.
