# Community Tested FPS / Performance Patches

## 📁 File-Based FPS Unlocks (No Cheat Codes Needed)

Some games store FPS limits in config files you can edit directly. **No Artemis required.** Access: **Multiman** → back up as **JB Folder** → edit file via **FTP**.

| Game | Title ID | File to Edit | Change | Default Cap | Notes | Source |
|------|----------|-------------|--------|-------------|-------|--------|
| Battlefield Bad Company (Gold Ed.) | BLES00261 v1.20 | `Ps3GameSettings.cfg` | Set FPS value | — | Max 60! **>60 breaks the game** (HUD bugs). "FPS Unlocker" mod by Aniroh on Nexus Mods | NunoRS2000 |
| Battlefield Bad Company 2 | BLES00779 v1.05 | `Ps3GameSettings.cfg` | Set FPS value (same mod) | — | Same Nexus Mods "FPS Unlocker" as BBC1. Confirmed by Joey85 on real PS3 | Joey85 |
| Condemned 2: Bloodshot | BLUS30115 v1.00 | `PS3_GAME/USRDIR/autoexec.cfg` | Delete or change `MaxFPS` line | 40 FPS | Delete entirely for ~59.94 FPS. `FovY` line also allows custom FOV | PoppaJerry |
| Crysis | — | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Vsync commands in .cfg do **not** work | NunoRS2000 |
| Crysis 2 | BLUS30631 v1.04 | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Same as Crysis | NunoRS2000 |
| Crysis 3 | BLES01649 v1.04 | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Same as Crysis | NunoRS2000 |
| F.E.A.R. 2: Project Origin | BLES00464 | `PS3_GAME/USRDIR/autoexec.cfg` | Delete `MaxFPS` line; set `"VSyncOnFlip" "0.000000"` | 45 FPS | Delete `MaxFPS` entirely for ~59.94 FPS. Keep `FovY` ≤80 to avoid weapon clipping | PoppaJerry |
| Middle-Earth: Shadow of Mordor | — | `PS3_GAME/USRDIR/autoexec.cfg` | Delete or change `MaxFPS` line | 45 FPS | Delete entirely for ~59.94 FPS | PoppaJerry |
| Syndicate | BLUS30804 v1.00 | `ENVIRONMENT_PS3.CFG` | Change vsync value to `0` | — | ⚠️ File is **binary format** — use a hex editor, not a text editor | NunoRS2000 |

> **Condemned 2**, **F.E.A.R. 2**, and **Shadow of Mordor** all use the **LithTech Jupiter EX** engine — the same `autoexec.cfg` `MaxFPS` mechanism applies to all three.

---

All entries in the ✅ and ✅✅ sections below are confirmed working on real PS3 hardware (CFW + Artemis). Confirmed patches are marked `[Tested]` in their `.ncl` cheat name so you can identify them in the Artemis UI.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅✅ | **100% confirmed** — in `Working Artemis Patches/` folder, personally verified |
| ✅ | Confirmed on **real PS3 hardware** — community verified |
| 🔵 | RPCS3 conversion — not yet hardware-verified, high confidence |
| ⚠️ | Version mismatch, known side effects, or uncertain |
| ❌ | Known not to work or causes issues |

---

## ✅✅ 100% Confirmed — Working Artemis Patches (39 games)

Files are in the [`Working Artemis Patches/`](Working%20Artemis%20Patches/) folder. Use these directly — no testing needed. Most also work via PS3MAPI — see [`MAPI_PATCHES.md`](MAPI_PATCHES.md).

