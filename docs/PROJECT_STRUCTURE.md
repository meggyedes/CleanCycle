# 🏗️ CleanCycle Projekt Struktúra

## 📋 Áttekintés

Ez a dokumentum részletesen leírja a CleanCycle projekt fájlstruktúráját, amely a **Next.js 15 App Router** best practice-eket és a **Helium Icon Theme** konvencióit követi.

---

## 📁 Főkönyvtár Struktúra

```
CleanCycle/
├── app/                      # Next.js App Router
├── src/                      # Forráskód (komponensek, lib, hooks, stb.)
├── locales/                  # i18n fordítások (9 nyelv)
├── database/                 # Adatbázis szkriptek és migrációk
├── docs/                     # Dokumentáció
├── scripts/                  # Build és utility szkriptek
├── tests/                    # Tesztek
├── public/                   # Statikus fájlok
├── secure/                   # Érzékeny adatok (gitignore-ban!)
├── middleware.ts             # Next.js middleware (i18n + Supabase)
├── next.config.ts            # Next.js konfiguráció
├── tsconfig.json             # TypeScript konfiguráció
└── tailwind.config.ts        # Tailwind CSS konfiguráció
```

---

## 🎯 `app/` - Next.js App Router

A Next.js 15 App Router könyvtára. Tartalmazza az összes oldalt és API route-ot.

```
app/
├── [locale]/                 # Locale-specifikus oldalak
│   ├── auth/                # Auth oldal (login/register)
│   │   └── page.tsx
│   ├── layout.tsx           # Locale layout (next-intl provider)
│   └── page.tsx             # Landing page
├── api/                     # API routes
│   └── auth/
│       ├── login/
│       │   └── route.ts
│       └── register/
│           └── route.ts
├── dashboard/               # Dashboard oldal
│   └── page.tsx
├── admin/                   # Admin panel
│   └── page.tsx
├── machines/                # Machines oldal
│   └── page.tsx
├── auth/                    # Auth callback
│   └── callback/
│       └── route.ts
├── globals.css              # Globális CSS
├── layout.tsx               # Root layout
├── manifest.ts              # PWA manifest
└── page.tsx                 # Root page (redirect)
```

### 📌 Fontos megjegyzések:
- **`[locale]/`**: Dinamikus route szegmens a többnyelvűséghez (en, hu, nl, de, fr, it, be, bg, sk)
- **`api/`**: Server-side API endpoints
- **`layout.tsx`**: Minden oldal közös layoutja
- **`page.tsx`**: Az adott route oldala

---

## 🎨 `src/` - Forráskód

Az összes újrafelhasználható kód (komponensek, hooks, utilities, stb.) itt található.

### 📦 `src/components/` - React Komponensek

```
src/components/
├── ui/                      # Újrafelhasználható UI komponensek
│   └── (gombok, inputok, modalok, stb.)
├── shared/                  # Megosztott komponensek
│   └── LanguageSwitcher.tsx
├── auth/                    # Auth-specifikus komponensek
│   ├── LoginButton.tsx
│   ├── LogoutButton.tsx
│   ├── PasswordStrengthIndicator.tsx
│   └── UserInfo.tsx
├── dashboard/               # Dashboard komponensek
│   ├── MachineCard.tsx
│   ├── MachineGrid.tsx
│   ├── RoomSelector.tsx
│   └── StartMachineModal.tsx
├── admin/                   # Admin komponensek
│   ├── AdminLogs.tsx
│   └── AdminMachineManager.tsx
└── machines/                # Machines komponensek
    └── MachinesList.tsx
```

**Importálás:**
```typescript
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import LoginButton from '@/components/auth/LoginButton'
import MachineCard from '@/components/dashboard/MachineCard'
```

---

### 📚 `src/lib/` - Library Kód

```
src/lib/
├── supabase/                # Supabase kliensek
│   ├── client.ts           # Client-side Supabase kliens
│   ├── server.ts           # Server-side Supabase kliens
│   └── middleware.ts       # Supabase middleware
├── email/                   # Email szolgáltatások
│   └── email.ts            # Nodemailer konfiguráció
└── utils/                   # Utility függvények
    └── session-manager.ts  # Session kezelés
```

**Importálás:**
```typescript
import { createClient } from '@/lib/supabase/client'
import { sendEmail } from '@/lib/email/email'
import { checkExpiredSessions } from '@/lib/utils/session-manager'
```

---

### 🔧 `src/types/` - TypeScript Típusdefiníciók

```
src/types/
└── database.types.ts        # Supabase adatbázis típusok
```

**Importálás:**
```typescript
import { Database } from '@/types/database.types'
type User = Database['public']['Tables']['users']['Row']
```

---

### 🎣 `src/hooks/` - Custom React Hooks

