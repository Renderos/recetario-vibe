# Proceso de Vibe Coding

Registro de cómo se construyó **Sazón · Recetario** con un asistente de IA como copiloto principal.

- **Herramienta:** Claude Code (app de escritorio), modelo Claude Opus 5.5
- **Rol del estudiante:** definir el producto, elegir entre alternativas, revisar y aprobar el código y la publicación
- **Rol de la IA:** proponer la arquitectura, generar el código, ejecutar lint/build, probar en el navegador y corregir errores
- **Fecha:** noviembre de 2026
- **Producción:** https://recetario-vibe.vercel.app

---

## 1. Flujo de trabajo

```
Idea → prompt inicial → la IA propone opciones → el estudiante decide
     → generación por capas (config → API → páginas → estados de carga/error)
     → validación (tsc · eslint · next build · navegador · simulación de fallos)
     → corrección → commit → despliegue
```

Cada capa terminó en un commit, de modo que el historial de Git refleja las iteraciones (ver sección 5).

---

## 2. Prompts principales

### Prompt 1 · Concepción del proyecto

> Pegué el enunciado completo de la actividad: «Implementación de Aplicación Next.js mediante Vibe Coding… Next.js 16 con App Router, TypeScript, Tailwind, mínimo 4 rutas, consumo de API mediante Route Handlers, Server y Client Components, useState/useEffect, responsive, loading y error UI, despliegue en Vercel, repositorio en GitHub, .env.local…»

**Qué hizo la IA:** revisó el entorno (Node 22, npm, git, GitHub CLI y Vercel CLI ya autenticados) y antes de escribir código me preguntó dos cosas que eran decisión mía:

1. **Temática** — propuso cuatro opciones con su API: recetario (TheMealDB), explorador de países (REST Countries), películas (TMDB, requiere registrarse) y clima (Open-Meteo).
2. **Publicación** — si debía crear el repo público y desplegar en Vercel, o dejarlo solo en local.

**Mis respuestas:** «Recetario» y «Sí, ambos».

**Por qué el recetario:** TheMealDB no exige registro, pero su API key va en la URL (`/api/json/v1/{KEY}/…`). Eso permite cumplir el requisito de `.env.local` de forma natural y además justifica los Route Handlers: la key se queda en el servidor.

### Prompt 2 · Arquitectura (planteada por la IA y aprobada)

La IA definió el alcance antes de generar código:

- **Rutas:** `/`, `/categorias`, `/categorias/[nombre]`, `/recetas/[id]`, `/buscar`, `/favoritos`
- **Route Handlers:** `/api/recipes`, `/api/recipes/[id]`, `/api/random`, `/api/categories`
- **Capa de datos:** un único servicio `server-only` (`src/lib/mealdb.ts`) que normaliza la respuesta cruda de TheMealDB (`strIngredient1…20`, instrucciones en un solo string) a tipos propios
- **Reparto Server/Client:** listados y detalle como Server Components; buscador, receta sorpresa y favoritos como Client Components, porque necesitan estado, eventos o `localStorage`

### Prompt 3 · Leer la documentación de la versión instalada

`create-next-app` generó un `AGENTS.md` que avisa: *«This is NOT the Next.js you know… Read the relevant guide in node_modules/next/dist/docs/»*. Antes de escribir código, la IA leyó las guías de **Caching**, **Route Handlers**, **error.js**, **Image** y **Dynamic Routes** incluidas en el paquete. Así detectó tres cambios que su conocimiento previo no reflejaba:

- Cache Components viene **activado por defecto** (`cacheComponents: true`). Los datos se cachean con `'use cache'` + `cacheLife` y lo que es dinámico debe ir dentro de `<Suspense>`.
- `error.tsx` recibe la prop **`retry`** (antes era `reset`).
- Existen los tipos globales generados `PageProps<'/ruta'>`, `LayoutProps` y `RouteContext<'/ruta'>`.

### Prompt 4 · Generación por capas

