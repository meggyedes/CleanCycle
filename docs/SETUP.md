# Supabase Setup Útmutató

## 1. Supabase Projekt Létrehozása

1. Menj a [Supabase Dashboard](https://supabase.com/dashboard)-ra
2. Kattints a "New Project" gombra
3. Add meg a projekt nevét: `CleanCycle`
4. Állítsd be a jelszót (már megvan: `TBOvdT9tlaptJC0C`)
5. Válaszd ki a régiót (Europe West ajánlott)

## 2. Adatbázis Séma Létrehozása

1. A Supabase Dashboard-on menj a **SQL Editor** menüpontra
2. Kattints a "New Query" gombra
3. Másold be a `supabase/migrations/001_initial_schema.sql` fájl tartalmát
4. Futtasd le a "Run" gombbal

Ez létrehozza:
- ✅ Összes táblát (users, rooms, machines, sessions, notifications, logs)
- ✅ RLS (Row Level Security) policy-kat
- ✅ Indexeket a jobb teljesítményért
- ✅ Triggereket az automatikus naplózáshoz
- ✅ Kezdeti adatokat (2 szoba, 16 gép)

## 3. Email Autentikáció Beállítása

1. Menj a **Authentication > Providers** menüpontra
2. Az **Email** provider alapértelmezetten engedélyezve van
3. Opcionálisan beállíthatod:
   - **Confirm email**: Ki van kapcsolva (gyorsabb teszteléshez)
   - **Secure email change**: Be van kapcsolva (biztonságosabb)

**Megjegyzés:** Az alkalmazás email/jelszó alapú bejelentkezést használ, ami teljesen ingyenes!

## 4. Környezeti Változók Beállítása

1. A Supabase Dashboard-on menj a **Settings > API** menüpontra
2. Másold ki a következő értékeket:
   - `Project URL`
   - `anon public` kulcs
   - `service_role` kulcs (csak backend-hez!)

3. Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 5. Email Template-ek Beállítása

1. Menj az **Authentication > Email Templates** menüpontra
2. Állítsd be a következő template-eket:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## 6. Realtime Engedélyezése

1. Menj a **Database > Replication** menüpontra
2. Engedélyezd a Realtime-ot a következő táblákra:
   - ✅ `machines`
   - ✅ `sessions`

## 7. Admin Felhasználó Létrehozása

Miután az első felhasználó regisztrált Google-lal:

1. Menj a **Table Editor > users** táblához
2. Keresd meg a felhasználót
3. Módosítsd a `role` mezőt `admin`-ra

## 8. Tesztelés

Futtasd le a következő query-t az SQL Editor-ban, hogy ellenőrizd a setup-ot:

```sql
-- Ellenőrizd a szobákat
SELECT * FROM public.rooms;

-- Ellenőrizd a gépeket
SELECT * FROM public.machines;

-- Ellenőrizd a policy-kat
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Kész! 🎉

Most már futtathatod a Next.js alkalmazást:

```bash
npm run dev
```

Powered by Daniel Soos 2025

