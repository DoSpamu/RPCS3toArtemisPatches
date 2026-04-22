# FPS Unlock Patches — PS3MAPI / webMAN MOD Method

Apply these patches **live while the game is running**, without Artemis or file transfers.  
Source: *FPS Unlocking Finalized — wMM MAPI* (personal research document).

---

## How to use

1. Install **webMAN MOD** on your PS3
2. Start the game
3. Open a browser and go to your PS3's IP address (e.g. `http://192.168.1.100`)
4. Click the **PS3MAPI** tab
5. Find **Processes Commands** → enter the memory **Address** → press **Get**
6. Scroll to **Value** → change the byte(s) as listed below → press **Set**
7. The screen will flash — the change takes effect immediately

> **Persistent patches:** You can create per-title-ID scripts via webMAN to apply patches automatically at boot.

---

## Confirmed Patches

### The Last of Us
**BCUS98174 — v1.11**
| Address | Change | Effect |
|---------|--------|--------|
| `01571A6F` | `02` → `01` | 60 FPS |
| `01571A6F` | `02` → `00` | Uncapped |

---

### Grand Theft Auto IV
**BLUS30127 / BLUS03702 — v1.00 & v1.08**
| Address | Change | Effect |
|---------|--------|--------|
| `00F18830` | `3D` → `00` | Uncapped FPS |

---

### Uncharted 2: Among Thieves
**BCUS98213 — v1.09**
| Address | Change | Effect |
|---------|--------|--------|
| `00E9C1FB` | `02` → `01` | 60 FPS |
| `00E9C1FB` | `02` → `00` | Uncapped |

---

### Uncharted: Drake's Fortune
**BCUS98103 — v1.10**
| Address | Change | Effect |
|---------|--------|--------|
| `00BB4352` | `02` → `00` | Uncapped |
| `00BB4352` | `02` → `01` | 60 FPS |

---

### Final Fantasy XIII
**MRTC00003**
| Address | Change | Effect |
|---------|--------|--------|
| `008D2E94` | set to `38800001` | Unlock FPS |

> Note: Maintains 60 FPS in combat and most areas. Locks at 30 in open areas (Chapter 11).

---

### The Elder Scrolls V: Skyrim / Legendary Edition
**BLUS30778 / BLUS31202**
| Address | Change | Effect |
|---------|--------|--------|
| `008EDB64` | `F8 65` → `F8 05` | 60 FPS |

---

### Skate 3
**BLUS30464 — v1.05**
| Address | Change | Effect |
|---------|--------|--------|
| `0094713A` | `06` → `00` | 60 FPS |

---

### Fallout 3
**BLUS30185 — v1.61**
| Address | Change | Effect |
|---------|--------|--------|
| `00702BAC` | `F8 64` → `F8 04` | 60 FPS |

---

### Just Cause 2
**BLUS30400 — v1.02**
| Address | Change | Effect |
|---------|--------|--------|
| `0035D3E4` | `78 03` → `78 00` | 60 FPS |

---

### Need for Speed: Rivals
**BLUS31201 — v1.00**
| Address | Change | Effect |
|---------|--------|--------|
| `01841D08` | `3F A1` → `3F 91` | 60 FPS cap |
| `01841D00` | `40 3D` → `40 4E` | Game speed fix (apply together with above) |

---

### The Elder Scrolls IV: Oblivion GOTY
**BLUS30087 — v1.00**
| Address | Change | Effect |
|---------|--------|--------|
| `00AAED04` | `40` → `60` | 60 FPS |

---

### Folklore
**BCUS98147 — v1.10**
| Address | Change | Effect |
|---------|--------|--------|
| `001823C0` | `40` → `60` | 60 FPS |

---

### Metal Gear Solid 4: Guns of the Patriots
**BLUS30109**
| Address | Change | Effect |
|---------|--------|--------|
| `000DB720` | `FB C1 FF F0` → `4E 80 00 20` | 60 FPS |

---

### Skate 2
**BLUS30253 — v1.02**
| Address | Change | Effect |
|---------|--------|--------|
| `0046383F` | `02` → `01` | 60 FPS (cutscenes only) |

---

### Tony Hawk's Project 8
**BLUS30011**
| Address | Change | Effect |
|---------|--------|--------|
| `0056658C` | `41` → `60` | 60 FPS |

---

### Tony Hawk's Proving Ground
**BLUS30071**
| Address | Change | Effect |
|---------|--------|--------|
| `00606138` | `41` → `60` | 60 FPS |

---

### Dragon Ball Z: Burst Limit
**BLUS30117**
| Address | Change | Effect |
|---------|--------|--------|
| `004C4383` | `02` → `01` | 60 FPS (cutscenes only) |
| `001633E8` | `80 1C` → `60 00` | Fix pause glitch (apply together) |

---

### Pirates of the Caribbean: At World's End
**BLUS30029**
| Address | Change | Effect |
|---------|--------|--------|
| `00889063` | `02` → `01` | 60 FPS (cutscenes only) |

---

### Hatsune Miku: Project DIVA F 2nd
**BLUS31431**