| Game | Title ID | Version |
|------|----------|---------|
| Destroy All Humans! Path of the Furon | BLES00467 | — |
| Dragon Ball Z: Burst Limit | BLUS30117 | v01.00 |
| Drakengard 3 | BLUS31197 | 01.01 |
| Fallout 3 | BLUS30185 | 01.61 |
| Fallout: New Vegas Ultimate Edition | BLES01475 | 01.00 |
| Final Fantasy XIII | MRTC00003 | v01.00 |
| Folklore | BCAS20013 / BCES00050 / BCUS98147 | 01.00 |
| God of War: Ascension | BCUS98232 | v01.00 av01.12 |
| Grand Theft Auto IV | BLUS30127 | v01.00 av01.08 |
| Hatsune Miku: Project DIVA F | BLUS31319 | 01.00 |
| Hatsune Miku: Project DIVA F 2nd | BLUS31431 | 01.00 |
| Just Cause 2 | BLES00517 / BLUS30400 | 01.02 |
| Kingdom Hearts HD 1.5 ReMIX | BLUS31212 | 01.00 |
| Kingdom Hearts HD 2.5 ReMIX | BLUS31460 | 01.00 |
| Kingdoms of Amalur: Reckoning | BLUS30710 | v01.02 |
| Lost Dimension | BLUS31554 | v01.00 |
| Lost Planet 2 | MRTC00002 | v01.02 |
| Lost Planet 3 | BLUS31020 | v01.02 |
| Metal Gear Solid 4: Guns of the Patriots | BLUS30109 | — |
| MotorStorm | BCUS98137 | v01.00 |
| Need for Speed: Rivals | BLUS31201 | 01.03 |
| Pirates of the Caribbean: At World's End | BLUS30029 | v01.00 |
| Resident Evil 5 | BLUS30270 | v02.00 |
| Resistance 2 | BLUS98120 | 01.60 |
| Resistance 3 | BCUS98176 | 01.05 |
| Shadow of the Colossus (HD) | BCES01097 | 01.01 |
| Shadow of the Colossus (HD) | BCES01097 / BCES01115 / BCUS98259 / NPEA00280 | v01.00 av01.01 |
| Silent Hill: Downpour | BLUS30565 | 01.01 |
| Silent Hill: Homecoming | BLUS30169 | 01.00 |
| Skate 2 | BLUS30253 | v01.02 |
| Skate 3 | BLUS30464 | v01.05 |
| The Elder Scrolls IV: Oblivion GOTY | BLUS30087 | 01.00 |
| The Elder Scrolls V: Skyrim | BLUS30778 | v01.00 |
| The Elder Scrolls V: Skyrim Legendary Edition | BLUS31202 | 01.00 |
| The Last of Us | BCUS98174 / BCES01584 / BCES01585 / BCAS20270 | v01.11 |
| Tony Hawk's Project 8 | BLUS30011 | v01.00 |
| Tony Hawk's Proving Ground | BLUS30071 | v01.00 |
| Uncharted: Drake's Fortune | BCES00065 / BCUS98103 | 01.10 |
| Uncharted 2: Among Thieves | BCUS98213 | 01.09 |

---

## ✅ Confirmed on Real PS3 Hardware

