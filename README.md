# 🎮 WonderLab Play — Multi-Device Game Portal

One magical arcade for every **WonderLab AR** game & app — built with pure **HTML + CSS + JavaScript** and synced across **Phone 📱, Laptop 💻 & Smart TV 📺** via **Supabase Cloud**.

![WonderLab Play](assets/logo-320.png)

**Live URL (GitHub Pages):** `https://susanthavfx-art.github.io/WonderLab-Play/`

---

## ✨ Key Features

| Feature | Details |
| --- | --- |
| **☁️ Supabase Cloud Sync** | Connected to `wonderlab.app` (`public.portal_games`). Add or edit a game once — it updates live across Phone, Laptop & Smart TV with offline `localStorage` fallback. |
| **📺 Smart TV Mode & Remote** | Auto-detects Samsung Tizen, LG webOS, Android TV / Google TV, Fire TV & Bravia (`?tv=1` or **TV** button in header). Full **Arrow-key D-Pad**, **OK (`Enter`)**, and **Back** navigation with 10-foot glowing focus ring. |
| **🚀 Smart Launch + Auto QR** | Supports **Portal Modal (iframe)**, **Full Screen Direct**, and **New Tab** per game. Camera/Web AR games opened on a Smart TV automatically display a **100% offline SVG QR Code** to scan with a phone! |
| **🐠 Companion Phone QR** | Optional separate **Companion Phone URL** (e.g. Fish Scanner URL for phones while the Smart TV runs the full-screen 3D Digital Aquarium Tank). |
| **🔐 Owner-Only Admin** | Password verified server-side via Supabase `SECURITY DEFINER` Postgres RPC (`portal_verify_owner` / `portal_upsert_game` / `portal_delete_game`). |
| **🫧 Built-in Demo Arcade** | 30-second *Bubble Pop* canvas game playable via touch, mouse, or Smart TV remote (`OK` / `Space`). |

---

## 📤 One-Time Upload to GitHub (`WonderLab-Play`)

1. Open **[github.com/susanthavfx-art/WonderLab-Play/upload/main](https://github.com/susanthavfx-art/WonderLab-Play/upload/main)**.
2. Extract `WonderLab-Play-GitHub-Upload.zip` and drag these items into the upload box:
   - `index.html`
   - `.nojekyll`
   - `README.md`
   - `css/`
   - `js/`
   - `assets/`
3. Click **Commit changes** — your existing `.github/workflows/static.yml` workflow deploys **`https://susanthavfx-art.github.io/WonderLab-Play/`** automatically!
4. After this one-time upload, **you never need to re-upload to add games** — adding/editing games in **Owner mode** (or via Supabase) updates every device automatically.

---

## 🔐 Owner Mode

1. Click **🔒 Owner** in the top-right header.
2. Enter your private Owner password (stored encrypted via bcrypt in Supabase `portal_private` — zero secrets in source code; changeable anytime via **🔑 Password** inside Owner mode).
3. Click **Add New Game** (or **✏️** on any card) to set:
   - **Play link:** your game's GitHub Pages URL (e.g. `https://susanthavfx-art.github.io/3D-Digital-Aquarium/`)
   - **Launch mode:** *Inside Portal Player*, *Full Screen Direct*, or *New Tab*
   - **Companion Phone QR link:** optional mobile controller/scanner link
   - **Supported devices:** uncheck **📺 Smart TV** for camera/Web AR-only apps so Smart TVs automatically pop up a scannable Phone QR code!

---

© WonderLab AR · AI · 3D · Animation · Video
