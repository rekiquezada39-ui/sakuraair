# SakuraAir — generador estático bilingüe (EN + ES)

Sin dependencias: solo Python 3.9+ (stdlib) y wrangler (npx) para deployar.

## Actualizar el sitio (lo que hay que correr cada día)
    python3 gen/fetch.py      # baja los animes en emisión de AniList -> data/anime.json
    python3 gen/build.py      # genera el sitio completo -> public/  (EN en / y ES en /es/)
    npx wrangler pages deploy public --project-name sakuraair --branch main --commit-dirty=true

wrangler necesita las variables CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID en el entorno.

## Estructura
    gen/fetch.py     consulta AniList (GraphQL)
    gen/build.py     plantillas + generación de páginas, sitemap, search.json, _headers
    gen/i18n.py      textos EN/ES, rutas, slugs de géneros y días
    gen/js.py        JavaScript del sitio (countdown, Mi Anime, notificaciones, anuncios, buscador)
    assets/          css, service worker, manifest, iconos, imágenes
    templates/legacy páginas heredadas del sitio original (catálogo, anime-info, mi anime, legales)
    data/anime.json  datos descargados (se regenera con fetch.py)
    public/          salida (NO editar a mano; se borra y regenera en cada build)

Nota: no renombrar `gen/` a build/dist/out — algunos entornos borran carpetas con esos nombres.

## Versus (juego "¿Cuál anime prefieres?") — añadido 2026-10-14
    /versus y /es/versus   generados por page_versus() en gen/build.py; JS en gen/js.py (VERSUS); CSS en EXTRA_CSS.
    Votos: Abacus (abacus.jasoncameron.dev) clave sakuraair/vs-<idMenor>-<idMayor>-<idGanador>; 1 voto por par y dispositivo.
    gen/fetch.py           ahora pide coverImage.extraLarge (portadas grandes del juego). Nada nuevo que correr: fetch + build + deploy igual que siempre.
