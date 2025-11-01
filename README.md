# 🧺 CleanCycle - Mosószoba Management Rendszer

**Powered by Daniel Soos 2025**

Egy modern, valós idejű társasházi mosószoba foglalási és nyomonkövető alkalmazás.

## ✨ Funkciók

### 👤 Felhasználói funkciók
- ✅ Email/jelszó alapú bejelentkezés és regisztráció
- ✅ Mosó- és szárítógép állapotok valós időben
- ✅ Gépek indítása egyedi időtartammal
- ✅ Visszaszámláló a hátralévő időhöz
- ✅ Színkódolt állapotok (zöld=szabad, piros=fut, sárga=foglalt, szürke=karbantartás)
- ✅ Reszponzív, mobilbarát felület
- ✅ PWA támogatás (telepíthető mobilra)

### 🔧 Admin/Gondnok funkciók
- ✅ Gépek állapotának kézi módosítása
- ✅ Összes gép áttekintése egy helyen
- ✅ Részletes rendszer naplók megtekintése
- ✅ Automatikus naplózás minden műveletről

### 🏢 Szobák és gépek
- **Kis Mosószoba**: 3 mosógép + 3 szárítógép
- **Nagy Mosószoba**: 5 mosógép + 5 szárítógép

## 🚀 Technológiák

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password)
- **Realtime**: Supabase Realtime API
- **Hosting**: Vercel (frontend) + Supabase (backend)

## 📦 Telepítés

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Supabase projekt beállítása

Kövesd a `supabase/SETUP.md` útmutatót:

1. Hozz létre egy Supabase projektet
2. Futtasd le a `supabase/migrations/001_initial_schema.sql` fájlt az SQL Editor-ban
3. Email autentikáció alapértelmezetten engedélyezve van
4. Másold ki a projekt URL-t és API kulcsokat

### 3. Környezeti változók

Hozz létre egy `.env.local` fájlt:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Fejlesztői szerver indítása

```bash
npm run dev
```

Nyisd meg a böngészőben: [http://localhost:3000](http://localhost:3000)

## 🏗️ Projekt struktúra

```
CleanCycle/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-specifikus oldalak
│   │   ├── auth/           # Auth oldal
│   │   ├── layout.tsx      # Locale layout
│   │   └── page.tsx        # Landing page
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard oldal
│   ├── admin/              # Admin panel
│   ├── machines/           # Machines oldal
│   └── auth/               # Auth callback
├── src/                     # Forráskód
│   ├── components/         # React komponensek
│   │   ├── ui/            # Újrafelhasználható UI komponensek
│   │   ├── shared/        # Megosztott komponensek
│   │   ├── auth/          # Auth komponensek
│   │   ├── dashboard/     # Dashboard komponensek
│   │   ├── admin/         # Admin komponensek
│   │   └── machines/      # Machines komponensek
│   ├── lib/               # Library kód
│   │   ├── supabase/      # Supabase kliensek
│   │   ├── email/         # Email szolgáltatások
│   │   └── utils/         # Utility függvények
│   ├── types/             # TypeScript típusdefiníciók
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API szolgáltatások
│   ├── constants/         # Konstansok
│   └── config/            # Konfigurációs fájlok (i18n, stb.)
├── locales/                # i18n fordítások (9 nyelv)
├── database/               # Adatbázis szkriptek
│   ├── migrations/        # SQL migrációk
│   └── seeds/             # Seed adatok
├── docs/                   # Dokumentáció
├── scripts/                # Build és utility szkriptek
├── tests/                  # Tesztek
└── public/                 # Statikus fájlok
```

## 🎨 Színkódok

- 🟢 **Zöld**: Szabad gép
- 🔴 **Piros**: Fut
- 🟡 **Sárga**: Foglalt
- ⚫ **Szürke**: Karbantartás
- ⚫ **Fekete**: Hibás

## 👥 Jogosultsági szintek

1. **User (Lakó)**: Gépek használata, saját előzmények
2. **Manager (Gondnok)**: + Gépállapotok módosítása
3. **Admin**: + Teljes hozzáférés, logok, felhasználók

## 📱 PWA (Progressive Web App)

Az alkalmazás telepíthető mobilra:

1. Nyisd meg a weboldalt mobilon
2. Kattints a "Hozzáadás a kezdőképernyőhöz" opcióra
3. Az app ikonként jelenik meg a telefonodon

## 🔄 Valós idejű frissítések

A Supabase Realtime API-t használja:
- Gépállapotok automatikusan frissülnek minden kliensen
- Nincs szükség manuális frissítésre
- Azonnali szinkronizáció

## 🚧 Jövőbeli fejlesztések

- [ ] Email értesítések (10 perc előtt, lejáratkor)
- [ ] Foglalási rendszer jövőbeli időpontokra
- [ ] "Ruhát bennhagyták" bejelentés
- [ ] Felhasználói előzmények megtekintése
- [ ] Statisztikák és riportok
- [ ] Electron desktop app

## 📄 Licenc

© 2025 Daniel Soos. Minden jog fenntartva.

---

**Powered by Daniel Soos 2025** 🚀

