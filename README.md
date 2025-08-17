# PWA-Starter für `https://alexd1984.github.io/Interview-/`

Diese Dateien machen deine GitHub-Pages-Seite als Progressive Web App (PWA) installierbar.

## Dateien
- `manifest.webmanifest` — PWA-Metadaten (Name, Icons, Farben, Start-URL)
- `sw.js` — Service Worker zum Caching & Offline-Fallback
- `offline.html` — einfache Offline-Seite
- `icons/icon-192.png`, `icons/icon-512.png` — App-Icons

## Einbindung in deine Seite

1. **Dateien ins Repo legen** (Wurzel des Projekts `Interview-`):
   ```text
   / (Repo-Wurzel)
   ├─ index.html
   ├─ manifest.webmanifest
   ├─ sw.js
   ├─ offline.html
   └─ /icons
      ├─ icon-192.png
      └─ icon-512.png
   ```

2. **`index.html` anpassen** (im `<head>` und vor `</body>`):
   ```html
   <!-- head: -->
   <link rel="manifest" href="/Interview-/manifest.webmanifest">
   <meta name="theme-color" content="#0f172a">
   <link rel="apple-touch-icon" href="/Interview-/icons/icon-192.png">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="default">

   <!-- body-end: -->
   <script>
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', function () {
         navigator.serviceWorker.register('/Interview-/sw.js', { scope: '/Interview-/' })
           .catch(console.error);
       });
     }
   </script>
   ```

3. **Optional: Eigene Assets vor-cachen**  
   Trage in `sw.js` unter `PRECACHE` deine bekannten Dateien ein (z. B. `styles.css`, `app.js`).

4. **Commit & Push** nach GitHub. Nach dem Laden der Seite kannst du im Browser „Als App installieren“ wählen.

## Hinweise
- Der `scope` und die Pfade sind auf ein *Projekt-Repository* (`/Interview-/`) auf GitHub Pages abgestimmt.
- Bei jeder inhaltlichen Änderung kannst du die `VERSION` im Service Worker erhöhen (z. B. `v1.0.1`), damit alte Caches invalidiert werden.
- iOS unterstützt keine `maskable` Icons, nutzt dann das 192px-Icon.