Patches confirmed working on real PS3 hardware by community members. Sources: **Joey85** (PSXPlace thread #49905, Ghidra RE), **Nascar1243** ([PS3-FPS-Patches](https://github.com/Nascar1243/PS3-FPS-Patches) — 3 weeks of real-hardware testing), **FlexBy**, **vFxMz**, **illusion**, **NunoRS2000**, **Brolijah**, **Zolika1351**, and others.

All entries are in `USERLIST/` with `(PSXPlace)` in the cheat name and `[Tested]` suffix.

| Game | Title ID | Version | Patch | Author | Notes |
|------|----------|---------|-------|--------|-------|
| Alice: Madness Returns | BLES01265 | 01.00 | Unlock FPS | FlexBy | EU disc |
| Alice: Madness Returns | NPEB00625 | 01.00 | Unlock FPS | FlexBy | EU PSN |
| Alice: Madness Returns | BLUS30607 | 01.00 | Unlock FPS | Joey85 | US disc; no OC required |
| Alien Rage | NPEB01088 | 01.00 | Unlock FPS | Joey85 | EU PSN |
| Aliens: Colonial Marines | BLES01455 / BLUS30862 | 01.05 | Unlock FPS | Joey85 | |
| Alpha Protocol | BLUS30341 | 01.00 | Unlock FPS | Joey85 | US version |
| Asura's Wrath | BLUS30721 | 01.02 | Unlock FPS | Joey85 | |
| Batman: Arkham Asylum GOTY | BLUS30515 | 01.00 | Debug Menu | Joey85 | R1+Start in-game → disable VSync |
| Batman: Arkham City GOTY | BLES01587 | v02.00 | Debug Menu | Joey85 | R1+Start in-game → disable VSync |
| Batman: Arkham Origins | BLUS31147 | 01.60 | Debug Menu | Joey85 | R1+Start in-game → disable VSync |
| Borderlands 2 | BLES01684 | 01.02 | Unlock FPS | FlexBy | EU disc; tested on v1.15 |
| Borderlands 2 | BLUS30982 / BLES01684 / NPUB30898 | 01.15 | Unlock FPS | FlexBy | US+EU disc + US PSN |
| Borderlands 2 | NPEB01144 | 01.00 | Unlock FPS | FlexBy | EU PSN |
| Brutal Legend | BLES00562 / BLUS30330 | 01.02 | Unlock FPS | Joey85 / Nascar1243 | Apply from main menu; press Start in-game to activate |
| Bulletstorm | BLES01134 | 01.03 | Unlock FPS | Joey85 | EU disc; max 62fps (UE3 engine cap) |
| Call of Duty 4: Modern Warfare | BLES00148 / BLJS10013 | 01.00 | Unlock FPS | community | Capped at 60Hz vsync |
| Call of Duty: Black Ops | BLES01031 / BLES01032 | 01.13 | Unlock FPS | community | |
| Call of Duty: Black Ops | BLES01031 / BLES01032 / BLUS30591 | 01.00 | Unlock FPS | community | |
| Castle Crashers | NPEB00293 | 01.00 | 60 FPS | FlexBy | EU PSN; confirmed in intro |
| Castle of Illusion | NPUB31099 | 01.00 | Unlock FPS | Joey85 | US PSN |
| Dead Space 2 | BLES01040 / BLUS30717 | 01.02 | Unlock FPS | Joey85 / Nascar1243 | EU + US disc |
| Dead Space 3 | BLES01733 / BLUS31053 | 01.02 | Unlock FPS | Joey85 | |
| Deadpool | BLES01789 / BLUS31146 | 01.00 | Unlock FPS | Joey85 / Nascar1243 | Use 2-address version (7ED630: 41→60, 7b1fa7: →01); full 8-address version may crash |
| Deus Ex: HR Director's Cut | BLUS31317 | 01.00 | Unlock FPS | Joey85 | |
| Dragon Ball Z: Burst Limit | BLES00231 | 01.00 | 60 FPS | illusion | EU disc; be32 lines only |
| Duke Nukem Forever | BLES01147 | 01.03 | Unlock FPS | Joey85 | No OC required |
| Enslaved: Odyssey to the West | BLES00989 | 01.01 | Unlock FPS | Joey85 | v1.01 specific |
| Fallout 3 GOTY | BLUS30451 | 01.00 | Unlock FPS | Joey85 | US version |
| Fallout: New Vegas | BLUS30888 | 01.00 | Unlock FPS | FlexBy / Joey85 | US version |
| Grand Theft Auto IV | BLES00229 / BLES00258 | av01.08 | Unlock FPS | Zolika1351/illusion | EU disc |
| Grand Theft Auto IV Complete Edition | BLES01128 | 01.00 | Unlock FPS | Zolika1351/illusion | EU disc |
| Grand Theft Auto IV | NPEB00882 | 01.09 | Unlock FPS | Zolika1351/illusion | EU PSN |
| Harry Potter: Order of the Phoenix | BLES00070 | 01.01 | 60 FPS | NunoRS2000 | Confirmed PS3 + RPCS3 |
| Hatsune Miku: Project DIVA F 2nd | NPEB02013 | 01.00 | 60 FPS | Brolijah | EU PSN; partially confirmed |
| Haze | BLES00157 / BLES00169 / BLUS30094 | av01.36 | Unlock FPS | Joey85 / Nascar1243 | EU + US disc |
| Homefront | BLES00962 | 01.04 | Unlock FPS | Joey85 | |
| I Am Alive | NPUB30383 | 01.00 | Unlock FPS | Joey85 | US PSN |
| James Cameron's Avatar: The Game | BLUS30374 | 01.00 | Unlock FPS | Joey85 | |
| Just Cause 2 | NPUB30606 | 01.02 | Unlock FPS | illusion | US PSN version |
| Killer Is Dead | BCAS20292 | 01.00 | Unlock FPS | FlexBy / Joey85 | Asian version |
| Killzone 2 | BCES00081 / BCUS98116 | 01.29 | Unlock FPS | Joey85 | Direct FPS unlock |
| Killzone 2 | BCES00081 / BCUS98116 | 01.29 | Extended FOV | vFxMz | 0.65× FOV multiplier; different address |
| Killzone 3 | BCES01007 / BCUS98234 | 01.14 | Extended FOV | vFxMz | Two addresses |
| Lollipop Chainsaw | BLES01525 / BLUS30917 | 01.00 | Unlock FPS | Joey85 / Nascar1243 | Max 58fps (UE3 engine cap); US: address 8F890B → 01 |
| Lost Dimension | BLES02197 / BLUS31554 / BLJM61166 | 01.02 | 60 FPS | FlexBy | EU/US/JP; confirmed on stock PS3 |
| Lost Dimension | BLJM61166 | 01.01 | 60 FPS | FlexBy | JP v1.00 addresses |
| Lost Planet 2 | MRTC00002 | 01.01 | Unlock FPS | community | ⚠️ Tested on v1.02, file is v1.01 |
| Metal Gear Solid 4 | BLES00246 | 02.00 | Unlock FPS | Joey85 | EU version |
| Mindjack | MRTC00014 | 01.01 | Unlock FPS | Joey85 | |
| Mirror's Edge | BLES00322 / BLUS30179 | 01.01 | Unlock FPS | Joey85 / Nascar1243 | EU + US disc; no OC required |
| Prince of Persia Trilogy 3D | BLUS30754 | 01.00 | Unlock FPS | Joey85 | Two Thrones + Warrior Within in one file |
| Prototype 2 | BLES01532 / BLUS30756 | 01.00 | Unlock FPS | Joey85 | |
| Ratchet & Clank: All 4 One | BCUS98175 | 01.03 | Unlock FPS | Joey85 | ⚠️ Must apply from main menu only; results vary by dump |
| Ratchet & Clank: Into the Nexus | BCES01908 / BCUS99245 | 01.01 | Unlock FPS | Joey85 / Nascar1243 | Apply from main menu; single address 69a553 → 01 sufficient |
| Remember Me | BLES01701 | 01.00 | Unlock FPS | Joey85 | |
| Resident Evil (HD Remaster) | NPEB02076 / NPJB00653 / NPUB31552 | v01.00 | Unlock FPS | Joey85 | EU/JP/US PSN |
| Resident Evil 5 Gold Edition | BLES00816 | 01.01 | Unlock FPS | community / Joey85 | EU disc |
| Resident Evil 6 | BLUS30855 | 01.06 | Unlock FPS | Joey85 | |
| Resident Evil: Revelations 2 | BLUS31444 | 01.04 | Unlock FPS | Joey85 | |
| Resident Evil: The Darkside Chronicles | NPEB00816 / NPUB30648 | v01.00 | Unlock FPS | Joey85 | |
| Resident Evil: The Umbrella Chronicles | NPEB00817 / NPUB30650 | v01.00 | Unlock FPS | Joey85 | |
| Resistance 3 | BCES01118 | 01.00 / 01.05 | Unlock FPS | community / Joey85 | EU disc; two confirmed versions |
| SAW | BLES00676 | 01.00 | Unlock FPS | Joey85 | |
| SAW 2 | BLES01050 | 01.00 | Unlock FPS | Joey85 | |
| Shadows of the Damned | BLES01276 | 01.00 | Unlock FPS | Joey85 | 5 addresses |
| Silent Hill: Homecoming | BLES00460 | 01.00 | Unlock FPS | Joey85 | EU version |
| Siren: Blood Curse | BCES00294 | 01.00 | Unlock FPS | Joey85 | |
| Skyrim Legendary Edition | BLES01886 | — | 60 FPS | community | EU version |
| Sleeping Dogs | BLUS30927 | 01.04 | Unlock FPS | Joey85 | Apply patch BEFORE loading game |
| Sonic Unleashed | BLUS30244 | 01.02 | Disable Shadows/Blur/DoF/Reflection | illusion | Confirmed by Mitsu on real HW |
| Splinter Cell: Blacklist | BLES01879 | 01.03 | Unlock FPS | Joey85 | |
| The Bureau: XCOM Declassified | BLUS30780 | 01.02 | Unlock FPS | Joey85 | |
| The Elder Scrolls IV: Oblivion GOTY | BLES00163 | — | 60 FPS | community | EU version; 20-60 FPS depending on scene |
| The Orange Box | BLES00153 / BLUS30055 | av01.10 | Unlock FPS | community / Joey85 | HL2 + Portal confirmed; HL2 Episodes may not work for all users |
| Transformers: War for Cybertron | BLES00833 / BLUS30357 | 01.01 | Unlock FPS | Joey85 | |
| Warhammer 40,000: Space Marine | BLES01347 | 01.05 | Unlock FPS | Joey85 | |
| Wheelman | BLUS30262 | 01.01 | Unlock FPS | Joey85 | |

---

## 🔵 RPCS3 Conversions — Not Yet Hardware-Verified

Converted from the official RPCS3 patch.yml. All write `0x60000000` (NOP) to disable the frame limiter — same instruction that runs on real Cell hardware. High confidence but not all tested.

> ⚠️ May crash or behave unexpectedly on real PS3. Test carefully. Patches labeled `v01.XX (RPCS3)` target a different game version than your file — especially risky.

### Action / Adventure

| Game | File | Patch | Notes |
|------|------|-------|-------|
| 3D Dot Game Heroes | `BLES00875 / BLJM60180 / BLUS30490 01.00` | 60 FPS | |
| Alpha Protocol | `BLES00704 v01.00` | Unlock FPS | ⚠️ 9-digit source address, capped to 32-bit; EU version |
| Anarchy Reigns | `BLES01232` | Unlock FPS | |
| Bulletstorm | `NPEB00622 01.00` | Unlock FPS | EU PSN (Joey confirmed disc BLES01134) |
| Dark Souls | `BLES01402 01.00` | Unlock FPS | ⚠️ May affect gameplay speed |
| Dragon's Dogma | `BLES01356 01.00` | Unlock FPS | |
| Dragon's Dogma: Dark Arisen | `BLES01794 01.00` / `NPUB31117 01.00` | Unlock FPS | |
| Genji: Days of the Blade | `BCES00002 01.00` | 60 FPS | |
| Legendary | `BLES00405 01.00` | Unlock FPS | |
| Lollipop Chainsaw | `BLJS10125 01.00` | Unlock FPS | JP version (EU BLES01525 + US BLUS30917 confirmed in ✅ section) |
| Lucha Libre AAA | `BLUS30640 01.00` | Unlock FPS | |
| Lucha Libre AAA | `BLUS30640 01.01` | Unlock FPS | |
| Mass Effect 2 | `BLES01133 v01.01` / `BLUS30650 v01.00` | Unlock FPS | |
| Metal Gear Solid 4 | `BLJM67001 02.00` | Unlock FPS | JP version (EU BLES00246 confirmed by Joey85) |
| NeverDead | `BLES01303 / BLUS30654 01.00` | Unlock FPS | |
| Nier | `BLES00826 / BLUS30481 v01.01` | Unlock FPS | |
| Papo & Yo | `NPEB01109 01.00` | Unlock FPS | EU PSN |
| Shadows of the Damned | `BLUS30653 01.00` | Unlock FPS | US version (EU BLES01276 confirmed by Joey85) |
| Splatterhouse | `BLES01120 01.00` | Unlock FPS | |
| Stranglehold | `BLES00144 01.20` | Unlock FPS | |
| Warp | `NPEB00636 01.00` | Unlock FPS | EU PSN |
| Warp | `NPUB30543 01.00` | Unlock FPS | US PSN |
| WRC Powerslide | `NPEB01324 01.01` | Unlock FPS | EU PSN; by Jao |
| Zeno Clash 2 | `NPEB01351 01.00` | Unlock FPS | EU PSN; 3 addresses |

### FPS / Shooters

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Army of Two | `BLES00168 / BLUS30057` | Unlock FPS | |
| Army of Two: The 40th Day | `BLES00659 01.00` / `BLES00659 01.02` | Unlock FPS | |
| Army of Two: The Devil's Cartel | `BLES01763 / BLUS31069 01.01` | Unlock FPS | |
| Call of Duty: World at War | `BLES00354 / BLES00357` | Unlock FPS | |
| Killzone (HD) | `NPEA00418 01.00` | Unlock FPS | PSN version |
| Resistance 2 | `BCAS20055 01.00` | Unlock FPS | Asian version (US BLUS98120 in ✅✅) |
| Resistance: Fall of Man | `BCES00001 / BCUS98107` | Unlock FPS | |
| SOCOM 4 | `BCAS20121 / BCES00938 / BCJS30052 / BCUS98135 01.00` | Unlock FPS | |

### RPG / Open World

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Demon's Souls | `BLES00932 01.00` | Unlock FPS | EU; be16 write |
| Demon's Souls | `BLUS30443 01.00` | Unlock FPS | US; be16 write |
| Persona 5 | `BLUS31604 01.00` | Unlock FPS | ⚠️ Experimental |
| Red Dead Redemption GOTY | `BLES01294 01.00` | Unlock FPS | Sets frametime to 1000ms → uncapped |
| Time and Eternity | `BLES01848` | Unlock FPS | |

### Racing

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Gran Turismo 5 | `BCES00569 / BCUS98114 01.00` | Unlock FPS | |
| MotorStorm: Apocalypse | `BCES00484 01.00` | Unlock FPS | |
| Need for Speed: Rivals | `BLES01894 v01.00` | Unlock FPS | EU version (US BLUS31201 in ✅✅) |

### Horror

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Resident Evil (HD Remaster) | `BLJM61211 01.00` | Unlock FPS | JP disc (PSN versions confirmed by Joey85) |
| Resident Evil 0 | `NPEB02226 01.00` | Unlock FPS | |
| Resident Evil 5 Gold Edition | `BLUS30491 01.01` | Unlock FPS | US version (EU BLES00816 confirmed) |
| Resident Evil: Revelations | `BLES01773 01.01` / `BLUS31051 01.01` | Unlock FPS | |

---

## ⚠️ Known Issues / Do Not Use

| Game | Issue |
|------|-------|
| Grand Theft Auto V | ❌ Freezes during testing — do not use on real PS3 |
| MGS3 HD "50 FPS" | ❌ Reduces from native 60fps — not useful |
| JoJo's Bizarre Adventure: All Star Battle | ❌ Requires 120Hz Vblank — not possible on real PS3 hardware |
| Metal Gear Solid V: The Phantom Pain | Patches exist for RPCS3 but PS3 version behaves differently — not included |
| Lost Planet 2 `MRTC00002 01.01` | ⚠️ Community tested v1.02, file targets v1.01 — version mismatch, use carefully |
| Batman: Arkham Origins `BLUS31147 01.06` | ℹ️ Patch enables Debug Menu (not a direct FPS write); tested on v1.60, file is v1.06 |

---

## How to use

1. Copy the `.ncl` file for your game from `USERLIST/` to `hdd0/game/ARTZ00001/USRDIR/USERLIST/` on your PS3 via FTP
2. Launch Artemis, select your game, activate the patch
3. Launch the game, then press **PS + Start** to attach cheats

> **Vblank note:** "Unlock FPS" patches remove the frame limiter — actual FPS depends on your PS3 model and the game engine. RPCS3's Vblank frequency setting does NOT apply to real PS3 hardware.

> **Version mismatch:** Patches labeled `v01.XX (RPCS3)` were written for a different game version. They may still work, but test carefully.

---

## Contributing

Tested a patch on real PS3? Open an issue or PR with:
- Game name, Title ID, firmware version
- PS3 model (Fat / Slim / Super Slim)
- CFW version (HEN / Rebug / etc.)
- Result: ✅ works / ⚠️ partial / ❌ crashes

Sources: [PSXPlace game-patches thread](https://www.psx-place.com/threads/game-patches.43706/) · [PSXPlace FPS patches #49905 (Joey85)](https://www.psx-place.com/threads/60-unlock-fps-patches.49905/) · [Nascar1243/PS3-FPS-Patches](https://github.com/Nascar1243/PS3-FPS-Patches) · [RPCS3 patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml) · [Artemis PS3](https://github.com/bucanero/ArtemisPS3)
