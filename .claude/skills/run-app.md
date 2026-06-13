# run-app skill

Launch the Winx Gacha dev server and verify it works.

## Steps

1. Check that dependencies are installed:
   ```bash
   ls node_modules 2>/dev/null || npm install
   ```

2. Start dev server in background:
   ```bash
   npm run dev &
   ```

3. Wait for Vite to be ready (look for "Local: http://localhost:5173" in output).

4. Open http://localhost:5173 in browser or use curl to verify it responds:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
   ```

5. Report the URL and any console errors found.

## Notes

- Dev server runs on port 5173 by default (Vite)
- Hot Module Replacement (HMR) is active — edits reflect immediately
- TypeScript errors show in terminal, not browser console
- Check browser DevTools → Application → Local Storage for `winx_game` and `winx_inventory` keys