All 4 addresses required:
| Address | Change | Effect |
|---------|--------|--------|
| `006AF44E` | `00 02` → `00 01` | Part 1/4 |
| `006AF46E` | `00 02` → `00 01` | Part 2/4 |
| `006AF492` | `00 02` → `00 01` | Part 3/4 |
| `006AF4B6` | `00 02` → `00 01` | Part 4/4 — enables 60 FPS; breaks video playback but still playable |

---

### Hatsune Miku: Project DIVA F
**BLUS31319**

All 4 addresses required:
| Address | Change | Effect |
|---------|--------|--------|
| `00589496` | `00 02` → `00 01` | Part 1/4 |
| `005894BA` | `00 02` → `00 01` | Part 2/4 |
| `00589802` | `00 02` → `00 01` | Part 3/4 |
| `0058982A` | `00 02` → `00 01` | Part 4/4 — enables 60 FPS; breaks video playback but still playable |

---

### Kingdom Hearts HD 2.5 ReMIX (Birth by Sleep)
**BLUS31460**
| Address | Change | Effect |
|---------|--------|--------|
| `000015AA4` | `80 63 75 10` → `38 60 00 00` | 60 FPS (confirmed) |
| `000076859` | set to `38 60 00 00` | 60 FPS (untested) |

---

### Fallout: New Vegas Ultimate Edition
**BLUS30888**
| Address | Change | Effect |
|---------|--------|--------|
| `0097504C` | `41` → `60` | 60 FPS |

---

### Kingdoms of Amalur: Reckoning
**BLUS30710 — v1.02**
| Address | Change | Effect |
|---------|--------|--------|
| `001242F8` | `48 9C` → `60 00` | 60 FPS |

---

### Kingdom Hearts HD 1.5 ReMIX (Chain of Memories)
**BLUS31212**
| Address | Change | Effect |
|---------|--------|--------|
| `00012484` | `80 84 7C 48` → `38 80 00 00` | 60 FPS (confirmed) |
| `00036870` | set to `38 80 00 00` | 60 FPS (untested) |

---

### Lost Dimension
**BLUS31554**
| Address | Change | Effect |
|---------|--------|--------|
| `00170CC8` | `41` → `60` | 60 FPS |

---

### Lost Planet 2
**MRTC00002 — v1.02**

Both addresses required:
| Address | Change | Effect |
|---------|--------|--------|
| `013DC518` | `44 00 00 02` → `60 00 00 00` | Part 1/2 |
| `013DC524` | `41 9D` → `60 00` | Part 2/2 — enables 60 FPS |

---

### Lost Planet 3
**BLUS31020 — v1.02**
| Address | Change | Effect |
|---------|--------|--------|
| `002FF5F0` | set to `60 00 00 00` | 60 FPS (untested) |

---

### Resident Evil 5
**BLUS30270 — v2.00**
| Address | Change | Effect |
|---------|--------|--------|
| `00C27970` | `41` → `60` | 60 FPS |

---

### Resistance 2
**BLUS98120 — v1.60**
| Address | Change | Effect |
|---------|--------|--------|
| `0065066C` | `40 9C` → `48 00` | 60 FPS |

---

### Resistance 3
**BLUS98176 — v1.05**
| Address | Change | Effect |
|---------|--------|--------|
| `0075FA54` | `41 81` → `60 00` | 60 FPS |

---

### Destroy All Humans! Path of the Furon
**BLES00467**
| Address | Change | Effect |
|---------|--------|--------|
| `010B9E68` | `41 80` → `60 00` | 60 FPS |

---

### MotorStorm
**BCUS98137**
| Address | Change | Effect |
|---------|--------|--------|
| `0075C864` | `81 0A 00 18` → `39 00 00 01` | 60 FPS |

---

### Silent Hill: Homecoming
**BLUS30169**
| Address | Change | Effect |
|---------|--------|--------|
| `0005A36C` | any → `38 00 00 01` | 60 FPS |

---

### Silent Hill: Downpour
**BLUS30565 — v1.01**
| Address | Change | Effect |
|---------|--------|--------|
| `002A1250` | any → `60 00 00 00` | 60 FPS (untested) |

---

### The Orange Box
| Address | Change | Effect |
|---------|--------|--------|
| `00C477F4` | any → `60 00 00 00` | Unlock FPS (HL2) |
| `01153C4C` | any → `60 00 00 00` | Unlock FPS (Episode 1/2) |
| `003A373C` | any → `60 00 00 00` | Unlock FPS (Portal) |
| `009170D4` | any → `60 00 00 00` | Unlock FPS (additional) |

---

## Notes

- Addresses shown with leading zeros padded to 8 digits (PS3MAPI format)
- Multi-byte values shown as space-separated hex bytes in memory order
- "Untested" entries are from the research document — they may work but haven't been verified on real hardware
- Values marked `any` mean the current value doesn't matter; write the target value directly
- Changes are **not persistent** — they reset on game restart unless you set up a webMAN boot script

---

## Related

- [Working Artemis Patches/](Working%20Artemis%20Patches/) — same games as above, as ready-to-use .ncl files for Artemis
- [COMMUNITY_TESTED.md](COMMUNITY_TESTED.md) — full community test results including EU/JP versions
