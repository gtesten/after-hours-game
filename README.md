# AFTER HOURS — Couples & Friends (v2.1)

A free, self-contained, adult-only (18+) party challenge game designed for iPhone Safari, Mac, and PC browsers. This version contains **433 original built-in cards, including 179 new spicy, non-graphic challenges**, plus up to 500 custom cards. No Lovable, account, paid subscription, database, tracking scripts, or build tools are needed.

## What's fixed

- Fresh setups contain **one placeholder player (Player 1) and no partner assignment**. Add a player yourself, then explicitly choose a partner only if you want one.
- If you previously used the unmodified sample Alex/Jamie pairing (possibly renamed Alex to Glenn) and have never started a game, the old demo Jamie entry is removed automatically. Your other player and custom cards are kept. To remove any other pairing, use **Players → Unlink all**, or choose **No partner** on a player's profile. Unlink all is visible only when a couple is actually linked.
- **Resume game** appears only for active games; it is hidden before the first session and after the game ends.
- **Show more cards** now loads another 18 cards, updates the remaining count, and scrolls to the first new card. It disappears when no additional matching cards remain.
- **Heat** filter separates spicy cards from classic cards. **Prioritize spicy challenges** is enabled by default in setup; it gives compatible spicy cards more weight without bypassing participant preferences.
- New cards include playful teasing, flirty truths, physical affection, kissing, optional dance challenges, roleplay, and mutually approved cross-couple prompts. They do not include graphic descriptions of sex acts. Private custom cards remain editable and importable.

## Publish to GitHub Pages — free

1. Create a **public** GitHub repository, such as `after-hours-game` (a public repo is required for GitHub Pages on the free tier).
2. Upload the **eight site files from the ZIP root**: `index.html`, `styles.css`, `app.js`, `cards.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, and `icon-512.png`. Upload `README.md` if you want documentation. Don't upload any personal custom-card backups.
3. In **Settings → Pages**, set **Deploy from a branch → main → /(root)** and save.
4. The resulting URL is typically `https://YOUR-USERNAME.github.io/after-hours-game/`. Use the same URL on iPhone, Mac, and Windows. On an iPhone, open it in Safari and use **Share → Add to Home Screen**.
5. When upgrading an existing copy, **replace all HTML, CSS, and JS files together**, including `sw.js`. After publishing, refresh the site; if old content is still cached, reload or remove/re-add the Home Screen shortcut.

## Local testing

Open `index.html` in a modern desktop browser or run `python3 -m http.server 8000` from the folder and visit `http://localhost:8000`. iPhone Safari is easiest via GitHub Pages' HTTPS link.

## Consent, privacy, and filters

- The app expects at least two adults to start. No one is paired or approved automatically.
- **Partner-only** mode cannot assign a cross-couple pairing. **Mixed** mode requires both people to enable mixed pairing, both couples to allow mixing, and each individual to approve the other. No challenge overrides the card's required category or personal comfort level.
- Group cards with physical-contact categories are excluded, since group membership alone cannot authorize contact.
- Everyone can skip or stop a challenge without a penalty. Always confirm consent in person.
- All names, preferences, player history, and custom cards use device-local browser storage. There is no cross-device synchronization. Backups and JSON imports are opt-in and may contain sensitive information; keep them private.
- No copyrighted card text from Jadegreen or other games is bundled. All built-in challenges are original.

## Testing performed

A headless browser run with desktop and mobile-sized viewports confirmed that initial players are unpaired, Resume is hidden before a game and after finishing, 18 → 36 library cards appear after Show more, spicy filtering returns the expected cards, games draw and advance, the earlier demo pairing migrates, cross-couple pairing requires mutual approval, and HTML in custom-card text is escaped. These are automated browser-level checks, not a guarantee that every iPhone OS/browser version or public hosting configuration is bug-free.
