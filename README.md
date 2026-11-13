# After Hours — v3 (free, private party game)

A self-contained, mobile-responsive adults-only game for consenting players. No accounts, subscription, tracking scripts or server-side storage.

## Use it

**Easiest:** Open `After-Hours-v3.html` in your browser (also provided separately). Everything is embedded in one HTML file.

**Free website:** Upload all the contents of this folder (`index.html`, `styles.css`, `app.js`, `cards.js`, `quick-cards.js`, icons, manifest, and `sw.js`) to the root of a public GitHub repository. Under **Settings → Pages**, publish from the `main` branch at `/(root)`. Visit `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/` after deployment.

## What changed in v3

- Mutual opt-in accordions stay open as people check multiple approvals.
- Gameplay now has a single large central challenge card, compact controls and optional illustrated examples. Scores/progress are collapsed into a panel under the card.
- Buttons stay on the gameplay view instead of sending the page down to its footer. The footer is hidden during gameplay and the scroll position is reset after drawing.
- Three direct chapter shortcuts: Warm Up, Turn Up, After Dark. Jumping never changes other players' comfort levels or approvals.
- Three deck choices: Quick Dares (84 new, short challenges), All Cards (original larger library + quick additions), and My Private Cards (only user-created/imported).
- Non-graphic, original SVG stick figures for common actions such as dancing, holding hands, kissing, or talking. These are illustrative examples, not explicit depictions. They can be hidden.
- A new "Private intimacy (my cards)" category is available for custom user-written cards. It is OFF by default for everyone and requires opt-in both individually and globally. No explicit act descriptions are bundled.
- Your old preferences and custom cards remain in local browser storage, when accessed using the same browser and origin; the upgrade does not wipe your settings.

## Privacy and consent

The app stores all players' names, permissions, custom cards and progress locally in your browser. Hosting the app on a public site does not publish these local values. Custom cards do not sync automatically across devices. Use JSON export/import to move them yourself. Anyone may skip any activity without penalty. Ask before physical interaction.

## Troubleshooting

If an old cached version remains on GitHub Pages, reload with browser cache bypassed or remove and reinstall the home-screen shortcut after the update. Because local file (`file://`) pages and a hosted website have different storage origins, they do not automatically share player settings.