1. **Base:** paleta cálida con modo oscuro (tokens en `@theme` de Tailwind v4), fuentes Fraunces + Inter, navbar responsive y `.env.example` documentado
2. **API:** servicio con `'use cache'` (categorías por días, recetas por horas, la aleatoria sin caché) y los 4 Route Handlers con validación y errores JSON uniformes
3. **Páginas:** las seis rutas, `RecipeCard`, `FavoriteButton`, skeletons y el hook `useFavorites`
4. **Estados:** `loading.tsx` (global, categoría y receta), `error.tsx` (global y receta), `not-found.tsx` y `global-error.tsx`

### Prompt 5 · Validación

Tras cada capa, la IA ejecutó `tsc --noEmit`, `npm run lint` y `npm run build`, y probó la app en el navegador integrado:

- Inicio, búsqueda (`?q=lasagne`), detalle de receta, categorías y 404
- Agregar un favorito y ver cómo se actualiza el contador de la navbar
- Vista móvil (375 px) y menú hamburguesa
- Códigos HTTP de cada endpoint con `curl` (200, 400, 404)
- **Simulación de caída de la API:** el build de producción se levantó con `MEALDB_API_URL` apuntando a un puerto cerrado para comprobar `error.tsx` y los estados de error del cliente

---

## 3. Iteraciones y desafíos resueltos con la IA

### Desafío 1 · `react-hooks/set-state-in-effect`

**Síntoma:** la primera versión generada pasó TypeScript, pero ESLint (reglas de React 19) marcó 5 errores: *«Calling setState synchronously within an effect can trigger cascading renders»*. Aparecían en `useFavorites`, la navbar, el buscador, la receta sorpresa y favoritos.

**Solución (iterada con la IA):**

| Componente | Antes | Después |
| --- | --- | --- |
| `useFavorites` | `useState` + `useEffect` leyendo `localStorage` | `useSyncExternalStore` con snapshot estable. Es la API pensada para suscribirse a un sistema externo y sincroniza todos los componentes y pestañas |
| Navbar | Efecto que cerraba el menú al cambiar de ruta | El menú se cierra en el `onClick` del enlace |
| Buscador | `setState({status:"loading"})` dentro del efecto | El estado se **deriva**: si el último resultado no coincide con la clave `query#intento`, se está cargando |
| Receta sorpresa | `setState` de carga dentro del efecto | El estado de carga se fija en el manejador del botón |
| Favoritos | Bandera `loading` en estado | Se deriva de los ids pendientes |

**Aprendizaje:** un efecto debe sincronizar React con algo externo (red, DOM, almacenamiento), no copiar estado que se puede calcular.

### Desafío 2 · `usePathname()` bloqueaba el prerender

**Síntoma:** `next build` falló:

```
Error: Route "/recetas/[id]": Next.js encountered URL data `usePathname()`
in a Client Component outside of `<Suspense>`.
```

La navbar vive en el layout raíz y usa `usePathname()` para resaltar el enlace activo. Con Cache Components, eso impedía generar el *shell* estático de las rutas dinámicas.

**Solución:** dividir la navbar en `NavbarView` (presentación pura) y `NavbarWithPathname` (lee la URL), con un `<Suspense>` cuyo fallback es la misma vista sin enlace activo. El build pasó: `/recetas/[id]` y `/categorias/[nombre]` quedaron como **Partial Prerender** (◐).

### Desafío 3 · Los errores dentro de `'use cache'` llegan redactados

**Síntoma:** al simular la caída de TheMealDB, `/api/recipes` devolvía **500** «error inesperado» en lugar de **502** con un mensaje claro. El log del servidor mostraba:

```
[Error: An error occurred in the Server Components render. The specific
message is omitted in production builds…] { digest: '1096644054' }
```

Las funciones con `'use cache'` serializan sus resultados y errores. En producción, la excepción pierde su clase (`MealDbError`) y su mensaje, así que `instanceof` fallaba.

**Solución:** como la única fuente de fallo de los handlers es TheMealDB, cualquier error no reconocido se responde como **502 Bad Gateway** con un mensaje seguro. La ruta `/api/random`, que no se cachea, conserva el mensaje específico. Se verificó de nuevo contra el servidor «roto»: los tres endpoints devuelven 502.

### Desafío 4 · Detalles menores

