# AFTER HOURS — Couples & Friends

An original, responsive, adult-only (18+) consent-first social challenge game. No Lovable, server, subscriptions, accounts, analytics, paid services, or build tools needed. **254 original built-in cards**, plus up to 500 custom cards. All player data is kept in browser localStorage.

## Run locally
Open `index.html` on a PC/Mac (or run `python3 -m http.server 8000` in this folder and visit http://localhost:8000). On iPhone, a published HTTPS link is the simplest way to play.

## Publish free using GitHub Pages
1. Sign in to GitHub and create a **new public repository**, e.g. `after-hours-game`. Keep your existing repositories unchanged.
2. Open that new repository and select **Add file → Upload files**. Upload `index.html`, `styles.css`, `app.js`, `cards.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, and `icon-512.png` at the top level. Commit changes.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main**, folder **/(root)**, and **Save**.
4. After GitHub Pages publishes the site, your address will generally be `https://YOUR-USERNAME.github.io/after-hours-game/` (replace the username and repository name). Open the same link on iPhone, Mac or PC. On iPhone Safari use Share → Add to Home Screen.

**Privacy:** GitHub Free's Pages hosting requires a *public repository*. Never upload private custom cards, backups, real players' preferences, or identifying details to GitHub. The delivered repository contains only generic sample names, safe default challenges, and no personal data. GitHub Pages itself may log visitors' IP addresses as described in GitHub's documentation; the app itself uses no third-party analytics or backend.

## Built-in challenge behavior
- `partners`: a pair card may choose only linked partners; solo and non-contact group cards can still appear.
- `mixed`: partner cards still require a linked partner; non-partner pair cards require **both people** to choose mixed pairing, **both couples** to approve mutual mixing, and **both people** to check the other in individual approvals.
- `group`: only group cards are eligible; every participant must have individually opted into the relevant category and comfort level.
- Every participant must opt in to a card's category and intensity, and consent again in real life. Skips and redraws have no penalty. The app cannot enforce real-world consent.

## Custom cards
Manage custom cards in **Cards → New card**. Import/export JSON is included, with type and length validation. The UI renders custom text as text (not as raw HTML), reducing code-injection risk. Backups can contain sensitive player preferences; keep them private. localStorage is specific to each browser/device and can be erased.

## Maintenance
This is a no-build static app. Edit files and commit to GitHub to update it. To invalidate offline cache after releases, change the `CACHE` value in `sw.js`.
