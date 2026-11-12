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
Idea → prompt inicial → la IA propone la arquitectura → el estudiante decide
     → generación por capas (config → API → páginas → estados de carga/error)
     → validación (tsc · eslint · next build · navegador · simulación de fallos)
     → corrección → commit → despliegue
```

Cada capa terminó en un commit, de modo que el historial de Git refleja las iteraciones (ver sección 5).

---

## 2. Prompts principales

Cada prompt indica qué se pidió, qué hizo la IA y cómo se validó el resultado.

### Prompt 1 · Prompt inicial

> «Quiero desarrollar un **recetario web** llamado **Sazón** con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS**. La app debe permitir explorar recetas por categoría, buscarlas por nombre, ver el detalle de cada una (ingredientes, pasos y video) y guardar favoritas sin crear una cuenta.
>
> Requisitos:
> - Mínimo 4 rutas con App Router.
> - Consumir la API de **TheMealDB** a través de **Route Handlers propios**, sin llamarla directo desde el navegador.
> - Combinar Server Components (listados y detalle) y Client Components (búsqueda, favoritos, interacciones).
> - Usar `useState` y `useEffect` para manejar estados.
> - Diseño responsive para móvil y escritorio, con un estilo cálido de cocina.
> - Estados de carga (`loading.tsx`, skeletons) y de error (`error.tsx`, `not-found.tsx`).
> - La URL y la API key de TheMealDB deben ir en `.env.local`, con un `.env.example` documentado.
> - La app tiene que quedar publicada en GitHub y desplegada en Vercel.
>
> Antes de escribir código, propón la arquitectura y pregúntame lo que necesites decidir.»

**Qué hizo la IA:** revisó el entorno (Node 22, npm, git, GitHub CLI y Vercel CLI) y me preguntó si debía crear el repositorio público y desplegar al terminar. Respondí: «Sí, ambos».

**Por qué TheMealDB:** no exige registro, pero su API key va en la URL (`/api/json/v1/{KEY}/…`). Eso permite cumplir el requisito de `.env.local` de forma natural y justifica los Route Handlers, porque la key se queda en el servidor.

### Prompt 2 · Arquitectura

> «Define las rutas, los endpoints internos, la capa de datos y qué componentes serán Server o Client. Explica por qué.»

**Propuesta de la IA (aprobada):**

- **Rutas:** `/`, `/categorias`, `/categorias/[nombre]`, `/recetas/[id]`, `/buscar`, `/favoritos`
- **Route Handlers:** `/api/recipes`, `/api/recipes/[id]`, `/api/random`, `/api/categories`
- **Capa de datos:** un único servicio `server-only` (`src/lib/mealdb.ts`) que normaliza la respuesta cruda de TheMealDB (`strIngredient1…20`, instrucciones en un solo string) a tipos propios
- **Reparto Server/Client:** listados y detalle como Server Components; buscador, receta sorpresa y favoritos como Client Components, porque necesitan estado, eventos o `localStorage`

### Prompt 3 · Crear el proyecto y revisar la documentación

> «Crea el proyecto con `create-next-app` (TypeScript, Tailwind, ESLint, App Router, carpeta `src`). Antes de programar, revisa la documentación de la versión instalada para no usar APIs viejas.»

**Qué hizo la IA:** generó el proyecto (Next.js 16.4.5). El `AGENTS.md` que crea `create-next-app` avisa: *«This is NOT the Next.js you know… Read the relevant guide in node_modules/next/dist/docs/»*. Por eso la IA leyó las guías de **Caching**, **Route Handlers**, **error.js**, **Image** y **Dynamic Routes** incluidas en el paquete. Así detectó tres cambios:

- Cache Components viene **activado por defecto** (`cacheComponents: true`). Los datos se cachean con `'use cache'` + `cacheLife`, y lo dinámico debe ir dentro de `<Suspense>`.
- `error.tsx` recibe la prop **`retry`** (antes era `reset`).
- Existen los tipos globales generados `PageProps<'/ruta'>`, `LayoutProps` y `RouteContext<'/ruta'>`.

### Prompt 4 · Configuración base y diseño

> «Configura la base: una paleta cálida (crema, carbón y un acento tomate) con modo oscuro, tipografía serif para los títulos, layout con navbar responsive y footer, las variables de entorno y los dominios de imágenes de TheMealDB.»

**Qué hizo la IA:**

- Tokens de color en `@theme` de Tailwind v4 y fuentes Fraunces + Inter con `next/font`
- Navbar (Client Component) con menú hamburguesa en móvil
- `.env.example` documentado y la excepción `!.env.example` en `.gitignore`
- `remotePatterns` en `next.config.ts` para `next/image`

**Commit:** `chore: configurar tema, fuentes, layout y variables de entorno`

### Prompt 5 · Servicio de datos y Route Handlers

> «Crea el servicio que consulta TheMealDB solo en el servidor y los Route Handlers: búsqueda por nombre, receta por id, receta aleatoria y categorías. Valida los parámetros, devuelve errores JSON consistentes y cachea lo que tenga sentido.»

**Qué hizo la IA:**

- `src/lib/mealdb.ts` con `import "server-only"`. Usa `'use cache'` + `cacheLife` para categorías (días) y recetas (horas). La aleatoria no se cachea (`connection()`).
- Los 4 endpoints, con 400 si la búsqueda tiene menos de 2 caracteres y 404 si la receta no existe
- `src/lib/api-response.ts` para dar formato uniforme a los errores

**Validación:** `tsc --noEmit`. Al hacerlo aparecieron dos ajustes menores (`Response.json<T>()` y `next typegen`), descritos en el Desafío 4.

**Commit:** `feat(api): Route Handlers para recetas, búsqueda, aleatoria y categorías`

### Prompt 6 · Páginas y componentes

> «Construye las seis páginas. Inicio con un hero, una receta sorpresa y categorías destacadas; listado de categorías; recetas por categoría; detalle de receta con ingredientes, pasos numerados y video; buscador con debounce que guarde la búsqueda en la URL; y favoritos guardados en `localStorage`. Reutiliza una tarjeta de receta con botón de favorito.»

**Qué hizo la IA:**

- Server Components: inicio, `/categorias`, `/categorias/[nombre]` (con `generateStaticParams` y `notFound()`) y `/recetas/[id]` (con `generateMetadata`)
- Client Components con `useState` + `useEffect`: `RandomRecipe` (→ `/api/random`), `SearchClient` (debounce de 400 ms, `?q=` en la URL, `AbortController`) y `FavoritesClient` (→ `/api/recipes/[id]`)
- `RecipeCard` (Server) incrusta `FavoriteButton` (Client), y el hook `useFavorites` mantiene sincronizados la navbar, los botones y la página de favoritos
- Traducción al español de los nombres de categoría

### Prompt 7 · Estados de carga y de error

> «Agrega estados de carga y de error en toda la app: skeletons que imiten cada página, una pantalla de error con botón para reintentar, una página 404 personalizada y estados de error dentro de los componentes de cliente.»

**Qué hizo la IA:** creó `loading.tsx` (global, de categoría y de receta), `error.tsx` (global y del detalle), `global-error.tsx`, `not-found.tsx` y un componente `ErrorState` reutilizable. Los Client Components muestran sus propios skeletons y un botón *Reintentar*.

### Prompt 8 · Revisar con lint y corregir

> «Ejecuta TypeScript y ESLint y corrige todo lo que marquen, sin desactivar reglas.»

**Resultado:** ESLint marcó 5 errores de `react-hooks/set-state-in-effect`. La IA los corrigió calculando el estado a partir de otros datos en lugar de guardarlo, y usando `useSyncExternalStore` para `localStorage` (ver Desafío 1).

### Prompt 9 · Build de producción

> «Genera el build de producción y corrige cualquier error.»

**Resultado:** el build falló porque `usePathname()` en la navbar bloqueaba el prerender. La IA envolvió esa parte en `<Suspense>` (ver Desafío 2). Después del arreglo, las rutas dinámicas quedaron como Partial Prerender.

**Commit:** `feat: páginas de inicio, categorías, receta, búsqueda y favoritos`

### Prompt 10 · Pruebas en el navegador

> «Levanta el servidor de desarrollo y prueba la app como lo haría un usuario: navegación, búsqueda, detalle, favoritos, página 404, vista móvil y los códigos de respuesta de cada endpoint.»

**Qué hizo la IA:** en el navegador integrado probó inicio, búsqueda (`?q=lasagne`), detalle, categorías y 404. Agregó un favorito y comprobó que el contador de la navbar se actualiza. Revisó la vista móvil (375 px) y el menú hamburguesa. Con `curl` verificó que los endpoints respondan 200, 400 y 404. No hubo errores en la consola.

### Prompt 11 · Simular que la API falla

> «Comprueba qué pasa si TheMealDB no responde. Quiero ver que se muestren las pantallas de error y que la API devuelva un código correcto.»

**Qué hizo la IA:** levantó el build de producción con `MEALDB_API_URL` apuntando a un puerto cerrado. `error.tsx` y los estados de error del cliente funcionaron, pero la API devolvía 500 en lugar de 502. La IA lo corrigió (ver Desafío 3) y repitió la prueba: los tres endpoints devolvieron 502.

**Commit:** `fix(api): responder 502 cuando TheMealDB falla`

### Prompt 12 · Documentación

> «Escribe el README con la descripción, las rutas, los endpoints, la instalación, las variables de entorno y el despliegue. Documenta también el proceso de Vibe Coding en `VIBE_CODING.md`.»

**Commit:** `docs: README con instalación y uso, VIBE_CODING con el proceso`

### Prompt 13 · Publicar en GitHub y desplegar en Vercel

> «Crea el repositorio público en GitHub, sube el código y despliega en producción en Vercel. Después agrega la URL al README.»

**Qué hizo la IA:** creó `Renderos/recetario-vibe` con `gh` y subió el código. Para Vercel, la CLI no tenía sesión y el conector respondió 403. Inicié sesión con `vercel login` y la IA ejecutó `vercel link`, que conectó el repo para despliegues automáticos. Luego cargó las variables de entorno, ejecutó `vercel deploy --prod` y verificó en producción todas las rutas y endpoints.

**Commit:** `docs: enlace al despliegue en Vercel`

### Prompt 14 · Switch de modo claro / oscuro

> «Añádele un switch para modo oscuro y claro.»

**Qué hizo la IA:**

- El CSS pasó de depender solo de `prefers-color-scheme` a leer el atributo `data-theme` en `<html>`. Si el usuario no ha elegido, se respeta el tema del sistema.
- `ThemeToggle` es un Client Component con `role="switch"` y `aria-checked`. Lee el tema con `useSyncExternalStore`, así que reacciona a cambios del sistema operativo y de otras pestañas. La elección se guarda en `localStorage`.
- **Desafío: el parpadeo.** Si el tema se aplicara al hidratar React, la página se vería un instante con el tema equivocado. Se resolvió con un script inline en `<head>` que aplica el tema guardado antes de pintar, más `suppressHydrationWarning` en `<html>`.
- **Desafío: exportar un string desde un archivo `"use client"`.** Un Server Component que importa una constante de un módulo cliente recibe una referencia, no el valor. Por eso el script y la clave se movieron a `src/lib/theme.ts`, que es un módulo compartido.

**Validación:** probado en escritorio y móvil, incluyendo que la elección se mantiene al recargar. Vercel lo desplegó automáticamente al hacer push.

**Commit:** `feat: switch de modo claro/oscuro`

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

- `Response.json<T>()` no acepta genéricos en la versión de tipos instalada → se cambió a `{…} satisfies ApiError`.
- `RouteContext` y `PageProps` no existían para las rutas nuevas → hubo que ejecutar `next typegen` (el `next dev`/`build` también los regenera).
- El patrón `.env*` del `.gitignore` también ignoraba `.env.example` → se añadió la excepción `!.env.example`.
- Next 16 no permite dos `next dev` en la misma carpeta → para la prueba de caída se usó `next start` sobre el build.
- Despliegue: la CLI de Vercel no tenía sesión y el conector respondió 403 → se resolvió con `vercel login` + `vercel link` (Prompt 13).

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
