# Untitled Stream

Vite + React – vorbereitet für Audio-Upload, Supabase & Vercel.

## Start

```bash
cd untitled-stream
npm install
npm run dev
```

## Cursor-Kurzbefehle

| Aktion | Shortcut | Beispiel-Prompt |
|--------|----------|-----------------|
| **Neue Features** | `Strg+K` | „Add upload functionality for audio files" |
| **Fehler beheben** | Fehler markieren → `Strg+K` | „Fix this error" |
| **Code erklären** | Code markieren → `Strg+L` | „Explain this code" |

## Vercel (Hosting)

- **Framework:** Vite  
- **Build:** `npm run build`  
- **Output:** `dist`

**Env-Variablen in Vercel:**
```
VITE_SUPABASE_URL=deine-supabase-url
VITE_SUPABASE_ANON_KEY=dein-supabase-key
```

## Supabase + Metadaten (ChatGPT / Python)

Beispiel-Prompt für ein Python-Script mit **mutagen**:

> Erstelle ein Script, das:  
> 1. Alle MP3 in einem Ordner scannt  
> 2. ID3-Tags ausliest (Artist, Album, Title, Year)  
> 3. Eine CSV für Supabase-Import erzeugt
