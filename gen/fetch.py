#!/usr/bin/env python3
"""
SakuraAir — capa de datos.
Consulta AniList (GraphQL) y guarda TODOS los animes en emisión con próximo episodio
en data/anime.json. Sin dependencias externas (solo stdlib).

Uso:  python3 gen/fetch.py
"""
import json, os, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)

API = "https://graphql.anilist.co"

QUERY = """
query ($page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage currentPage lastPage }
    media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
      id
      idMal
      title { romaji english native }
      format
      episodes
      duration
      season
      seasonYear
      startDate { year month day }
      genres
      isAdult
      averageScore
      meanScore
      popularity
      favourites
      description(asHtml: false)
      countryOfOrigin
      source
      siteUrl
      coverImage { extraLarge large medium color }
      bannerImage
      studios(isMain: true) { nodes { name } }
      nextAiringEpisode { airingAt episode timeUntilAiring }
      externalLinks { site url type language }
      trailer { id site }
      synonyms
    }
  }
}
"""

def gql(variables, retries=4):
    body = json.dumps({"query": QUERY, "variables": variables}).encode()
    req = urllib.request.Request(API, data=body, headers={
        "Content-Type": "application/json", "Accept": "application/json",
        "User-Agent": "SakuraAir-SSG/2.0 (+https://sakuraair.pages.dev)"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("Retry-After", "5")) + 1
                print(f"  [429] rate limit, esperando {wait}s", file=sys.stderr)
                time.sleep(wait); continue
            raise
        except Exception as e:
            print(f"  [!] {e} (intento {attempt+1})", file=sys.stderr)
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("AniList no respondió")

def main():
    out, page = [], 1
    while True:
        res = gql({"page": page})
        pg = res["data"]["Page"]
        out.extend(pg["media"])
        info = pg["pageInfo"]
        print(f"  página {info['currentPage']}/{info.get('lastPage','?')} → {len(out)} medias")
        if not info["hasNextPage"] or page >= 20:
            break
        page += 1
        time.sleep(0.8)

    airing = [m for m in out if m.get("nextAiringEpisode") and not m.get("isAdult")]
    airing.sort(key=lambda m: m["nextAiringEpisode"]["airingAt"])
    if len(airing) < 40:
        print(f"[!] Solo {len(airing)} animes; parece respuesta incompleta. No sobrescribo data/anime.json.")
        sys.exit(1)

    meta = {"generated_at": int(time.time()), "total_releasing": len(out), "with_countdown": len(airing)}
    with open(os.path.join(DATA_DIR, "anime.json"), "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "anime": airing}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"[+] {len(airing)} animes con countdown (de {len(out)} en emisión) → data/anime.json")

if __name__ == "__main__":
    main()
