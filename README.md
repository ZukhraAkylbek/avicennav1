# Авиценна — сайт сети клиник

Современный сайт медицинского центра «Авиценна» (Бишкек), построенный на TanStack Start + React + Tailwind CSS.

**Опубликованная версия в Lovable**: https://avicennav1.lovable.app

## Разработка

```sh
bun install
bun run dev
```

## Самостоятельный деплой на Vercel

Проект уже настроен для сборки под Vercel (`nitro: { preset: "vercel" }` в `vite.config.ts` и `vercel.json`).

1. **Синхронизируйте код с GitHub** через встроенную интеграцию Lovable:
   - В редакторе Lovable нажмите **+** → **GitHub** → **Connect project**.
   - Выберите аккаунт/организацию и создайте/выберите репозиторий.
   - Дождитесь синхронизации.

2. **Импортируйте репозиторий в Vercel**:
   - Dashboard Vercel → **Add New Project** → выберите репозиторий GitHub.
   - Framework Preset оставьте на **Other** (контролируется `vercel.json`).
   - Build Command: `vite build` (уже задано в `vercel.json`).

3. **Добавьте переменные окружения** в Vercel (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_PROJECT_ID`
   - `LOVABLE_API_KEY` — берётся из секретов проекта в Lovable.
   - `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` (если используется карта)
   - `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` (если используется карта)

4. **Запустите деплой**. Vercel соберёт проект и создаст SSR-функции для всех маршрутов.

## Почему раньше не отображалось на Vercel

По умолчанию Lovable собирает TanStack Start под Cloudflare Workers. Для Vercel нужен Nitro-пресет `vercel`, который теперь задан в `vite.config.ts`.