- Despliegue: la CLI de Vercel no tenía sesión y el conector de Vercel respondió 403 al crear el proyecto → el estudiante hizo `vercel login`, y la IA ejecutó `vercel link` (que conectó el repo de GitHub para despliegues automáticos), cargó las variables de entorno y `vercel deploy --prod`.

- `Response.json<T>()` no acepta genéricos en la versión de tipos instalada → se cambió a `{…} satisfies ApiError`.
- `RouteContext` y `PageProps` no existían para las rutas nuevas → hubo que ejecutar `next typegen` (el `next dev`/`build` también los regenera).
- El patrón `.env*` del `.gitignore` también ignoraba `.env.example` → se añadió la excepción `!.env.example`.
- Next 16 no permite dos `next dev` en la misma carpeta → para la prueba de caída se usó `next start` sobre el build.

---

### Iteración 5 · Switch de modo claro / oscuro

> Prompt: «añádele un switch para modo oscuro y claro»

- El CSS pasó de depender solo de `prefers-color-scheme` a leer el atributo `data-theme` en `<html>`. Si el usuario no ha elegido nada, se sigue respetando el tema del sistema.
- `ThemeToggle` es un Client Component con `role="switch"` y `aria-checked`. Lee el tema con `useSyncExternalStore`, así que reacciona también a cambios del sistema operativo y de otras pestañas.
- **Desafío: el parpadeo.** Si el tema se aplicara al hidratar React, la página se vería un instante con el tema equivocado. Se resolvió con un script inline en `<head>` que aplica el tema guardado antes de pintar, más `suppressHydrationWarning` en `<html>`.
- **Desafío: exportar un string desde un archivo `"use client"`.** Un Server Component que importa una constante de un módulo cliente recibe una referencia, no el valor. Por eso el script y la clave se movieron a `src/lib/theme.ts`, que es un módulo compartido.

---

## 4. Decisiones técnicas

| Decisión | Motivo |
| --- | --- |
| Servicio `server-only` + Route Handlers propios | La API key nunca llega al navegador, y el cliente consume una API limpia y tipada en español |
| `'use cache'` + `cacheLife` por función | Las categorías cambian poco (días) y las recetas casi nada (horas). La aleatoria nunca se cachea (`connection()`) |
| `generateStaticParams` en categorías | Las 14 páginas se prerenderizan en el build |
| Favoritos en `localStorage` | No requiere autenticación ni base de datos y es suficiente para el alcance |
| `next/image` con `remotePatterns` | Optimización automática; las tarjetas usan la variante `/medium` de TheMealDB |
| Categorías traducidas en la UI | TheMealDB está en inglés; la URL conserva el nombre original que espera la API |
| `AbortController` en cada `fetch` del cliente | Evita condiciones de carrera al escribir rápido en el buscador |
| Accesibilidad | `aria-live` en resultados, `aria-pressed` en favoritos, `aria-current` en la navbar, `role="alert"` en errores y respeto a `prefers-reduced-motion` |

---

## 5. Historial de iteraciones (commits)

1. `chore: configurar tema, fuentes, layout y variables de entorno`
2. `feat(api): Route Handlers para recetas, búsqueda, aleatoria y categorías`
3. `feat: páginas de inicio, categorías, receta, búsqueda y favoritos` (incluye los fixes de los desafíos 1 y 2)
4. `fix(api): responder 502 cuando TheMealDB falla` (desafío 3)
5. `docs: README con instalación y uso, VIBE_CODING con el proceso`
6. `docs: enlace al despliegue en Vercel`
7. `feat: switch de modo claro/oscuro`

---

## 6. Reflexión

La IA aceleró mucho la parte mecánica: scaffolding, normalización de datos, skeletons y estilos. Pero el valor estuvo en **validar**. Los tres errores importantes no los detectó la generación inicial, sino el lint, el build de producción y una prueba deliberada de fallo. Además, la versión instalada de Next.js tenía cambios que el conocimiento previo del modelo no reflejaba, así que leer la documentación incluida en `node_modules` fue clave. Dirigir el proceso consistió en decidir el qué, exigir verificación en cada paso y entender por qué funcionaba cada corrección antes de aceptarla.
