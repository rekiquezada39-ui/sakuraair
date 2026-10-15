#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SakuraAir — generador estático bilingüe (EN en / , ES en /es/).
Lee data/anime.json (de gen/fetch.py) y escribe el sitio completo en public/.
Uso:  python3 gen/build.py
"""
import json, os, re, shutil, sys, time, html as _html
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n import SITE, TZ, TZ_EXTRA_ES, DAYS, DAY_SLUG, MONTHS, GENRES, ROUTES, T, LEGACY_ES
import js as JS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public")
ASSETS = os.path.join(ROOT, "assets")
LEGACY = os.path.join(ROOT, "templates", "legacy")
NOW = int(time.time())
V = ""  # cache-buster tipo "mv6yhxul"
_n = NOW
while _n: V = "0123456789abcdefghijklmnopqrstuvwxyz"[_n % 36] + V; _n //= 36

STREAM_OK = {"Crunchyroll", "Netflix", "Hulu", "Amazon Prime Video", "Disney Plus", "HIDIVE", "Max",
             "Anime Onegai", "YouTube", "Bilibili TV", "iQIYI"}
MIN_GENRE = 3  # páginas de género solo si hay al menos N animes

# ───────────────────────── utilidades ─────────────────────────
def esc(s): return _html.escape(str(s or ""), quote=True)
def other(lang): return "es" if lang == "en" else "en"
def dt(ts, lang): return datetime.fromtimestamp(ts, ZoneInfo(TZ[lang]))
def wd(ts, lang): return (dt(ts, lang).weekday() + 1) % 7  # 0=domingo … 6=sábado

def fmt_date(ts, lang):
    d = dt(ts, lang)
    if lang == "en": return f"{DAYS['en'][wd(ts,'en')]}, {MONTHS['en'][d.month-1]} {d.day}, {d.year}"
    return f"{DAYS['es'][wd(ts,'es')]} {d.day} de {MONTHS['es'][d.month-1]} de {d.year}"

def fmt_time(ts, lang):
    d = dt(ts, lang)
    return f"{d:%H:%M} UTC" if lang == "en" else f"{d:%H:%M} (hora del centro de México)"

def rel(ts):
    s = ts - NOW
    if s < 0: return "—"
    d, h, m, sec = s // 86400, s % 86400 // 3600, s % 3600 // 60, s % 60
    return f"{d}d {h}h" if d > 0 else (f"{h}h {m}m" if h > 0 else f"{m}m {sec}s")

def soon(ts): return " soon" if 0 <= ts - NOW < 86400 else ""

def clean_desc(s, n=300):
    s = re.sub(r"<br\s*/?>", " ", s or ""); s = re.sub(r"<[^>]+>", "", s)
    s = _html.unescape(s); s = re.sub(r"\(Source:[^)]*\)", "", s); s = re.sub(r"\s+", " ", s).strip()
    if len(s) > n:
        cut = s[:n].rsplit(". ", 1)
        s = (cut[0] + ".") if len(cut) == 2 and len(cut[0]) > 80 else s[:n].rsplit(" ", 1)[0] + "…"
    return s

def num(n, lang): return f"{n:,}"

# ───────────────────────── datos ─────────────────────────
raw = json.load(open(os.path.join(ROOT, "data", "anime.json"), encoding="utf-8"))
A = []
for m in raw["anime"]:
    t = m["title"] or {}
    title = t.get("english") or t.get("romaji") or "Anime"
    slug = re.sub(r"[^a-z0-9]+", "-", (t.get("romaji") or title).lower()).strip("-") or "anime"
    nx = m["nextAiringEpisode"]
    studios = [s["name"] for s in (m.get("studios") or {}).get("nodes") or []]
    A.append({
        "id": m["id"], "title": title, "romaji": t.get("romaji") or "", "native": t.get("native") or "",
        "slug": f"{slug}-{m['id']}", "cover": (m.get("coverImage") or {}).get("large") or (m.get("coverImage") or {}).get("medium") or "",
        "cover_xl": (m.get("coverImage") or {}).get("extraLarge") or ((m.get("coverImage") or {}).get("large") or "").replace("/cover/medium/", "/cover/large/"),
        "score": (m.get("averageScore") or 0) / 10, "fmt": m.get("format") or "TV", "eps": m.get("episodes"),
        "dur": m.get("duration"), "studio": studios[0] if studios else "", "genres": [g for g in (m.get("genres") or []) if g != "Hentai"],
        "ep": nx["episode"], "at": nx["airingAt"], "pop": m.get("popularity") or 0, "fav": m.get("favourites") or 0,
        "desc": clean_desc(m.get("description")), "links": m.get("externalLinks") or [], "synonyms": m.get("synonyms") or [],
    })
A.sort(key=lambda a: a["at"])
N = len(A)
print(f"[build] {N} animes · versión {V}")

_gc_cache = {}
def genre_counts(lang):
    if lang not in _gc_cache:
        c = {}
        for a in A:
            for g in a["genres"]:
                if g in GENRES[lang]: c[g] = c.get(g, 0) + 1
        _gc_cache[lang] = sorted([(g, n) for g, n in c.items() if n >= MIN_GENRE], key=lambda x: (-x[1], x[0]))
    return _gc_cache[lang]

def active_genres(lang): return {g for g, _ in genre_counts(lang)}

def day_counts(lang):
    c = [0] * 7
    for a in A: c[wd(a["at"], lang)] += 1
    return c

# ───────────────────────── fragmentos ─────────────────────────
LOGO = '<svg viewBox="0 0 34 34" width="30" height="30" fill="none" aria-hidden="true"><g><circle cx="17" cy="8.4" r="4.6" fill="#f3a8c4"/><circle cx="25.2" cy="14.3" r="4.6" fill="#f0b8cd"/><circle cx="22" cy="24" r="4.6" fill="#f3a8c4"/><circle cx="12" cy="24" r="4.6" fill="#f0b8cd"/><circle cx="8.8" cy="14.3" r="4.6" fill="#f3a8c4"/><circle cx="17" cy="17" r="3.5" fill="#c9a227"/></g></svg>'
PETALS = ('<div class="petals" aria-hidden="true">' + "".join(
    f'<i class="petal {k}" style="left:{l}vw;animation-name:cae{a};animation-duration:{d}s;animation-delay:-{dl}s"><b style="animation-duration:{bd}s;animation-delay:-{dl}s"></b></i>'
    for k, l, a, d, dl, bd in [("f",3,1,13,0,2.6),("d",11,2,17,2.1,4.1),("",19,3,10,5.3,1.9),("",27,2,15,1.2,3.3),("f",35,1,12,6.4,2.2),
                              ("d",43,3,18,3.7,4.8),("",51,3,11,0.8,2),("",58,1,14,4.9,3.6),("d",66,2,16,2.6,4.2),("f",73,1,10,7.1,1.7),
                              ("",81,3,15,1.9,3.1),("",88,2,12,5.8,2.4),("d",95,1,17,3.2,4.5),("",7,2,11,8.2,2.1),("f",63,3,13,6.9,2.8)]) + "</div>")

def R(lang, k): return ROUTES[lang][k]
def url_anime(a, lang): return R(lang, "anime") + a["slug"]
def url_genre(g, lang): return R(lang, "genre") + GENRES[lang][g][0]
def url_day(i, lang): return R(lang, "day") + DAY_SLUG[lang][i]
def glabel(g, lang): return GENRES[lang][g][1]

def card(a, lang):
    t = T[lang]
    sc = f'<span class="sc">★ {a["score"]:.1f}</span>' if a["score"] else ""
    return (f'<a class="card" href="{url_anime(a,lang)}?v={V}">\n<div class="im"><img src="{a["cover"]}" alt="{esc(t["cover"].format(t=a["title"]))}" loading="lazy" width="184" height="276">'
            f'<span class="ep">{t["ep"].format(n=a["ep"])}</span>{sc}</div>\n<div class="bd"><div class="nm">{esc(a["title"])}</div>\n'
            f'<span class="tm{soon(a["at"])}" data-at="{a["at"]}">{rel(a["at"])}</span></div></a>')

def row(a, lang, sub=None):
    t = T[lang]
    sub = sub or (t["episode"].format(n=a["ep"]) + (f' · {esc(a["studio"])}' if a["studio"] else ""))
    return (f'<a class="row" href="{url_anime(a,lang)}?v={V}">\n<div class="th"><img src="{a["cover"]}" alt="{esc(t["cover"].format(t=a["title"]))}" loading="lazy" width="184" height="276"></div>\n'
            f'<div class="in"><div class="t">{esc(a["title"])}</div><div class="s">{sub}</div></div>\n<div class="rt" data-at="{a["at"]}">{rel(a["at"])}</div></a>')

def grid(items, lang): return '<div class="grid">' + "".join(card(a, lang) for a in items) + "</div>"
def rows(items, lang): return '<div class="rows">' + "".join(row(a, lang) for a in items) + "</div>"

def chips_days(lang):
    dc = day_counts(lang)
    return "".join(f'<a href="{url_day(i,lang)}">{DAYS[lang][i].capitalize()}<span class="n">{dc[i]}</span></a>' for i in range(7))

def chips_genres(lang, limit=None):
    gc = genre_counts(lang)[:limit] if limit else genre_counts(lang)
    return "".join(f'<a href="{url_genre(g,lang)}">{glabel(g,lang)}<span class="n">{n}</span></a>' for g, n in gc)

def ld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "</script>"

def lang_switch(lang, path, alt_path):
    """Selector EN | ES: los dos visibles, el idioma ACTUAL resaltado, el otro es el enlace."""
    en = f'<a class="on" aria-current="page" href="{path}">EN</a>' if lang == "en" else f'<a href="{alt_path}" hreflang="en" title="View in English">EN</a>'
    es = f'<a class="on" aria-current="page" href="{path}">ES</a>' if lang == "es" else f'<a href="{alt_path}" hreflang="es" title="Ver en español">ES</a>'
    return f'<span class="lang" aria-label="Language">{en}{es}</span>'

# ───────────────────────── cascarón ─────────────────────────
def shell(lang, path, alt_path, title, desc, main_html, before_main="", lds=(), noindex=False):
    t = T[lang]; o = other(lang)
    upd = t["updated"].format(date=fmt_date(NOW, lang))
    en_url, es_url = (SITE + path, SITE + alt_path) if lang == "en" else (SITE + alt_path, SITE + path)
    head = (f'<!DOCTYPE html><html lang="{t["lang_html"]}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{title}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{SITE}{path}">'
            f'<link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="es" href="{es_url}"><link rel="alternate" hreflang="x-default" href="{en_url}">'
            + ('<meta name="robots" content="noindex,follow">' if noindex else "")
            + '<meta name="monetag" content="20276d347c7d19d7d24cea04109c96d1"><meta name="google-site-verification" content="U9iGxs4sIb4prXPIHujTEdxOh7eu-x9UDdaeqOjKHjE">'
            f'<meta property="og:title" content="{title}"><meta property="og:description" content="{esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{SITE}{path}">'
            f'<meta property="og:site_name" content="SakuraAir"><meta property="og:locale" content="{t["og_locale"]}"><meta property="og:image" content="{SITE}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:image" content="{SITE}/og.png"><meta name="theme-color" content="#fffbfd">'
            '<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/icon-192.png">'
            f'<link rel="preconnect" href="https://s4.anilist.co"><link rel="stylesheet" href="/s.css?v={V}"></head><body>\n')
    nav = (f'<a href="{R(lang,"home")}">{t["nav_now"]}</a><a href="{R(lang,"catalog")}">{t["nav_all"]}</a><a href="{R(lang,"my")}">{t["nav_my"]}</a>'
           f'<a href="{R(lang,"schedule")}">{t["nav_sched"]}</a><a href="{R(lang,"vs")}" class="navvs">{t["nav_vs"]}</a><a href="{R(lang,"season")}">{t["nav_season"]}</a><a href="{R(lang,"genres")}">{t["nav_genres"]}</a>')
    header = (f'<header><div class="hin">\n<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>\n'
              f'<a href="{R(lang,"home")}" class="lg">{LOGO}<span><span class="lgt">Sakura<em>Air</em></span><span class="jp">アニメ放送</span></span></a>\n'
              f'<nav class="hnav">{nav}</nav>\n{lang_switch(lang, path, alt_path)}<span class="upd">{upd}</span>\n</div></header>\n')
    drawer = (f'<div class="scrim" id="scrim"></div>\n<aside class="drawer" id="drawer"><div class="dhead">{LOGO}<span class="lgt">Sakura<em>Air</em></span></div><div class="dbody">'
              f'<a href="{R(lang,"home")}">{t["nav_now"]}</a><a href="{R(lang,"catalog")}">{t["nav_all"]}</a><a href="{R(lang,"my")}">{t["nav_my"]}</a><a href="{R(lang,"schedule")}">{t["d_sched"]}</a>'
              f'<a href="{R(lang,"vs")}">⚔️ {t["nav_vs"]} · {t["vs_h1"]}</a><a href="{R(lang,"season")}">{t["nav_season"]}</a><a href="{R(lang,"genres")}">{t["d_genres"]}</a>'
              f'<a href="{alt_path}" hreflang="{o}">{"🇲🇽 Ver en español" if lang == "en" else "🇺🇸 View in English"}</a>'
              f'<div class="dsep"></div><div class="dttl">{t["d_days"]}</div>{chips_days(lang)}<div class="dttl">{t["d_top"]}</div>{chips_genres(lang, 10)}</div></aside>')
    footer = (f'<footer><div class="fin"><p>{t["footer_1"]}</p>\n<p style="margin-top:8px">{t["footer_2"].format(date=fmt_date(NOW, lang))}</p>\n'
              f'<nav class="fnav"><a href="{R(lang,"about")}">{t["f_about"]}</a><a href="{R(lang,"privacy")}">{t["f_privacy"]}</a><a href="{R(lang,"terms")}">{t["f_terms"]}</a><a href="{R(lang,"contact")}">{t["f_contact"]}</a></nav></div></footer>\n'
              f'<div id="ck" role="dialog" aria-label="Cookie notice"><p>{t["cookie"].format(privacy=R(lang,"privacy"))}</p><div class="ckb"><button id="ckNo" type="button">{t["ck_no"]}</button><button id="ckSi" type="button">{t["ck_yes"]}</button></div></div>\n'
              f'<button class="up" id="up" type="button" aria-label="{t["up"]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>\n')
    return head + PETALS + "\n" + header + drawer + before_main + '<div class="shell"><main>' + main_html + "".join(ld(x) for x in lds) + "</main></div>" + footer + JS.shared(lang) + "</body></html>"

def crumb(lang, *parts):
    t = T[lang]; out = f'<a href="{R(lang,"home")}">{t["home"]}</a>'
    for p in parts:
        if p is None: continue
        out += " › " + (f'<a href="{p[1]}">{p[0]}</a>' if isinstance(p, tuple) else esc(p))
    return f'<p class="crumb">{out}</p>'

H1 = '<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">{}</h1>'

# ───────────────────────── páginas ─────────────────────────
def write(path, content):
    fp = os.path.join(OUT, path.lstrip("/")); os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, "w", encoding="utf-8").write(content)

def out_path(route):  # "/es/horario" -> "es/horario.html", "/" -> "index.html"
    return (route.rstrip("/") + "/index.html") if route.endswith("/") else route + ".html"

def page_index(lang):
    t = T[lang]; nxt = A[0]
    today = [a for a in A if dt(a["at"], lang).date() == dt(NOW, lang).date()]
    before = (f'<section class="hero" id="hero">\n<div class="bgimg" style="background-image:url(\'/bg.webp\')"></div>\n<div class="glow" aria-hidden="true"></div>\n'
              f'<img class="chica" src="/girl.webp" alt="" width="432" height="820" fetchpriority="high" decoding="async">\n<div class="shine" aria-hidden="true"><i></i></div>\n<div class="in">\n'
              f'<h1>{t["hero_h1"]}</h1>\n<p>{t["hero_p"].format(n=N)}</p>\n<div class="cta"><a class="btn" href="#now">{t["hero_cta1"]}</a><a class="btn g" href="{R(lang,"schedule")}">{t["hero_cta2"]}</a></div>\n</div></section>\n'
              f'<div class="next"><div class="nextc">\n<div class="po"><img src="{nxt["cover"]}" alt="{esc(t["cover"].format(t=nxt["title"]))}" loading="lazy" width="184" height="276"></div>\n'
              f'<div class="inf"><div class="k">{t["next_k"]}</div>\n<div class="t">{esc(nxt["title"])}</div>\n<div class="d">{t["episode"].format(n=nxt["ep"])} · {fmt_date(nxt["at"], lang)}{(" · " + esc(nxt["studio"])) if nxt["studio"] else ""}</div></div>\n'
              f'<div class="cdown"><div class="num" data-at="{nxt["at"]}">{rel(nxt["at"])}</div><div class="lb">{t["remaining"]}</div></div>\n</div></div>')
    today_html = rows(today, lang) if today else f'<p class="sub" style="margin-bottom:14px">{t["today_none"]}</p>' + rows(A[:3], lang)
    faq = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in t["faq"])
    main = (f'{vs_teaser(lang)}\n<h2 id="now">{t["today"]}<span class="ver">{t["today_n"].format(n=len(today))}</span></h2>\n{today_html}\n\n'
            f'<div class="finder rv" style="margin-top:34px"><h3 style="margin-bottom:11px">{t["finder_h"]}</h3>\n<input id="q" placeholder="{esc(t["finder_ph"])}" autocomplete="off" enterkeyhint="search">\n<div id="res"></div></div>\n'
            f'<div class="personal" id="personalHome"><div class="phead"><h3>{t["personal_h"]}</h3><a href="{R(lang,"my")}">{t["personal_a"]}</a></div><div id="personalRows"></div></div>\n{JS.personal(lang)}\n\n'
            f'<h2 class="rv">{t["dropping"]}<a class="ver" href="{R(lang,"schedule")}">{t["full_sched"]}</a></h2>\n{grid(A[:12], lang)}\n\n'
            f'<h2 class="rv">{t["week"]}</h2>\n{rows([a for a in A if a["at"] - NOW < 7*86400][:15], lang)}\n\n'
            f'<h2 class="rv">{t["top"]}</h2>{grid(sorted([a for a in A if a["score"]], key=lambda a: -a["score"])[:12], lang)}\n\n'
            f'<h2 class="rv">{t["byday"]}</h2>\n<div class="chips">{chips_days(lang)}</div>\n\n'
            f'<h2 class="rv">{t["browse"]}<a class="ver" href="{R(lang,"genres")}">{t["all_n"].format(n=len(genre_counts(lang)))}</a></h2>\n<div class="chips">{chips_genres(lang, 12)}</div>\n\n'
            f'<h2 class="rv">{t["faq_h"]}</h2>\n<div class="faq">\n{faq}\n</div>\n')
    lds = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in t["faq"]]},
           {"@context": "https://schema.org", "@type": "WebSite", "name": "SakuraAir", "alternateName": ["Sakura Air", "sakuraair", "Anime Countdown"], "url": SITE + R(lang, "home"),
            "inLanguage": t["intl"], "description": t["idx_desc"].format(n=N),
            "potentialAction": {"@type": "SearchAction", "target": f"{SITE}{R(lang,'catalog')}?q={{search_term_string}}", "query-input": "required name=search_term_string"}}]
    write(out_path(R(lang, "home")), shell(lang, R(lang, "home"), R(other(lang), "home"), t["idx_title"], t["idx_desc"].format(n=N), main + JS.search(lang), before_main=before, lds=lds))

def poll_box(a, lang, date):
    """Encuesta del último capítulo emitido (o del hype si aún no se estrena). Se renueva sola con cada capítulo."""
    t = T[lang]; prev = a["ep"] - 1
    q = t["p_h"].format(n=prev) if prev >= 1 else t["p_h0"]; labels = t["p_o"] if prev >= 1 else t["p_o0"]
    opts = "".join(f'<button class="opt" type="button" data-v="{v}">{l}</button>' for v, l in zip(("fire", "ok", "bored"), labels))
    return (f'<div class="box poll" id="poll" data-id="{a["id"]}" data-next="{a["ep"]}" data-at="{a["at"]}" data-q="{esc(t["p_h"])}" data-labels="{esc("|".join(t["p_o"]))}" '
            f'data-back="{esc(t["p_back"].format(n=a["ep"], date=date))}">\n<h3>{q}</h3>\n<p class="ph">{t["p_hint"]}</p>\n<div class="opts">{opts}</div>\n'
            f'<p class="pm" aria-live="polite"></p>\n<div class="res" hidden></div>\n<p class="tot" hidden></p>\n</div>\n{JS.poll(lang)}\n')

def watch_links(a, lang):
    t = T[lang]; seen, out = set(), []
    for l in a["links"]:
        site, typ = l.get("site") or "", l.get("type") or ""
        ok = (typ == "INFO" and site == "Official Site") or (typ == "STREAMING" and site in STREAM_OK)
        if not ok or site in seen: continue
        seen.add(site); label = t["official"] if site == "Official Site" else site
        out.append(f'<a class="btn g" style="margin-right:8px;margin-bottom:6px" href="{esc(l["url"])}" target="_blank" rel="noopener nofollow">{t["watch"].format(site=label)}</a>')
        if len(out) >= 4: break
    return ('<p style="margin-top:14px">' + "".join(out) + "</p>") if out else ""

def tz_line_es(ts):
    base = dt(ts, "es").date(); parts = []
    for label, zone in TZ_EXTRA_ES:
        d = datetime.fromtimestamp(ts, ZoneInfo(zone)); extra = ""
        if d.date() != base: extra = f' ({DAYS["es"][(d.weekday()+1)%7][:3]})'
        parts.append(f"<strong>{d:%H:%M}</strong> {label}{extra}")
    return '<p style="margin-top:10px;font-size:.84rem;color:var(--tx2)">Horario en Latinoamérica: ' + " · ".join(parts) + "</p>"

def page_anime(a, lang):
    t = T[lang]; act = active_genres(lang); g0 = next((g for g in a["genres"] if g in act), None)
    path, alt = url_anime(a, lang), url_anime(a, other(lang))
    date, tm, day = fmt_date(a["at"], lang), fmt_time(a["at"], lang), DAYS[lang][wd(a["at"], lang)]
    studio = a["studio"] or ("an unlisted studio" if lang == "en" else "un estudio no listado")
    title = t["a_title"].format(t=esc(a["title"]), n=a["ep"]); desc = t["a_desc"].format(t=a["title"], n=a["ep"], date=date, studio=studio)
    meta = (f'<span class="gd">★ {a["score"]:.1f}</span>\n' if a["score"] else "") + f'   <span class="on">{t["a_airing"]}</span>\n   <span>{a["fmt"].replace("_"," ")}</span>\n'
    if a["eps"]: meta += f'   <span>{t["a_eps"].format(n=a["eps"])}</span>\n'
    if a["dur"]: meta += f'   <span>{t["a_min"].format(n=a["dur"])}</span>\n'
    if a["studio"]: meta += f'   <span>{esc(a["studio"])}</span>\n'
    meta += "   " + "".join(f"<span>{glabel(g,lang)}</span>" for g in a["genres"] if g in GENRES[lang])
    mount = json.dumps({"id": a["id"], "title": a["title"], "img": a["cover"], "episode": a["ep"], "airingAt": a["at"]}, ensure_ascii=False)
    p1 = t["a_p1"].format(t=esc(a["title"]), n=a["ep"], date=date, studio=esc(studio), eps=(t["a_p1_eps"].format(n=a["eps"]) if a["eps"] else ""))
    p2 = t["a_p2"].format(day=day, dur=(t["a_p2_dur"].format(n=a["dur"]) if a["dur"] else ""), score=(t["a_p2_score"].format(s=f"{a['score']:.1f}", pop=num(a["pop"], lang)) if a["score"] else ""))
    related = [b for b in A if b["id"] != a["id"] and g0 and g0 in b["genres"]][:6]
    if len(related) < 6: related += [b for b in A if b["id"] != a["id"] and b not in related][:6 - len(related)]
    main = crumb(lang, (glabel(g0, lang), url_genre(g0, lang)) if g0 else None, a["title"]) + "\n"
    main += (f'<div class="showhd">\n <div class="po"><img src="{a["cover"]}" alt="{esc(t["cover"].format(t=a["title"]))}" loading="lazy" width="184" height="276"></div>\n <div class="inf">\n  <h1>{esc(a["title"])}</h1>\n'
             f'  <div class="jptitle">{esc(a["native"] or a["romaji"])}</div>\n  <div class="meta">\n   {meta}\n  </div>\n'
             f'  <div class="mybar"><button class="btn g savebtn" id="save-{a["id"]}" type="button">{t["a_save"]}</button></div>\n </div>\n</div>\n'
             f'<script>document.addEventListener(\'DOMContentLoaded\',function(){{var m={mount};m.url=location.pathname;SakuraList.mount(document.getElementById(\'save-{a["id"]}\'),m)}});</script>\n\n'
             f'<div class="box big">\n<h3>{t["a_cd_h"].format(n=a["ep"])}</h3>\n<div class="bigcd">\n <div><div class="v">–</div><div class="l">{t["cd_d"]}</div></div>\n <div><div class="v">–</div><div class="l">{t["cd_h"]}</div></div>\n'
             f' <div><div class="v">–</div><div class="l">{t["cd_m"]}</div></div>\n <div><div class="v">–</div><div class="l">{t["cd_s"]}</div></div>\n</div>\n<span data-at="{a["at"]}" data-f="full" style="display:none"></span>\n'
             f'<p style="margin-top:14px;font-size:.88rem;color:var(--tx2)">{t["a_when"].format(date=date, time=tm)}<span data-local="{a["at"]}"></span></p>\n{tz_line_es(a["at"]) if lang == "es" else ""}</div>\n\n'
             f'<div class="notifybox" id="alert-{a["id"]}"><div><div class="nt">{t["n_t"].format(n=a["ep"])}</div><div class="ns">{t["n_s"]}</div><div class="installhelp">{t["n_ios"]}</div></div><button class="btn" type="button">{t["n_btn"]}</button></div>'
             f'<script>document.addEventListener(\'DOMContentLoaded\',function(){{SakuraAlerts.mount(document.getElementById(\'alert-{a["id"]}\'),{{animeId:{a["id"]},title:{json.dumps(a["title"], ensure_ascii=False)},episode:{a["ep"]},airingAt:{a["at"]}}})}});</script>\n'
             + poll_box(a, lang, date) +
             f'<div class="box rv"><h3>{t["a_q"].format(t=esc(a["title"]), n=a["ep"])}</h3>\n<p>{p1}</p>\n<p>{p2}</p>\n'
             + (f'<p style="color:var(--tx2);font-size:.9rem">{esc(a["desc"])}</p>\n' if a["desc"] else "") + watch_links(a, lang) + "\n</div>\n\n"
             + (f'<h2 class="rv">{t["more"].format(g=glabel(g0, lang))}</h2>' if g0 else "") + grid(related, lang) + "\n")
    tv = {"@context": "https://schema.org", "@type": "TVSeries", "name": a["title"], "alternateName": [x for x in [a["romaji"], a["native"]] if x and x != a["title"]], "url": SITE + path, "image": a["cover"],
          "description": a["desc"] or t["a_q"].format(t=a["title"], n=a["ep"]), "genre": [glabel(g, lang) for g in a["genres"] if g in GENRES[lang]], "numberOfEpisodes": a["eps"],
          "productionCompany": {"@type": "Organization", "name": a["studio"]} if a["studio"] else None,
          "aggregateRating": {"@type": "AggregateRating", "ratingValue": f"{a['score']:.1f}", "bestRating": 10, "ratingCount": a["fav"] or a["pop"] or 1} if a["score"] else None}
    tv = {k: v for k, v in tv.items() if v not in (None, [], "")}
    bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "SakuraAir", "item": SITE + R(lang, "home")}]
          + ([{"@type": "ListItem", "position": 2, "name": glabel(g0, lang), "item": SITE + url_genre(g0, lang)}] if g0 else [])
          + [{"@type": "ListItem", "position": 3 if g0 else 2, "name": a["title"], "item": SITE + path}]}
    write(out_path(path), shell(lang, path, alt, title, desc, main, lds=[tv, bc]))

# ───────────────────────── Versus (juego) ─────────────────────────
def vs_meta(a, lang):
    t = T[lang]; d = DAYS[lang][wd(a["at"], lang)]; d = d.capitalize() if lang == "en" else d
    return (f"★ {a['score']:.1f} · " if a["score"] else "") + t["vs_ep"].format(n=a["ep"], day=d)

def vs_teaser(lang):
    t = T[lang]; top = sorted(A, key=lambda a: -a["pop"])[:2]
    ims = "".join(f'<img src="{a["cover"]}" alt="" loading="lazy" width="184" height="276">' for a in top)
    return (f'<a class="vsp" href="{R(lang,"vs")}"><div class="vsp-im">{ims}<span>VS</span></div><div class="vsp-tx"><div class="k">{t["vs_new"]}</div>'
            f'<div class="h">{t["vs_home_h"]}</div><p>{t["vs_home_p"]}</p><span class="btn vsbtn">{t["vs_home_cta"]}</span></div></a>')

def page_versus(lang):
    t = T[lang]; o = other(lang); path, alt = R(lang, "vs"), R(o, "vs")
    data = [[a["id"], a["title"], a["cover_xl"] or a["cover"], url_anime(a, lang), vs_meta(a, lang), a["pop"], a["cover"]] for a in A if a["cover"]]
    main = (crumb(lang, t["vs_crumb"]) + "\n" + H1.format(t["vs_h1"]) + f'\n<p class="sub">{t["vs_sub"]}</p>\n'
            f'<div class="vs"><div class="vshd"><span id="vsRound">{t["vs_round"].format(n=1)}</span><button class="skip" id="vsSkip" type="button">{t["vs_skip"]} →</button></div>\n'
            f'<div class="arena" id="arena" aria-live="polite"></div>\n<p class="vsmsg" id="vsMsg"></p></div>\n'
            f'<div class="box rv" style="margin-top:30px"><h3>{t["vs_after_h"]}</h3><p>{t["vs_after_p"].format(sched=R(lang,"schedule"), my=R(lang,"my"))}</p></div>\n'
            f'<script>window.__VS={json.dumps(data, ensure_ascii=False, separators=(",", ":"))}</script>\n' + JS.versus(lang))
    lds = [{"@context": "https://schema.org", "@type": "WebApplication", "name": t["vs_h1"], "url": SITE + path, "applicationCategory": "GameApplication", "operatingSystem": "Any",
            "inLanguage": t["intl"], "description": t["vs_desc"].format(n=N), "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}, "isPartOf": {"@type": "WebSite", "name": "SakuraAir", "url": SITE + R(lang, "home")}}]
    write(out_path(path), shell(lang, path, alt, t["vs_title"], t["vs_desc"].format(n=N), main, lds=lds))

def page_schedule(lang):
    t = T[lang]; o = other(lang)
    main = crumb(lang, t["s_crumb"]) + "\n" + H1.format(t["s_h1"]) + f'\n<p class="sub">{t["s_sub"].format(n=N)}</p>\n'
    for i in range(7):
        items = [a for a in A if wd(a["at"], lang) == i]
        if items: main += f'<h2 class="rv">{DAYS[lang][i].capitalize()}<span class="ver">{len(items)}</span></h2>{rows(items, lang)}'
    write(out_path(R(lang, "schedule")), shell(lang, R(lang, "schedule"), R(o, "schedule"), t["s_title"], t["s_desc"].format(n=N), main))
    for i in range(7):
        items = [a for a in A if wd(a["at"], lang) == i]; day = DAYS[lang][i]; dname = day.capitalize() if lang == "en" else day
        main = crumb(lang, (t["s_crumb"], R(lang, "schedule")), day.capitalize()) + "\n" + H1.format(t["d_h1"].format(day=dname)) + f'\n<p class="sub">{t["d_sub"].format(n=len(items), day=dname)}</p>\n{grid(items, lang)}'
        write(out_path(url_day(i, lang)), shell(lang, url_day(i, lang), url_day(i, o), t["d_title"].format(day=dname), t["d_desc"].format(n=len(items), day=dname), main))

def page_genres(lang):
    t = T[lang]; o = other(lang); gc = genre_counts(lang)
    main = crumb(lang, t["g_crumb"]) + "\n" + H1.format(t["gs_h1"]) + f'\n<p class="sub">{t["gs_sub"].format(n=len(gc))}</p>\n<div class="chips">{chips_genres(lang)}</div>'
    write(out_path(R(lang, "genres")), shell(lang, R(lang, "genres"), R(o, "genres"), t["gs_title"].format(n=len(gc)), t["gs_desc"], main))
    for g, n in gc:
        items = [a for a in A if g in a["genres"]]; G = glabel(g, lang); gl = G.lower()
        main = crumb(lang, (t["g_crumb"], R(lang, "genres")), G) + "\n" + H1.format(t["g_h1"].format(g=G)) + f'\n<p class="sub">{t["g_sub"].format(n=n, gl=gl, t=esc(items[0]["title"]))}</p>\n{grid(items, lang)}'
        write(out_path(url_genre(g, lang)), shell(lang, url_genre(g, lang), url_genre(g, o), t["g_title"].format(g=G), t["g_desc"].format(n=n, gl=gl), main))

def page_season(lang):
    t = T[lang]; o = other(lang)
    main = crumb(lang, t["se_crumb"]) + "\n" + H1.format(t["se_h1"]) + f'\n<p class="sub">{t["se_sub"].format(n=N)}</p>\n{grid(A, lang)}'
    write(out_path(R(lang, "season")), shell(lang, R(lang, "season"), R(o, "season"), t["se_title"], t["se_desc"].format(n=N), main))

# ── páginas heredadas (catálogo, detalles, mi anime, legales) ──
LINK_KEYS = {"./": "home", "catalog": "catalog", "schedule": "schedule", "season": "season", "genres": "genres", "my-anime": "my",
             "about": "about", "contact": "contact", "privacy": "privacy", "terms": "terms", "anime-info": "info"}
def legacy_main(name, lang):
    h = open(os.path.join(LEGACY, name + ".html"), encoding="utf-8").read()
    m = h[h.find("<main"): h.find("</main>") + 7]
    def fix(mm):
        k = mm.group(1)
        if k in LINK_KEYS: return f'href="{R(lang, LINK_KEYS[k])}'
        if k == "anime/": return f'href="{R(lang, "anime")}'
        return mm.group(0)
    m = re.sub(r'href="(\./|anime/|[a-z-]+)(?=["?#])', fix, m)
    if lang == "es":
        m = m.replace(f'<a href="{R("es","home")}">Home</a>', f'<a href="{R("es","home")}">Inicio</a>')
        for a, b in LEGACY_ES: m = m.replace(a, b)
    return m

def page_legacy(name, lang, title_key, desc_key=None, noindex=False):
    t = T[lang]; o = other(lang)
    key = {"catalog": "catalog", "anime-info": "info", "my-anime": "my", "about": "about", "contact": "contact", "privacy": "privacy", "terms": "terms"}[name]
    desc = t[desc_key] if desc_key else re.search(r'name="description" content="([^"]*)"', open(os.path.join(LEGACY, name + ".html"), encoding="utf-8").read()).group(1)
    write(out_path(R(lang, key)), shell(lang, R(lang, key), R(o, key), t[title_key], _html.unescape(desc), legacy_main(name, lang), noindex=noindex))

ES_ABOUT = ('<div class="legal"><h1 style="font-size:1.9rem;font-weight:800;letter-spacing:-.035em">Acerca de SakuraAir</h1>'
            '<p>SakuraAir responde una sola pregunta: <strong>¿cuándo sale el próximo capítulo?</strong></p>'
            '<p>Seguimos {n} animes en emisión y mostramos una cuenta regresiva en vivo a cada próximo capítulo, exacta al segundo, con la hora de México, Colombia, Perú, Argentina, Chile y España. Sin cuenta y sin pagar.</p>'
            '<h2>De dónde salen los datos</h2><p>Toda la información de horarios viene de la API pública de <a href="https://anilist.co" rel="noopener nofollow" target="_blank">AniList</a>, una base de datos de anime mantenida por la comunidad. Descargamos una copia nueva cada día y regeneramos todo el sitio automáticamente.</p>'
            '<h2>Exactitud</h2><p>Las cuentas regresivas usan la hora oficial de emisión en Japón. Crunchyroll y Netflix suelen estrenar dentro de la hora siguiente, pero el simulcast puede variar según la región y la plataforma.</p>'
            '<h2>Contacto</h2><p>¿Encontraste un error o quieres sugerir algo? Escríbenos desde la página de <a href="/es/contacto">contacto</a>.</p></div>')
ES_CONTACT = ('<div class="legal"><h1 style="font-size:1.9rem;font-weight:800;letter-spacing:-.035em">Contacto</h1>'
              '<p>¿Un horario está mal, falta un anime o tienes una idea? Escríbenos a <a href="mailto:hola@sakuraair.pages.dev">hola@sakuraair.pages.dev</a> y responderemos lo antes posible.</p>'
              '<p style="color:var(--tx2);font-size:.9rem">Los horarios se actualizan automáticamente cada día desde AniList; si un cambio es muy reciente, puede tardar hasta 24 horas en reflejarse.</p></div>')

def page_static_es():
    for key, body, tk in (("about", ES_ABOUT.format(n=N), "ab_title"), ("contact", ES_CONTACT, "co_title")):
        main = crumb("es", T["es"]["f_" + key]) + body
        write(out_path(R("es", key)), shell("es", R("es", key), R("en", key), T["es"][tk], re.sub(r"<[^>]+>", "", body)[:150], main))

def page_404():
    write("404.html", shell("en", "/404", "/es/", T["en"]["nf_title"], "Page not found.", legacy_main("404", "en"), noindex=True))

# ───────────────────────── extras ─────────────────────────
def search_json(lang):
    write(R(lang, "search").lstrip("/"), json.dumps([[a["title"], a["slug"], a["ep"], a["at"], " ".join([a["romaji"]] + a["synonyms"][:3])] for a in A], ensure_ascii=False, separators=(",", ":")))

def sitemap():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d"); urls = []
    def add(en, es, pr):
        for loc in (en, es):
            alt = f'<xhtml:link rel="alternate" hreflang="en" href="{SITE}{en}"/><xhtml:link rel="alternate" hreflang="es" href="{SITE}{es}"/><xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{en}"/>'
            urls.append(f"<url><loc>{SITE}{loc}</loc>{alt}<lastmod>{today}</lastmod><changefreq>daily</changefreq><priority>{pr}</priority></url>")
    add("/", "/es/", "1.0")
    for k in ("schedule", "season", "catalog", "genres", "my", "vs"): add(R("en", k), R("es", k), "0.8")
    for a in A: add(url_anime(a, "en"), url_anime(a, "es"), "0.9")
    for i in range(7): add(url_day(i, "en"), url_day(i, "es"), "0.6")
    for g, _ in genre_counts("en"): add(url_genre(g, "en"), url_genre(g, "es"), "0.6")
    for k in ("about", "contact"): add(R("en", k), R("es", k), "0.3")
    for k in ("privacy", "terms"): urls.append(f"<url><loc>{SITE}{R('en',k)}</loc><lastmod>{today}</lastmod><priority>0.2</priority></url>")
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + "".join(urls) + "</urlset>")

EXTRA_CSS = """
/* selector de idioma: EN | ES, el idioma actual va resaltado */
.lang{margin-left:auto;display:inline-flex;align-items:center;border:1px solid rgba(210,72,127,.28);border-radius:999px;overflow:hidden;font-size:.7rem;font-weight:800;letter-spacing:.05em;line-height:1;flex-shrink:0}
.lang a{padding:6px 10px;color:var(--tx2);text-decoration:none;transition:background .2s,color .2s}
.lang a:hover{background:rgba(243,168,196,.18)}
.lang a.on{background:var(--sk2,#d2487f);color:#fff;cursor:default}
.lang+.upd{margin-left:12px}
@media(max-width:720px){.upd{display:none}}
/* encuesta del capítulo */
.poll h3{margin-bottom:4px}
.poll .ph{font-size:.8rem;color:var(--tx2);margin-bottom:12px}
.poll .opts{display:flex;gap:8px;flex-wrap:wrap}
.poll .opt{flex:1 1 100px;padding:12px 8px;border-radius:14px;border:1px solid var(--bd);background:#fff;color:var(--tx);font:inherit;font-weight:700;font-size:.95rem;cursor:pointer;box-shadow:0 4px 14px var(--sh);transition:transform .15s,background .2s,border-color .2s}
.poll .opt:hover{transform:translateY(-1px);background:var(--sk3)}
.poll .opt.sel{background:var(--sk2);color:#fff;border-color:transparent}
.poll .opt[disabled]{cursor:default;transform:none}
.poll .opt[disabled]:not(.sel){opacity:.7}
.poll .pm{margin-top:10px;font-size:.86rem;font-weight:700;color:var(--sk2)}
.poll .pm:empty{display:none}
.poll .res{margin-top:10px;display:grid;gap:9px}
.poll .r{display:grid;grid-template-columns:1fr auto;gap:3px 10px;font-size:.88rem;color:var(--tx2);align-items:center}
.poll .r.mine{color:var(--tx);font-weight:800}
.poll .bar{grid-column:1/-1;height:8px;border-radius:999px;background:var(--sk3);overflow:hidden}
.poll .bar i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,var(--sk),var(--sk2));transition:width .7s ease}
.poll .tot{margin-top:10px;font-size:.8rem;color:var(--tx2)}

/* Versus: teaser en la home */
.vsp{display:flex;gap:16px;align-items:center;margin-top:26px;padding:16px 18px;border-radius:22px;background:linear-gradient(135deg,#fff 0%,var(--sk3) 100%);border:1px solid var(--bd);box-shadow:0 10px 30px var(--sh);text-decoration:none;color:inherit;transition:transform .25s,box-shadow .25s}
.vsp:hover{transform:translateY(-2px);box-shadow:0 16px 40px var(--sh)}
.vsp-im{position:relative;width:124px;height:118px;flex-shrink:0}
.vsp-im img{position:absolute;top:6px;width:70px;height:102px;object-fit:cover;border-radius:12px;box-shadow:0 8px 20px var(--sh);border:2px solid #fff}
.vsp-im img:first-child{left:0;transform:rotate(-9deg)}.vsp-im img:nth-child(2){right:0;transform:rotate(9deg)}
.vsp-im span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-8deg);background:var(--sk2);color:#fff;font-weight:900;font-size:.78rem;letter-spacing:.08em;padding:6px 9px;border-radius:999px;box-shadow:0 6px 16px rgba(232,127,168,.45)}
.vsp .k{font-size:.66rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--sk2)}
.vsp .h{font-weight:800;font-size:1.15rem;letter-spacing:-.02em;margin:3px 0 4px;line-height:1.15}
.vsp p{font-size:.86rem;color:var(--tx2);margin-bottom:10px}
.vsp .btn{padding:9px 18px;font-size:.84rem}
.vsbtn{position:relative;animation:vspulse 2.2s ease-in-out infinite}
@keyframes vspulse{0%,100%{box-shadow:0 8px 24px rgba(232,127,168,.35)}50%{box-shadow:0 8px 24px rgba(232,127,168,.35),0 0 0 8px rgba(232,127,168,.16)}}
.navvs{color:var(--sk2)!important;font-weight:800}
.vsp{margin-top:18px}
.vshd .vsr{display:flex;gap:8px}.vshd .snd{padding:8px 11px;font-size:.95rem;line-height:1}.vshd .snd.off{opacity:.55}
@media(max-width:420px){.vsp{gap:12px;padding:14px}.vsp-im{width:104px;height:104px}.vsp-im img{width:60px;height:88px}.vsp .h{font-size:1.02rem}}
/* Versus: juego */
.vs{margin-top:6px}
.vshd{display:flex;align-items:center;justify-content:space-between;margin:14px 0 12px;font-size:.84rem;color:var(--tx2);font-weight:800;letter-spacing:.02em}
.vshd .skip{background:#fff;border:1px solid var(--bd);border-radius:999px;padding:8px 14px;font:inherit;font-size:.8rem;font-weight:800;color:var(--tx2);cursor:pointer;transition:background .2s,color .2s}
.vshd .skip:hover{background:var(--sk3);color:var(--sk2)}
.arena{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;min-height:300px}
.vc{position:relative;border-radius:22px;overflow:hidden;background:#fff;border:1px solid var(--bd);box-shadow:0 10px 30px var(--sh);cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;transition:transform .45s cubic-bezier(.2,.9,.3,1.25),opacity .35s,box-shadow .3s,filter .4s;will-change:transform;outline:none}
.vc:focus-visible{box-shadow:0 0 0 3px var(--sk)}
.vc:active{transform:scale(.97)}
.vc .im{position:relative;padding-top:146%;background:var(--sk3);overflow:hidden}
.vc .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.vc .nm{padding:10px 12px 3px;font-weight:800;font-size:.93rem;line-height:1.2;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.45em}
.vc .mt{padding:0 12px 12px;font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vc .fill{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,rgba(232,127,168,0) 0%,rgba(232,127,168,.55) 35%,rgba(210,72,127,.9) 100%);transition:height .9s cubic-bezier(.2,.8,.2,1)}
.vc .pct{position:absolute;left:0;right:0;bottom:14px;text-align:center;color:#fff;font-weight:900;font-size:2.5rem;line-height:1;letter-spacing:-.045em;text-shadow:0 2px 14px rgba(0,0,0,.4);opacity:0;transform:translateY(12px);transition:opacity .3s,transform .45s cubic-bezier(.2,.9,.3,1.3)}
.vc .pct small{display:block;margin-top:4px;font-size:.7rem;font-weight:800;letter-spacing:.03em;opacity:.95}
.vc .chk{position:absolute;top:10px;left:10px;width:36px;height:36px;border-radius:50%;background:var(--sk2);color:#fff;display:grid;place-items:center;transform:scale(0);transition:transform .4s cubic-bezier(.2,.9,.3,1.5);box-shadow:0 4px 14px rgba(232,127,168,.55)}
.vc .chk svg{width:19px;height:19px}
.arena.in .vc{animation:vcin .55s cubic-bezier(.2,.9,.3,1.25) backwards}
.arena.in .vc:nth-child(3){animation-delay:.09s}
@keyframes vcin{from{opacity:0;transform:translateY(46px) scale(.9)}to{opacity:1;transform:none}}
.arena.done .vc{pointer-events:none}
.vc.win{transform:scale(1.05);box-shadow:0 0 0 3px var(--sk2),0 18px 44px rgba(232,127,168,.38);z-index:2}
.vc.win .chk{transform:scale(1)}
.vc.lose{transform:scale(.93);filter:grayscale(1) brightness(.86);opacity:.72}
.vc.show .pct{opacity:1;transform:none}
.vc.out.win{transform:translateY(-44px) scale(1.02);opacity:0}
.vc.out.lose{transform:translateY(44px) scale(.9);opacity:0}
.vsb{position:absolute;left:50%;top:34%;z-index:3;background:#fff;color:var(--sk2);font-weight:900;font-size:.92rem;letter-spacing:.08em;padding:9px 12px;border-radius:999px;border:1px solid var(--bd);box-shadow:0 8px 24px var(--sh);pointer-events:none;animation:vsb .6s cubic-bezier(.2,.9,.3,1.5) .18s both}
@keyframes vsb{from{transform:translate(-50%,-50%) rotate(-30deg) scale(.3);opacity:0}to{transform:translate(-50%,-50%) rotate(-8deg) scale(1);opacity:1}}
.vsmsg{margin-top:12px;min-height:1.3em;font-size:.84rem;color:var(--tx2);text-align:center}
.petalburst{position:absolute;inset:0;pointer-events:none;z-index:4}
.petalburst i{position:absolute;width:11px;height:11px;margin:-5px 0 0 -5px;border-radius:60% 0 60% 0;background:var(--sk);animation:pb .85s cubic-bezier(.1,.8,.3,1) forwards}
.petalburst i:nth-child(odd){background:var(--sk2)}.petalburst i:nth-child(3n){background:var(--gd)}
@keyframes pb{to{transform:translate(var(--x),var(--y)) rotate(260deg) scale(.3);opacity:0}}
@media(min-width:720px){.arena{gap:22px;max-width:720px;margin:0 auto}.vshd{max-width:720px;margin-left:auto;margin-right:auto}.vc .nm{font-size:1.05rem}.vc .pct{font-size:3.2rem}.vsb{font-size:1.05rem;padding:11px 15px}}
@media(prefers-reduced-motion:reduce){.arena.in .vc,.vsb,.petalburst i{animation:none}.vc,.vc .fill,.vc .pct,.vc .chk{transition:none}}
"""

def pack_source():
    """Empaqueta el generador (sin secretos) en public/sakuraair-src.zip para poder clonarlo desde otro entorno."""
    import zipfile
    zp = os.path.join(OUT, "sakuraair-src.zip")
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for folder in ("gen", "assets", "templates"):
            for d, _, fs in os.walk(os.path.join(ROOT, folder)):
                for f in fs:
                    if "__pycache__" in d or f.endswith(".pyc"): continue
                    full = os.path.join(d, f); z.write(full, os.path.relpath(full, ROOT))
        z.write(os.path.join(ROOT, "README.md"), "README.md")

def assets():
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)
    for f in os.listdir(ASSETS): shutil.copy(os.path.join(ASSETS, f), OUT)
    css = open(os.path.join(ASSETS, "s.css"), encoding="utf-8").read()
    open(os.path.join(OUT, "s.css"), "w", encoding="utf-8").write(css + EXTRA_CSS)
    pack_source()
    open(os.path.join(OUT, "_headers"), "w").write("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/s.css\n  Cache-Control: public, max-age=31536000, immutable\n/*.webp\n  Cache-Control: public, max-age=31536000, immutable\n")

def main():
    assets()
    for lang in ("en", "es"):
        page_index(lang)
        for a in A: page_anime(a, lang)
        page_schedule(lang); page_genres(lang); page_season(lang); page_versus(lang)
        page_legacy("catalog", lang, "c_title", "c_desc"); page_legacy("anime-info", lang, "i_title", "i_desc", noindex=True); page_legacy("my-anime", lang, "my_title", "my_desc")
        search_json(lang)
    for k, tk in (("about", "ab_title"), ("contact", "co_title"), ("privacy", "pr_title"), ("terms", "te_title")): page_legacy(k, "en", tk)
    page_static_es(); page_404(); sitemap()
    n = sum(len(f) for _, _, f in os.walk(OUT)); print(f"[build] listo → public/ ({n} archivos)")

if __name__ == "__main__":
    main()
