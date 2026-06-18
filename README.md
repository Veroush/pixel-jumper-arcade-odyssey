# 🕹️ Pixel Jumper: Arcade Odyssey

> *A rogue arcade cabinet came to life. Now its villains are loose across the game worlds. Only you can stop them — or join them.*

A retro 80s arcade platformer built with **Phaser 3** and vanilla JavaScript. Hop between three increasingly brutal game worlds, battle bosses, and chase the high score. Runs entirely in the browser — no install, no backend, no nonsense.

---

## 🎮 Play It

**Live:** [your-username.github.io/pixel-jumper-arcade-odyssey](https://your-username.github.io/pixel-jumper-arcade-odyssey)

**Local:**
```bash
# Clone the repo
git clone https://github.com/your-username/pixel-jumper-arcade-odyssey.git
cd pixel-jumper-arcade-odyssey

# Serve locally (Python)
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```
> ⚠️ Must be served over HTTP — opening `index.html` directly as a file will not work due to ES module imports.

---

## 🌍 Game Worlds

| World | Name | Theme | Difficulty |
|-------|------|-------|------------|
| 1 | Galactic Gunner | Space shooter arcade | Normal |
| 2 | Dungeon Delver | Medieval RPG dungeon | Hard |
| 3 | Turbo Circuit | Racing / driving chaos | Brutal |

Each world has its own color palette, enemy set, boss fight, and escalating difficulty. Beat all three to escape the arcade.

---

## 🧍 Playable Characters

| Character | Archetype | Special Move |
|-----------|-----------|--------------|
| **Grax the Wrecker** | Tank brawler | Ground Smash — slam down and shockwave nearby enemies |
| **Zara Volt** | Speedrunner | Lightning Chain — fire 3 electric bolts in a spread while dashing |
| **Baron Grimthorn** | Mage | Arcane Shield — absorb one hit, then recharge |
| **Nynx the Shadow** | Stealth | Shadow Step — go invisible for 2 seconds; backstab for double damage |

---

## ⌨️ Controls

| Action | Key |
|--------|-----|
| Move | `Arrow Keys` / `A` `D` |
| Jump | `Space` / `Z` |
| Attack | `X` / `Ctrl` |
| Dash | `Shift` + direction |
| Special | `Down` + `Shift` or `Down` + `Attack` |
| Interact / Enter portal | `Up` / `W` |
| Pause | `Escape` / `P` |
| Back | `Backspace` / `X` |

Gamepad supported (Xbox layout).

---

## 🏆 Scoring

- Defeat enemies to earn points (100–300 per enemy)
- Kill enemies in quick succession to build a **combo multiplier** (up to 4×)
- Finish a world without dying for a **2,000 point bonus**
- Beat the world timer for a **1,000 point bonus**
- Find secret rooms for a **1,500 point bonus**
- Boss defeats award 5,000–20,000 points depending on world
- Top 10 high scores saved locally — enter your 3-letter initials on the high score screen

---

## ⚙️ Settings

Fully adjustable from the main menu or pause screen:

- **Audio** — master, SFX, and music volume independently
- **Video** — toggle CRT scanlines, vignette, phosphor bloom, chromatic aberration, screen shake, and flashing effects
- **Gameplay** — difficulty (Easy / Normal / Hard / Arcade), starting lives, timer on/off
- **Controls** — fully remappable keyboard and gamepad support

---

## 🛠️ Tech Stack

- **[Phaser 3](https://phaser.io/)** (v3.80) — game framework
- **Vanilla JavaScript** (ES6 modules) — no build step required
- **HTML5 Canvas** — WebGL rendering with Canvas fallback
- **CSS** — CRT cabinet shell, scanline overlay, vignette
- **localStorage** — high score persistence
- **Google Fonts** — Press Start 2P for authentic retro text

---

## 📁 Project Structure

```
/
├── index.html                  # Entry point + CRT cabinet shell
├── game.js                     # Phaser config, scene bootstrap, CRT overlay loop
├── /scenes/                    # One file per game screen
│   ├── BootScene.js
│   ├── MainMenuScene.js
│   ├── CharacterSelectScene.js
│   ├── HUDScene.js
│   ├── PauseScene.js
│   ├── SettingsScene.js
│   ├── GameOverScene.js
│   ├── HighScoreScene.js
│   ├── WorldTransitionScene.js
│   ├── World1Scene.js
│   ├── World2Scene.js
│   ├── World3Scene.js
│   └── EndingScene.js
├── /classes/                   # Player, enemy, and boss logic
├── /plugins/
│   └── CRTShaderPipeline.js    # WebGL chromatic aberration shader
├── /utils/
│   ├── Constants.js            # All game values — never hardcoded inline
│   ├── ScoreManager.js
│   └── InputManager.js
└── /assets/                    # Sprites, tilesets, maps, audio, fonts
```

---

## 🎨 Visual Style

Rendered at **320×240 pixels** and upscaled via nearest-neighbor interpolation — no anti-aliasing, ever. CRT effects applied as a Canvas2D overlay:

- Scanlines every 2px at 25% opacity
- Radial vignette darkening toward screen edges
- Phosphor bloom via CSS filter
- Chromatic aberration via custom GLSL fragment shader
- Screen curvature via CSS border-radius

Strict **16-color EGA palette** per world. All sprites are pixel art on a 16×16 tile grid.

---

## 🚧 Roadmap

- [ ] Real sprite artwork (replacing placeholder rectangles)
- [ ] Chiptune / 8-bit audio tracks per world
- [ ] Tiled JSON map integration for hand-crafted levels
- [ ] Worlds 4 and 5 (Ocean Abyss + Boss Finale)
- [ ] Mobile touch controls
- [ ] Online leaderboard

---

## 📄 License

MIT — do whatever you want with it. A credit is appreciated but not required.

---

*Made with Phaser 3 and a deep love for the arcade era.*
