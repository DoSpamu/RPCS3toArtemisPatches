# Skipped Patches — Reasons & Explanation

This file documents every case where an RPCS3 patch could **not** be automatically inserted into an Artemis `.ncl` file, and explains why.

---

## Summary

| Reason | Count |
|--------|-------|
| No matching `.ncl` file in USERLIST | 450 unique Title IDs |
| Game version mismatch (safe mode only) | included in `USERLIST_RISKY/` instead |
| Unsupported patch instruction type (`byte`, `bef64`, `be64`) | skipped silently during conversion |

---

## Reason 1 — No matching `.ncl` file in USERLIST (450 Title IDs)

### What this means

The RPCS3 `patch.yml` contains a patch for this Title ID, but there is no `.ncl` file for this game in the Artemis USERLIST (sourced from [bucanero/ArtemisPS3](https://github.com/bucanero/ArtemisPS3)).

This can happen for several reasons:
- The game was never added to the ArtemisPS3 USERLIST (most common — Artemis USERLIST does not cover every PS3 game)
- The game exists in USERLIST under a different Title ID than what RPCS3 uses (e.g., USERLIST has `BLUS30443` but RPCS3 patch targets `NPUA80xxx`)
- The game is a PSN-only title or a regional variant with no separate cheat file

### What you can do

If your game is in this list, you can still use the patch manually:
1. Find your game's patch in `patch.yml` (search by Title ID)
2. Copy the `be32`/`be16` lines from the `Patch:` block
3. Create a new `.ncl` file or add to an existing one using the format:
   ```
   Patch Name (RPCS3)
   0
   RPCS3
   0 AABBCCDD 60000000
   #
   ```
4. Transfer it to your PS3 via FTP into `hdd0/game/ARTZ00001/USRDIR/USERLIST/`

---

## Reason 2 — Game version mismatch

The converter in **safe mode** (`node convert.js`) only adds a patch if the game version in `patch.yml` exactly matches the version in the `.ncl` filename (e.g., `01.00`).

If the versions do not match, the patch is skipped in `USERLIST/` but **is included** in `USERLIST_RISKY/` with a version suffix in the name (e.g., `Unlock FPS v01.04 (RPCS3)`), so you know which version it was written for.

---

## Reason 3 — Unsupported patch instruction types

Some RPCS3 patches use instruction types that have no direct equivalent in Artemis format and are silently skipped:

| RPCS3 type | Why skipped |
|------------|-------------|
| `byte` | 8-bit writes have no standard single-byte Artemis code type |
| `bef64` | 64-bit float — Artemis operates on 32-bit words |
| `be64` | 64-bit integer — same reason as above |

If a patch consists **only** of these types, the entire patch entry produces no output and nothing is written to the `.ncl` file.

---

## Full list — Title IDs with no matching `.ncl`

These 450 Title IDs have an FPS patch in RPCS3 but no corresponding Artemis file was found in USERLIST.

| Title ID | Patch |
|----------|-------|
| BCAS20003 | Unlock FPS |
| BCAS20015 | 60 FPS |
| BCAS20044 | 60 FPS |
| BCAS20044 | 60 FPS |
| BCAS20281 | 60 FPS |
| BCAS20311 | Unlock FPS |
| BCAS25009 | Unlock FPS |
| BCED01448 | Unlock FPS |
| BCES00005 | 60 FPS |
| BCES00006 | Unlock FPS |
| BCES00006 | Unlock FPS |
| BCES00008 | 60 FPS |
| BCES00129 | 60 FPS |
| BCES00129 | 60 FPS |
| BCES00226 | Unlock FPS |
| BCES00226 | Unlock FPS |
| BCES00511 | Unlock FPS |
| BCES00511 | Unlock FPS |
| BCES00727 | 60 FPS |
| BCES00727 | Unlock FPS |
| BCES00727 | 60 FPS |
| BCES00727 | Unlock FPS |
| BCES00748 | Unlock FPS |
| BCES00748 | Unlock FPS |
| BCES01142 | Unlock FPS |
| BCES01176 | Unlock FPS |
| BCES01176 | Unlock FPS |
| BCES01692 | Unlock FPS |
| BCES01692 | Unlock FPS |
| BCES01742 | Unlock FPS |
| BCES01743 | 60 FPS |
| BCES01949 | Unlock FPS |
| BCES01949 | Unlock FPS |
| BCJS30001 | Unlock FPS |
| BCJS30019 | Unlock FPS |
| BCJS30027 | 60 FPS |
| BCJS30027 | 60 FPS |
| BCJS30078 | 60 FPS |
| BCJS37004 | Unlock FPS |
| BCJS37008 | Unlock FPS |
| BCJS37010 | Unlock FPS |
| BCJS37010 | Unlock FPS |
| BCKS10018 | Unlock FPS |
| BCUS98117 | 60 FPS |
| BCUS98123 | 60 FPS |
| BCUS98123 | Unlock FPS |
| BCUS98123 | 60 FPS |
| BCUS98123 | Unlock FPS |
| BCUS98137 | Unlock FPS |
| BCUS98137 | Unlock FPS |
| BCUS98142 | 60 FPS |
| BCUS98227 | 60 FPS |
| BCUS98233 | Unlock FPS |
| BCUS98233 | Unlock FPS |
| BCUS98233 | Unlock FPS |
| BCUS99086 | Unlock FPS |
| BHPE00000 | Unlock FPS |
| BLAS50546 | 60 FPS |
| BLAS50546 | 60 FPS |
| BLAS50723 | 60 FPS |
| BLES00014 | Unlock FPS |
| BLES00043 | 60 FPS |
| BLES00045 | 60 FPS |
| BLES00046 | 60 FPS |
| BLES00047 | 60 FPS |
| BLES00048 | Unlock FPS |
| BLES00066 | 60 FPS |
| BLES00130 | Unlock FPS |
| BLES00145 | Unlock FPS |
| BLES00146 | 60 FPS |
| BLES00149 | Unlock FPS |
| BLES00149 | Unlock FPS |
| BLES00149 | Unlock FPS |
| BLES00154 | Unlock FPS |
| BLES00154 | Unlock FPS |
| BLES00154 | Unlock FPS |
| BLES00155 | Unlock FPS |
| BLES00155 | Unlock FPS |
| BLES00155 | Unlock FPS |
| BLES00156 | Unlock FPS |
| BLES00156 | Unlock FPS |
| BLES00156 | Unlock FPS |
| BLES00200 | Unlock FPS |
| BLES00259 | 60 FPS |
| BLES00307 | 60 FPS |
| BLES00322 | Unlock FPS |
| BLES00333 | 60 FPS |
| BLES00334 | 60 FPS |
| BLES00335 | 60 FPS |
| BLES00335 | 60 FPS |
| BLES00336 | 60 FPS |
| BLES00337 | 60 FPS |
| BLES00355 | Unlock FPS |
| BLES00355 | Unlock FPS |
| BLES00398 | 60 FPS |
| BLES00399 | 60 FPS |
| BLES00404 | Unlock FPS |
| BLES00404 | Unlock FPS |
| BLES00424 | 60 FPS |
| BLES00457 | Unlock FPS |
| BLES00457 | Unlock FPS |
| BLES00457 | Unlock FPS |
| BLES00457 | Unlock FPS |
| BLES00461 | 60 FPS |
| BLES00461 | 60 FPS |
| BLES00467 | Unlock FPS |
| BLES00526 | Unlock FPS |
| BLES00582 | Unlock FPS |
| BLES00584 | Unlock FPS |
| BLES00676 | Unlock FPS |
| BLES00695 | 60 FPS |
| BLES00696 | Unlock FPS |
| BLES00697 | Unlock FPS |
| BLES00697 | Unlock FPS |
| BLES00698 | Unlock FPS |
| BLES00698 | Unlock FPS |
| BLES00737 | 60 FPS |
| BLES00760 | 60 FPS |
| BLES00773 | 60 FPS |
| BLES00779 | 60 FPS |
| BLES00901 | 60 FPS |
| BLES00901 | 60 FPS |
| BLES00902 | 60 FPS |
| BLES00902 | 60 FPS |
| BLES00903 | 60 FPS |
| BLES00903 | 60 FPS |
| BLES00904 | 60 FPS |
| BLES00904 | 60 FPS |
| BLES00905 | 60 FPS |
| BLES00905 | 60 FPS |
| BLES01033 | Unlock FPS |
| BLES01034 | Unlock FPS |
| BLES01035 | Unlock FPS |
| BLES01039 | Unlock FPS |
| BLES01050 | Unlock FPS |
| BLES01057 | 60 FPS |
| BLES01057 | 60 FPS |
| BLES01105 | Unlock FPS |
| BLES01227 | Unlock FPS |
| BLES01227 | Unlock FPS |
| BLES01329 | 60 FPS |
| BLES01329 | 60 FPS |
| BLES01329 | 60 FPS |
| BLES01330 | 60 FPS |
| BLES01330 | 60 FPS |
| BLES01685 | Unlock FPS |
| BLES01685 | Unlock FPS |
| BLES01685 | Unlock FPS |
| BLES01885 | 60 FPS |
| BLES02029 | 60 FPS |
| BLES02247 | 60 FPS |
| BLJM60028 | 60 FPS |
| BLJM60030 | Unlock FPS |
| BLJM60032 | Unlock FPS |
| BLJM60034 | 60 FPS |
| BLJM60071 | 60 FPS |
| BLJM60104 | Unlock FPS |
| BLJM60197 | 60 FPS |
| BLJM60232 | 60 FPS |
| BLJM60265 | Unlock FPS |
| BLJM60279 | Unlock FPS |
| BLJM60279 | Unlock FPS |
| BLJM60282 | 60 FPS |
| BLJM60296 | 60 FPS |
| BLJM60332 | Unlock FPS |
| BLJM60379 | Unlock FPS |
| BLJM60409 | Unlock FPS |
| BLJM60413 | 60 FPS |
| BLJM60427 | Unlock FPS |
| BLJM60490 | Unlock FPS |
| BLJM61163 | Unlock FPS |
| BLJS10034 | Unlock FPS |
| BLJS10034 | Unlock FPS |
| BLJS10040 | 60 FPS |
| BLJS10040 | 60 FPS |
| BLJS10068 | 60 FPS |
| BLJS10069 | 60 FPS |
| BLJS10181 | 60 FPS |
| BLJS10219 | Unlock FPS |
| BLJS10288 | Unlock FPS |
| BLJS10288 | Unlock FPS |
| BLKS20048 | Unlock FPS |
| BLKS20048 | Unlock FPS |
| BLKS20048 | Unlock FPS |
| BLKS20094 | Unlock FPS |
| BLKS20098 | Unlock FPS |
| BLKS20098 | Unlock FPS |
| BLUD80018 | Unlock FPS |
| BLUD80019 | Unlock FPS |
| BLUS30007 | Unlock FPS |
| BLUS30010 | Unlock FPS |
| BLUS30011 | Unlock FPS |
| BLUS30029 | 60 FPS |
| BLUS30065 | 60 FPS |
| BLUS30071 | Unlock FPS |
| BLUS30072 | Unlock FPS |
| BLUS30072 | Unlock FPS |
| BLUS30072 | Unlock FPS |
| BLUS30086 | Unlock FPS |
| BLUS30106 | Unlock FPS |
| BLUS30118 | 60 FPS |
| BLUS30121 | 60 FPS |
| BLUS30134 | 60 FPS |
| BLUS30153 | Unlock FPS |
| BLUS30179 | Unlock FPS |
| BLUS30185 | 60 FPS |
| BLUS30234 | 60 FPS |
| BLUS30242 | 60 FPS |
| BLUS30253 | 60 FPS |
| BLUS30253 | 60 FPS |
| BLUS30279 | Unlock FPS |
| BLUS30335 | 60 FPS |
| BLUS30371 | 60 FPS |
| BLUS30386 | Unlock FPS |
| BLUS30386 | Unlock FPS |
| BLUS30436 | Unlock FPS |
| BLUS30455 | Unlock FPS |
| BLUS30455 | 60 FPS |
| BLUS30458 | 60 FPS |
| BLUS30464 | 60 FPS |
| BLUS30500 | 60 FPS |
| BLUS30500 | 60 FPS |
| BLUS30500 | 60 FPS |
| BLUS30517 | 60 FPS |
| BLUS30608 | Unlock FPS |
| BLUS30626 | 60 FPS |
| BLUS30626 | 60 FPS |
| BLUS30627 | 60 FPS |
| BLUS30627 | 60 FPS |
| BLUS30632 | 60 FPS |
| BLUS30682 | Unlock FPS |
| BLUS30754 | Unlock FPS |
| BLUS30754 | Unlock FPS |
| BLUS30758 | Unlock FPS |
| BLUS30758 | Unlock FPS |
| BLUS30778 | 60 FPS |
| BLUS30849 | 60 FPS |
| BLUS31006 | 60 FPS |
| BLUS31076 | Unlock FPS |
| BLUS31173 | 60 FPS |
| BLUS31319 | 60 FPS |
| BLUS31405 | 60 FPS |
| NPEA00017 | 60 FPS |
| NPEA00088 | Unlock FPS |
| NPEA00095 | 60 FPS |
| NPEA00106 | Unlock FPS |
| NPEA00315 | Unlock FPS |
| NPEA00333 | Unlock FPS |
| NPEA00362 | 60 FPS |
| NPEA00363 | Unlock FPS |
| NPEA00364 | 60 FPS |
| NPEA00364 | Unlock FPS |
| NPEA00378 | Unlock FPS |
| NPEA00378 | Unlock FPS |
| NPEA00378 | Unlock FPS |
| NPEA00422 | Unlock FPS |
| NPEA00431 | Unlock FPS |
| NPEA00435 | Unlock FPS |
| NPEA00435 | Unlock FPS |
| NPEA00445 | Unlock FPS |
| NPEA00452 | Unlock FPS |
| NPEA00453 | Unlock FPS |
| NPEA00457 | Unlock FPS |
| NPEA00457 | Unlock FPS |
| NPEA00521 | Unlock FPS |
| NPEA80017 | Unlock FPS |
| NPEA90033 | 60 FPS |
| NPEA90055 | 60 FPS |
| NPEA90055 | Unlock FPS |
| NPEA90090 | Unlock FPS |
| NPEA90125 | 60 FPS |
| NPEB00052 | Unlock FPS |
| NPEB00075 | Unlock FPS |
| NPEB00098 | Unlock FPS |
| NPEB00098 | Unlock FPS |
| NPEB00316 | Unlock FPS |
| NPEB00365 | Unlock FPS |
| NPEB00385 | Unlock FPS |
| NPEB00458 | Unlock FPS |
| NPEB00458 | Unlock FPS |
| NPEB00459 | Unlock FPS |
| NPEB00459 | Unlock FPS |
| NPEB00503 | Unlock FPS |
| NPEB00505 | Unlock FPS |
| NPEB00557 | Unlock FPS |
| NPEB00652 | Unlock FPS |
| NPEB00652 | Unlock FPS |
| NPEB00723 | 60 FPS |
| NPEB00724 | 60 FPS |
| NPEB00730 | Unlock FPS |
| NPEB00740 | Unlock FPS |
| NPEB00740 | Unlock FPS |
| NPEB00751 | 60 FPS |
| NPEB00777 | Unlock FPS |
| NPEB00777 | Unlock FPS |
| NPEB00777 | Unlock FPS |
| NPEB00777 | Unlock FPS |
| NPEB00777 | Unlock FPS |
| NPEB00859 | Unlock FPS |
| NPEB00865 | Unlock FPS |
| NPEB00941 | Unlock FPS |
| NPEB01028 | Unlock FPS |
| NPEB01028 | Unlock FPS |
| NPEB01043 | Unlock FPS |
| NPEB01121 | 60 FPS |
| NPEB01156 | Unlock FPS |
| NPEB01216 | 60 FPS |
| NPEB01217 | 60 FPS |
| NPEB01220 | Unlock FPS |
| NPEB01224 | Unlock FPS |
| NPEB01224 | Unlock FPS |
| NPEB01243 | Unlock FPS |
| NPEB01246 | 60 FPS |
| NPEB01268 | Unlock FPS |
| NPEB01283 | 60 FPS |
| NPEB01283 | 60 FPS |
| NPEB01310 | 60 FPS |
| NPEB01318 | Unlock FPS |
| NPEB01318 | Unlock FPS |
| NPEB01370 | Unlock FPS |
| NPEB01374 | Unlock FPS |
| NPEB01376 | Unlock FPS |
| NPEB01390 | Unlock FPS |
| NPEB01393 | 60 FPS |
| NPEB01407 | Unlock FPS |
| NPEB01407 | Unlock FPS (No User Input) |
| NPEB01407 | Unlock FPS (For Delisted Ver) |
| NPEB01432 | Unlock FPS |
| NPEB01854 | Unlock FPS |
| NPEB01858 | 60 FPS |
| NPEB01861 | Unlock FPS |
| NPEB01861 | Unlock FPS |
| NPEB01932 | Unlock FPS |
| NPEB02061 | Unlock FPS |
| NPEB02061 | Unlock FPS |
| NPEB02182 | Unlock FPS |
| NPEB02197 | Unlock FPS |
| NPEB02319 | Unlock FPS |
| NPEB90073 | 60 FPS |
| NPEB90124 | Unlock FPS |
| NPEB90170 | Unlock FPS |
| NPEB90198 | Unlock FPS |
| NPEB90366 | Unlock FPS |
| NPEB90387 | Unlock FPS |
| NPEB90405 | Unlock FPS |
| NPEB90439 | Unlock FPS |
| NPEB90470 | 60 FPS |
| NPEB90478 | Unlock FPS |
| NPHA20002 | Unlock FPS |
| NPHA80190 | Unlock FPS |
| NPHA80193 | Unlock FPS |
| NPHA80194 | 60 FPS |
| NPHA80194 | Unlock FPS |
| NPHA80243 | Unlock FPS |
| NPHA80246 | Unlock FPS |
| NPHA80250 | 60 FPS |
| NPHA80258 | Unlock FPS |
| NPHB00520 | Unlock FPS |
| NPHB00671 | 60 FPS |
| NPJA00033 | Unlock FPS |
| NPJA00077 | Unlock FPS |
| NPJA00096 | Unlock FPS |
| NPJA00098 | 60 FPS |
| NPJB00240 | 60 FPS |
| NPJB00273 | Unlock FPS |
| NPJB00287 | 60 FPS |
| NPJB00302 | 60 FPS |
| NPJB00311 | Unlock FPS |
| NPJB00313 | Unlock FPS |
| NPJB00335 | Unlock FPS |
| NPJB00435 | 60 FPS |
| NPJB00435 | 60 FPS |
| NPJB00516 | 60 FPS |
| NPJB00516 | 60 FPS |
| NPJB00698 | Unlock FPS |
| NPJB00789 | Unlock FPS |
| NPJB90112 | 60 FPS |
| NPJB90221 | Unlock FPS |
| NPJB90524 | Unlock FPS |
| NPJB90581 | Unlock FPS |
| NPUA70183 | Unlock FPS |
| NPUA70192 | 60 FPS |
| NPUA70257 | Unlock FPS |
| NPUA80017 | Unlock FPS |
| NPUA80077 | 60 FPS |
| NPUA80079 | 60 FPS |
| NPUA80661 | Unlock FPS |
| NPUA80678 | Unlock FPS |
| NPUA80695 | Unlock FPS |
| NPUA80695 | Unlock FPS |
| NPUA80697 | Unlock FPS |
| NPUA80796 | Unlock FPS |
| NPUA80856 | 60 FPS |
| NPUA80858 | Unlock FPS |
| NPUA80908 | Unlock FPS |
| NPUA80908 | Unlock FPS |
| NPUA80918 | Unlock FPS |
| NPUA80959 | 60 FPS |
| NPUA80960 | Unlock FPS |
| NPUA80960 | Unlock FPS |
| NPUA80965 | Unlock FPS |
| NPUA80966 | Unlock FPS |
| NPUA81175 | Unlock FPS |
| NPUB30224 | Unlock FPS |
| NPUB30251 | Unlock FPS |
| NPUB30413 | Unlock FPS |
| NPUB30413 | Unlock FPS |
| NPUB30447 | Unlock FPS |
| NPUB30583 | 60 FPS |
| NPUB30588 | Unlock FPS |
| NPUB30588 | Unlock FPS |
| NPUB30643 | Unlock FPS |
| NPUB30643 | Unlock FPS |
| NPUB30643 | Unlock FPS |
| NPUB30702 | Unlock FPS |
| NPUB30710 | Unlock FPS |
| NPUB30732 | Unlock FPS |
| NPUB30751 | Unlock FPS |
| NPUB30799 | Unlock FPS |
| NPUB30838 | Unlock FPS |
| NPUB30892 | 60 FPS |
| NPUB30987 | 60 FPS |
| NPUB31069 | Unlock FPS |
| NPUB31071 | Unlock FPS |
| NPUB31071 | Unlock FPS |
| NPUB31096 | 60 FPS |
| NPUB31125 | Unlock FPS |
| NPUB31136 | 60 FPS |
| NPUB31154 | 60 FPS |
| NPUB31154 | 60 FPS |
| NPUB31188 | Unlock FPS |
| NPUB31241 | 60 FPS |
| NPUB31252 | 60 FPS |
| NPUB31342 | Unlock FPS |
| NPUB31389 | Unlock FPS |
| NPUB31391 | 60 FPS |
| NPUB31443 | 60 FPS |
| NPUB31488 | 60 FPS |
| NPUB31526 | Unlock FPS |
| NPUB31636 | Unlock FPS |
| NPUB31689 | Unlock FPS |
| NPUB31711 | 60 FPS |
| NPUB90070 | 60 FPS |
| NPUB90214 | Unlock FPS |
| NPUB90296 | Unlock FPS |
| NPUB90506 | Unlock FPS |
| NPUB90614 | Unlock FPS |
| NPUB90813 | Unlock FPS |
| NPUB90862 | 60 FPS |
| NPUB90869 | Unlock FPS |