```
src/hooks/
└── (custom hooks helye)
```

**Példa:**
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  // ...
}

// Importálás:
import { useAuth } from '@/hooks/useAuth'
```

---

### 🌐 `src/services/` - API Szolgáltatások

```
src/services/
└── (API szolgáltatások helye)
```

**Példa:**
```typescript
// src/services/authService.ts
export const authService = {
  login: async (email: string, password: string) => { /* ... */ },
  register: async (data: RegisterData) => { /* ... */ }
}

// Importálás:
import { authService } from '@/services/authService'
```

---

### 📌 `src/constants/` - Konstansok

```
src/constants/
└── (konstansok helye)
```

**Példa:**
```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register'
}

// Importálás:
import { API_ENDPOINTS } from '@/constants/api'
```

---

### ⚙️ `src/config/` - Konfigurációs Fájlok

```
src/config/
├── i18n.ts                  # i18n típusok és konstansok
├── routing.ts               # next-intl routing konfiguráció
└── request.ts               # next-intl request konfiguráció
```

**Importálás:**
```typescript
import { routing } from '@/config/routing'
import { locales, localeNames } from '@/config/i18n'
```

---

## 🌍 `locales/` - i18n Fordítások

```
locales/
├── en.json                  # Angol (alapértelmezett)
├── hu.json                  # Magyar
├── nl.json                  # Holland
├── de.json                  # Német
├── fr.json                  # Francia
├── it.json                  # Olasz
├── be.json                  # Belga/Flamand
├── bg.json                  # Bolgár
└── sk.json                  # Szlovák
```

**Használat:**
```typescript
// Server-side
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('auth')

// Client-side
import { useTranslations } from 'next-intl'
const t = useTranslations('auth')
```

---

## 🗄️ `database/` - Adatbázis Szkriptek

```
database/
├── migrations/              # SQL migrációs szkriptek
│   ├── 001_initial_schema.sql
│   └── 002_auth_system_upgrade.sql
└── seeds/                   # Seed adatok
    └── (seed fájlok helye)
```

---

## 📖 `docs/` - Dokumentáció

```
docs/
├── PROJECT_STRUCTURE.md     # Ez a fájl
└── SETUP.md                 # Setup útmutató (adatbázis)
```

---

## 🔧 `scripts/` - Build és Utility Szkriptek

```
scripts/
└── (build és utility szkriptek helye)
```

---

## 🧪 `tests/` - Tesztek

```
tests/
└── (unit és integration tesztek helye)
```

---

## 🎨 `public/` - Statikus Fájlok

```
public/
├── homepage.png             # Landing page kép
└── manifest.json            # PWA manifest
```

---

## 🔐 `secure/` - Érzékeny Adatok

```
secure/
├── TODO.txt                 # Projekt TODO lista
├── email-datas.txt          # Email adatok
├── eredeti-prompt.txt       # Eredeti prompt
└── supabase-password.txt    # Supabase jelszó
```

**⚠️ FIGYELEM:** Ez a mappa a `.gitignore`-ban van, NE commitold!

---

## 🛠️ TypeScript Path Aliases

A `tsconfig.json`-ban definiált path aliasok:

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/types/*": ["./src/types/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/services/*": ["./src/services/*"],
    "@/constants/*": ["./src/constants/*"],
    "@/config/*": ["./src/config/*"]
  }
}
```

---

## 📝 Importálási Példák

### ✅ Helyes importálás:

```typescript
// Komponensek
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import LoginButton from '@/components/auth/LoginButton'

// Lib
import { createClient } from '@/lib/supabase/client'

// Típusok
import { Database } from '@/types/database.types'

// Config
import { routing } from '@/config/routing'
```

### ❌ Helytelen importálás (régi útvonalak):

```typescript
// NE használd ezeket!
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Database } from '@/lib/types/database.types'
import { routing } from '@/i18n/routing'
```

---

## 🎯 Best Practice-ek

1. **Komponensek**: Mindig a megfelelő almappába tedd (`ui/`, `shared/`, `auth/`, stb.)
2. **Típusok**: Minden típusdefiníció a `src/types/` mappába kerüljön
3. **Hooks**: Custom hooks a `src/hooks/` mappába
4. **Services**: API hívások a `src/services/` mappába
5. **Constants**: Konstansok a `src/constants/` mappába
6. **Config**: Konfigurációs fájlok a `src/config/` mappába

---

## 🚀 Következő Lépések

1. ✅ Projekt struktúra átszervezve
2. ✅ Import útvonalak frissítve
3. ⏳ Dev szerver indítása és tesztelés
4. ⏳ Új komponensek létrehozása az új struktúrában

---

**Utolsó frissítés:** 2025-01-XX  
**Verzió:** 2.0 (Átszervezett struktúra)

