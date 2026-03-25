# Pominięte patche — przyczyny

Opisuje wszystkie przypadki gdzie patch RPCS3 nie mógł być dodany do pliku Artemis .ncl wraz z przyczyną.

---

## Podsumowanie

| Powód | Liczba |
|-------|--------|
| Brak pliku .ncl w USERLIST | 375 unikalnych Title ID |
| Niezgodnosc wersji gry | 129 plików .ncl |
| Typ instrukcji bez odpowiednika (bef64, byte) | linie wewnatrz patchy, patch dodany czesciowo |

---

## 1. Brak pliku .ncl w USERLIST (375 Title ID)

Te gry maja patch FPS w RPCS3, ale Artemis USERLIST nie zawiera dla nich zadnego pliku .ncl.
Bez istniejacego pliku bazowego nie tworzymy nowego — format cheatow moze byc specyficzny dla danej gry.

| Title ID | Patch |
|----------|-------|
| BCAS20003 | Unlock FPS |
| BCAS20015 | 60 FPS |
| BCAS20044 | 60 FPS |
| BCAS20281 | 60 FPS |
| BCAS20292 | Unlock FPS |
| BCAS20311 | Unlock FPS |
| BCAS25009 | Unlock FPS |
| BCED01448 | Unlock FPS |
| BCES00005 | 60 FPS |
| BCES00006 | Unlock FPS |
| BCES00008 | 60 FPS |
| BCES00129 | 60 FPS |
| BCES00226 | Unlock FPS |
| BCES00511 | Unlock FPS |
| BCES00727 | 60 FPS, Unlock FPS |
| BCES00748 | Unlock FPS |
| BCES01142 | Unlock FPS |
| BCES01176 | Unlock FPS |
| BCES01692 | Unlock FPS |
| BCES01742 | Unlock FPS |
| BCES01743 | 60 FPS |
| BCES01949 | Unlock FPS |
| BCJS30001 | Unlock FPS |
| BCJS30019 | Unlock FPS |
| BCJS30027 | 60 FPS |
| BCJS30078 | 60 FPS |
| BCJS37004 | Unlock FPS |
| BCJS37008 | Unlock FPS |
| BCJS37010 | Unlock FPS |
| BCKS10018 | Unlock FPS |
| BCUS98117 | 60 FPS |
| BCUS98123 | 60 FPS, Unlock FPS |
| BCUS98137 | Unlock FPS |
| BCUS98142 | 60 FPS |
| BCUS98227 | 60 FPS |
| BCUS98233 | Unlock FPS |
| BCUS99086 | Unlock FPS |
| BHPE00000 | Unlock FPS |
| BLAS50546 | 60 FPS |
| BLAS50723 | 60 FPS |
| BLES00014 | Unlock FPS |
| BLES00043 | 60 FPS |
| BLES00045 | 60 FPS |
| BLES00046 | 60 FPS |
| BLES00047 | 60 FPS |
| BLES00048 | Unlock FPS |
| BLES00066 | 60 FPS |
| BLES00070 | 60 FPS |
| BLES00130 | Unlock FPS |
| BLES00145 | Unlock FPS |
| BLES00146 | 60 FPS |
| BLES00149 | Unlock FPS |
| BLES00154 | Unlock FPS |
| BLES00155 | Unlock FPS |
| BLES00156 | Unlock FPS |
| BLES00200 | Unlock FPS |
| BLES00231 | 60 FPS |
| BLES00259 | 60 FPS |
| BLES00307 | 60 FPS |
| BLES00322 | Unlock FPS |
| BLES00333 | 60 FPS |
| BLES00334 | 60 FPS |
| BLES00335 | 60 FPS |
| BLES00336 | 60 FPS |
| BLES00337 | 60 FPS |
| BLES00355 | Unlock FPS |
| BLES00398 | 60 FPS |
| BLES00399 | 60 FPS |
| BLES00404 | Unlock FPS |
| BLES00424 | 60 FPS |
| BLES00457 | Unlock FPS |
| BLES00461 | 60 FPS |
| BLES00467 | Unlock FPS |
| BLES00526 | Unlock FPS |
| BLES00582 | Unlock FPS |
| BLES00584 | Unlock FPS |
| BLES00676 | Unlock FPS |
| BLES00695 | 60 FPS |
| BLES00696 | Unlock FPS |
| BLES00697 | Unlock FPS |
| BLES00698 | Unlock FPS |
| BLES00737 | 60 FPS |
| BLES00760 | 60 FPS |
| BLES00773 | 60 FPS |
| BLES00779 | 60 FPS |
| BLES00901 | 60 FPS |
| BLES00902 | 60 FPS |
| BLES00903 | 60 FPS |
| BLES00904 | 60 FPS |
| BLES00905 | 60 FPS |
| BLES01033 | Unlock FPS |
| BLES01034 | Unlock FPS |
| BLES01035 | Unlock FPS |
| BLES01039 | Unlock FPS |
| BLES01050 | Unlock FPS |
| BLES01057 | 60 FPS |
| BLES01105 | Unlock FPS |
| BLES01227 | Unlock FPS |
| BLES01265 | Unlock FPS |
| BLES01329 | 60 FPS |
| BLES01330 | 60 FPS |
| BLES01685 | Unlock FPS |
| BLES01885 | 60 FPS |
| BLES02029 | 60 FPS |
| BLES02197 | 60 FPS |
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
| BLJM60282 | 60 FPS |
| BLJM60296 | 60 FPS |
| BLJM60332 | Unlock FPS |
| BLJM60379 | Unlock FPS |
| BLJM60409 | Unlock FPS |
| BLJM60413 | 60 FPS |
| BLJM60427 | Unlock FPS |
| BLJM60490 | Unlock FPS |
| BLJM61163 | Unlock FPS |
| BLJM61166 | 60 FPS |
| BLJS10034 | Unlock FPS |
| BLJS10040 | 60 FPS |
| BLJS10068 | 60 FPS |
| BLJS10069 | 60 FPS |
| BLJS10181 | 60 FPS |
| BLJS10219 | Unlock FPS |
| BLJS10262 | Unlock FPS |
| BLJS10263 | Unlock FPS |
| BLJS10288 | Unlock FPS |
| BLJS10319 | Unlock FPS |
| BLJS10324 | Unlock FPS |
| BLKS20048 | Unlock FPS |
| BLKS20094 | Unlock FPS |
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
| BLUS30086 | Unlock FPS |
| BLUS30106 | Unlock FPS |
| BLUS30117 | 60 FPS |
| BLUS30118 | 60 FPS |
| BLUS30121 | 60 FPS |
| BLUS30134 | 60 FPS |
| BLUS30153 | Unlock FPS |
| BLUS30179 | Unlock FPS |
| BLUS30185 | 60 FPS |
| BLUS30234 | 60 FPS |
| BLUS30242 | 60 FPS |
| BLUS30253 | 60 FPS |
| BLUS30279 | Unlock FPS |
| BLUS30335 | 60 FPS |
| BLUS30371 | 60 FPS |
| BLUS30386 | Unlock FPS |
| BLUS30436 | Unlock FPS |
| BLUS30455 | Unlock FPS, 60 FPS |
| BLUS30458 | 60 FPS |
| BLUS30464 | 60 FPS |
| BLUS30500 | 60 FPS |
| BLUS30517 | 60 FPS |
| BLUS30608 | Unlock FPS |
| BLUS30626 | 60 FPS |
| BLUS30627 | 60 FPS |
| BLUS30632 | 60 FPS |
| BLUS30640 | Unlock FPS |
| BLUS30682 | Unlock FPS |
| BLUS30754 | Unlock FPS |
| BLUS30758 | Unlock FPS |
| BLUS30778 | 60 FPS |
| BLUS30849 | 60 FPS |
| BLUS30888 | Unlock FPS |
| BLUS30982 | Unlock FPS |
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
| NPEA00364 | 60 FPS, Unlock FPS |
| NPEA00378 | Unlock FPS |
| NPEA00422 | Unlock FPS |
| NPEA00431 | Unlock FPS |
| NPEA00435 | Unlock FPS |
| NPEA00445 | Unlock FPS |
| NPEA00452 | Unlock FPS |
| NPEA00453 | Unlock FPS |
| NPEA00457 | Unlock FPS |
| NPEA00521 | Unlock FPS |
| NPEA80017 | Unlock FPS |
| NPEA90033 | 60 FPS |
| NPEA90055 | 60 FPS, Unlock FPS |
| NPEA90090 | Unlock FPS |
| NPEA90125 | 60 FPS |
| NPEB00052 | Unlock FPS |
| NPEB00075 | Unlock FPS |
| NPEB00098 | Unlock FPS |
| NPEB00293 | 60 FPS |
| NPEB00316 | Unlock FPS |
| NPEB00365 | Unlock FPS |
| NPEB00385 | Unlock FPS |
| NPEB00458 | Unlock FPS |
| NPEB00459 | Unlock FPS |
| NPEB00503 | Unlock FPS |
| NPEB00505 | Unlock FPS |
| NPEB00557 | Unlock FPS |
| NPEB00622 | Unlock FPS |
| NPEB00625 | Unlock FPS |
| NPEB00636 | Unlock FPS |
| NPEB00652 | Unlock FPS |
| NPEB00723 | 60 FPS |
| NPEB00724 | 60 FPS |
| NPEB00730 | Unlock FPS |
| NPEB00740 | Unlock FPS |
| NPEB00751 | 60 FPS |
| NPEB00777 | Unlock FPS |
| NPEB00859 | Unlock FPS |
| NPEB00865 | Unlock FPS |
| NPEB00882 | Unlock FPS |
| NPEB00941 | Unlock FPS |
| NPEB01028 | Unlock FPS |
| NPEB01043 | Unlock FPS |
| NPEB01088 | Unlock FPS |
| NPEB01109 | Unlock FPS |
| NPEB01121 | 60 FPS |
| NPEB01144 | Unlock FPS |
| NPEB01156 | Unlock FPS |
| NPEB01216 | 60 FPS |
| NPEB01217 | 60 FPS |
| NPEB01220 | Unlock FPS |
| NPEB01224 | Unlock FPS |
| NPEB01243 | Unlock FPS |
| NPEB01246 | 60 FPS |
| NPEB01268 | Unlock FPS |
| NPEB01283 | 60 FPS |
| NPEB01310 | 60 FPS |
| NPEB01318 | Unlock FPS |
| NPEB01351 | Unlock FPS |
| NPEB01370 | Unlock FPS |
| NPEB01374 | Unlock FPS |
| NPEB01376 | Unlock FPS |
| NPEB01390 | Unlock FPS |
| NPEB01393 | 60 FPS |
| NPEB01407 | Unlock FPS, Unlock FPS (No User Input), Unlock FPS (For Delisted Ver) |
| NPEB01432 | Unlock FPS |
| NPEB01854 | Unlock FPS |
| NPEB01858 | 60 FPS |
| NPEB01861 | Unlock FPS |
| NPEB01932 | Unlock FPS |
| NPEB02013 | 60 FPS |
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
| NPHA80194 | 60 FPS, Unlock FPS |
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
| NPJB00516 | 60 FPS |
| NPJB00698 | Unlock FPS |
| NPJB00758 | Unlock FPS |
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
| NPUA80697 | Unlock FPS |
| NPUA80796 | Unlock FPS |
| NPUA80856 | 60 FPS |
| NPUA80858 | Unlock FPS |
| NPUA80908 | Unlock FPS |
| NPUA80918 | Unlock FPS |
| NPUA80959 | 60 FPS |
| NPUA80960 | Unlock FPS |
| NPUA80965 | Unlock FPS |
| NPUA80966 | Unlock FPS |
| NPUA81175 | Unlock FPS |
| NPUB30224 | Unlock FPS |
| NPUB30251 | Unlock FPS |
| NPUB30413 | Unlock FPS |
| NPUB30447 | Unlock FPS |
| NPUB30543 | Unlock FPS |
| NPUB30583 | 60 FPS |
| NPUB30588 | Unlock FPS |
| NPUB30606 | 60 FPS |
| NPUB30643 | Unlock FPS |
| NPUB30702 | Unlock FPS |
| NPUB30710 | Unlock FPS |
| NPUB30732 | Unlock FPS |
| NPUB30751 | Unlock FPS |
| NPUB30799 | Unlock FPS |
| NPUB30838 | Unlock FPS |
| NPUB30892 | 60 FPS |
| NPUB30898 | Unlock FPS |
| NPUB30987 | 60 FPS |
| NPUB31069 | Unlock FPS |
| NPUB31071 | Unlock FPS |
| NPUB31096 | 60 FPS |
| NPUB31125 | Unlock FPS |
| NPUB31136 | 60 FPS |
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

---

## 2. Niezgodnosc wersji gry (129 plików)

Patche RPCS3 sa pisane pod konkretna wersje pliku wykonywalnego gry (PPU hash).
Adresy pamieci zmieniaja sie miedzy aktualizacjami gry — uzycie patcha z innej wersji zapisaloby dane pod blednym adresem i zawiesiloby gre.

**Jak naprawic:** Zaktualizuj gre do wersji dla ktorej istnieje patch RPCS3, lub zaktualizuj USERLIST o plik .ncl dla wlasciwej wersji gry.

| Plik .ncl | Patch | Wersja pliku | Wersja patcha RPCS3 |
|-----------|-------|--------------|----------------------|
| 3D Dot Game Heroes BLES00875 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| 3D Dot Game Heroes BLES00875 BLJM60180 BLUS30490 01.00.ncl | Unlock FPS | 01.00 | 01.20 |
| 3D Dot Game Heroes BLES00875 BLJM60180 BLUS30490 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| 3D Dot Game Heroes BLJM60180 01.01.ncl | Unlock FPS | 01.01 | 01.20 |
| Army Of Two Le Cartel Du Diable BLES01763 BLUS31069 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Army Of Two The 40th Day BLES00659 01.00.ncl | Unlock FPS | 01.00 | 01.02 |
| Army Of Two The 40th Day BLES00659 01.02.ncl | Unlock FPS | 01.02 | 01.00 |
| Army Of Two The Devil's Cartel BLES01763 BLUS31069 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Battlefield 3 BLES01275 BLUS30762 01.00.ncl | 60 FPS | 01.00 | 01.09 |
| Battlefield 3 BLUS30762 01.01.ncl | 60 FPS | 01.01 | 01.09 |
| Battlefield Bad Company Gold Edition BLES00261 01.00.ncl | 60 FPS | 01.00 | 01.20 |
| Biohazard 5 Alternative Edition BLJM60199 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Borderlands 2 BLES01684 01.00.ncl | Unlock FPS | 01.00 | 01.15 |
| Borderlands 2 BLES01684 01.01.ncl | Unlock FPS | 01.01 | 01.15 |
| Borderlands 2 BLES01684 01.02.ncl | Unlock FPS | 01.02 | 01.15 |
| Call Of Duty 4 Modern Warfare BLES00148 BLJS10013 01.00.ncl | Unlock FPS | 01.00 | 01.40 |
| Call Of Duty Black Ops BLES01031 BLES01032 01.13.ncl | Unlock FPS | 01.13 | 01.00 |
| Call Of Duty Black Ops BLES01031 BLES01032 BLUS30591 01.00.ncl | Unlock FPS | 01.00 | 01.13 |
| Call Of Duty Black Ops Dubbed Edition BLJM60287 01.00.ncl | Unlock FPS | 01.00 | 01.13 |
| Call Of Duty World At War BLES00354 BLUS30192 01.01.ncl | Unlock FPS | 01.01 | 01.07 |
| Dark Souls BLES01396 01.05.ncl | Unlock FPS | 01.05 | 01.00 |
| Dark Souls BLUS30782 01.05.ncl | Unlock FPS | 01.05 | 01.00 |
| Demon's Souls BCAS20071 01.00.ncl | Unlock FPS | 01.00 | 01.04 |
| Demon's Souls BCJS30022 01.00.ncl | Unlock FPS | 01.00 | 01.04 |
| Drag-On Dragoon 3 BLJM61043 01.00.ncl | Unlock FPS | 01.00 | 01.04 |
| Drag-On Dragoon 3 BLJM61043 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Drag-On Dragoon 3 BLJM61043 01.01.ncl | Unlock FPS | 01.01 | 01.04 |
| Dragon's Dogma BLES01356 01.00.ncl | Unlock FPS | 01.00 | 01.05 |
| Dragon's Dogma BLES01356 01.00.ncl | Unlock FPS | 01.00 | 10.00 |
| Dragon's Dogma BLES01356 01.03.ncl | Unlock FPS | 01.03 | 01.00 |
| Dragon's Dogma BLES01356 01.03.ncl | Unlock FPS | 01.03 | 01.05 |
| Dragon's Dogma BLES01356 01.03.ncl | Unlock FPS | 01.03 | 10.00 |
| Dragon's Dogma BLUS30720 01.01.ncl | Unlock FPS | 01.01 | 01.05 |
| Dragon's Dogma BLUS30720 01.03.ncl | Unlock FPS | 01.03 | 01.05 |
| Dragon's Dogma Dark Arisen BLES01794 01.00.ncl | Unlock FPS | 01.00 | 01.02 |
| Dragon's Dogma Dark Arisen BLJM61012 BLUS31155 01.01.ncl | Unlock FPS | 01.01 | 01.02 |
| Dragon's Dogma Dark Arisen NPUB31117 01.00.ncl | Unlock FPS | 01.00 | 01.02 |
| Drakengard 3 BLUS31197 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Drakengard 3 BLUS31197 NPUB31251 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Drakengard 3 BLUS31197 NPUB31251 01.00.ncl | Unlock FPS (No User Input) | 01.00 | 01.01 |
| Enslaved Odyssey To The West BLES00989 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Folklore BCAS20013 BCES00050 BCUS98147 01.00.ncl | Unlock FPS | 01.00 | 01.10 |
| Folklore BCES00050 01.10.ncl | Unlock FPS | 01.10 | 01.00 |
| Genji Kamui Souran BCAS20002 01.01.ncl | 60 FPS | 01.01 | 01.00 |
| God Of War Ascension BCAS25016 BCES01741 01.00.ncl | Unlock FPS | 01.00 | 01.04 |
| God Of War Ascension BCUS98232 01.00.ncl | Unlock FPS | 01.00 | 01.04 |
| Gran Turismo 5 BCES00569 BCUS98114 01.00.ncl | Unlock FPS | 01.00 | 01.12 |
| Gran Turismo 5 BCES00569 BCUS98114 01.00.ncl | Unlock FPS | 01.00 | 02.11 |
| Gran Turismo 5 BCES00569 BCUS98114 01.00.ncl | Unlock FPS | 01.00 | 02.17 |
| Gran Turismo 5 BCES00569 BCUS98114 01.00.ncl | Unlock FPS | 01.00 | 01.13 |
| Gran Turismo 5 BCES00569 BCUS98114 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Gran Turismo 5 BCES00569 BCUS98114 01.09.ncl | Unlock FPS | 01.09 | 01.12 |
| Gran Turismo 5 BCES00569 BCUS98114 01.09.ncl | Unlock FPS | 01.09 | 02.11 |
| Gran Turismo 5 BCES00569 BCUS98114 01.09.ncl | Unlock FPS | 01.09 | 02.17 |
| Gran Turismo 5 BCES00569 BCUS98114 01.09.ncl | Unlock FPS | 01.09 | 01.13 |
| Grand Theft Auto IV BLES00229 BLUS30127 01.01.ncl | Unlock FPS | 01.01 | 01.08 |
| Grand Theft Auto V BLES01807 01.00.ncl | 60 FPS | 01.00 | 01.27 |
| Grand Theft Auto V BLES01807 01.01.ncl | 60 FPS | 01.01 | 01.27 |
| Grand Theft Auto V BLES01807 01.01.ncl | 60 FPS | 01.01 | 01.00 |
| Grand Theft Auto V BLES01807 01.02.ncl | 60 FPS | 01.02 | 01.27 |
| Grand Theft Auto V BLES01807 01.02.ncl | 60 FPS | 01.02 | 01.00 |
| Grand Theft Auto V BLES01807 01.04.ncl | 60 FPS | 01.04 | 01.27 |
| Grand Theft Auto V BLES01807 01.04.ncl | 60 FPS | 01.04 | 01.00 |
| Grand Theft Auto V BLES01807 01.06.ncl | 60 FPS | 01.06 | 01.27 |
| Grand Theft Auto V BLES01807 01.06.ncl | 60 FPS | 01.06 | 01.00 |
| Grand Theft Auto V BLJM61019 01.00.ncl | 60 FPS | 01.00 | 02.24 |
| Grand Theft Auto V BLUS31156 01.00.ncl | 60 FPS | 01.00 | 01.27 |
| Grand Theft Auto V BLUS31156 01.04.ncl | 60 FPS | 01.04 | 01.27 |
| Grand Theft Auto V BLUS31156 01.04.ncl | 60 FPS | 01.04 | 01.00 |
| Grand Theft Auto V BLUS31156 01.05.ncl | 60 FPS | 01.05 | 01.27 |
| Grand Theft Auto V BLUS31156 01.05.ncl | 60 FPS | 01.05 | 01.00 |
| Hatsune Miku Project Diva F 2nd BLJM61079 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Hatsune Miku Project Diva F 2nd BLJM61079 01.00.ncl | 60 FPS | 01.00 | 01.02 |
| Hatsune Miku Project Diva F 2nd BLJM61079 01.01.ncl | 60 FPS | 01.01 | 01.00 |
| Hatsune Miku Project Diva F 2nd BLJM61079 01.01.ncl | 60 FPS | 01.01 | 01.02 |
| JoJo No Kimyou Na Bouken Eyes Of Heaven BLJS10318 01.00.ncl | 60 FPS | 01.00 | 01.05 |
| JoJo No Kimyou Na Bouken Eyes Of Heaven BLJS10318 01.02.ncl | 60 FPS | 01.02 | 01.05 |
| Kamen Rider Battride War BLJS10220 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Kingdoms Of Amalur Reckoning BLES01251 BLUS30710 01.02.ncl | Unlock FPS | 01.02 | 01.00 |
| Lost Planet 2 MRTC00002 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Lost Planet 2 MRTC00002 01.01.ncl | Unlock FPS | 01.01 | 01.02 |
| Lost Planet 3 BLUS31020 01.00.ncl | Unlock FPS | 01.00 | 01.02 |
| Malicious NPEA00366 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Mass Effect 3 BLES01462 01.00.ncl | Unlock FPS | 01.00 | 01.09 |
| Mass Effect 3 BLES01462 01.05.ncl | Unlock FPS | 01.05 | 01.09 |
| Mass Effect 3 BLES01462 01.07.ncl | Unlock FPS | 01.07 | 01.09 |
| Mass Effect 3 BLUS30853 01.00.ncl | Unlock FPS | 01.00 | 01.10 |
| Mass Effect 3 BLUS30853 01.05.ncl | Unlock FPS | 01.05 | 01.10 |
| Mass Effect 3 BLUS30853 01.07.ncl | Unlock FPS | 01.07 | 01.10 |
| Mass Effect 3 BLUS30853 01.09.ncl | Unlock FPS | 01.09 | 01.10 |
| Metal Gear Solid 4 Guns Of The Patriots BLES00246 BLUS30109 01.01.ncl | Unlock FPS | 01.01 | 02.00 |
| Metal Gear Solid 4 Guns Of The Patriots BLJM67001 01.03.ncl | Unlock FPS | 01.03 | 02.00 |
| MotorStorm Apocalypse BCES00484 01.00.ncl | Unlock FPS | 01.00 | 01.06 |
| MotorStorm Apocalypse BCES00484 BCUS98242 01.02 BCES01104 01.04.ncl | Unlock FPS | 01.04 | 01.00 |
| MotorStorm Apocalypse BCES00484 BCUS98242 01.02 BCES01104 01.04.ncl | Unlock FPS | 01.04 | 01.06 |
| MotorStorm Pacific Rift BCUS98155 01.02.ncl | 60 FPS | 01.02 | 01.00 |
| MotorStorm Pacific Rift BCUS98155 01.02.ncl | 60 FPS | 01.02 | 01.03 |
| Natsuiro High School Seishun Hakusho BLJS10273 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Natsuiro High School Seishun Hakusho BLJS10273 01.01.ncl | Unlock FPS | 01.01 | 01.02 |
| Need For Speed Rivals BLUS31201 01.03.ncl | 60 FPS | 01.03 | 01.00 |
| Rambo BLES01963 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Ratchet And Clank All 4 One BCAS20200 BCES01141 BCJS30081 BCUS98175 NPEA00356 01.03.ncl | Unlock FPS | 01.03 | 01.00 |
| Ratchet And Clank Full Frontal Assault BCUS98380 01.04 NPJA00089 01.00.ncl | Unlock FPS | 01.00 | 01.05 |
| Ratchet And Clank Full Frontal Assault NPUA80642 01.00.ncl | Unlock FPS | 01.00 | 01.05 |
| Ratchet And Clank Future A Crack In Time BCUS98124 01.00.ncl | Unlock FPS | 01.00 | 01.20 |
| Ratchet And Clank Future A Crack In Time BCUS98124 01.02.ncl | Unlock FPS | 01.02 | 01.00 |
| Ratchet And Clank Future A Crack In Time BCUS98124 01.02.ncl | Unlock FPS | 01.02 | 01.20 |
| Ratchet And Clank Into The Nexus BCUS99245 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Ratchet And Clank Nexus BCES01908 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Ratchet And Clank Nexus BCES01908 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Ratchet And Clank QForce BCES01594 01.04.ncl | Unlock FPS | 01.04 | 01.05 |
| Red Dead Redemption GOTY Edition BLES01294 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Resident Evil 5 Gold Edition BLES00485 BLUS30491 02.00.ncl | Unlock FPS | 02.00 | 01.01 |
| Resident Evil 5 Gold Edition BLES00816 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Resident Evil 5 Gold Edition BLES00816 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Resident Evil 5 Gold Edition BLUS30491 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Resident Evil Revelations BLES01773 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Resident Evil Revelations BLUS31051 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Resistance 2 BCAS20055 BCUS98120 01.00.ncl | Unlock FPS | 01.00 | 01.60 |
| Resistance 3 BCES01118 BCUS98176 01.00.ncl | Unlock FPS | 01.00 | 01.05 |
| Rush'N Attack Ex-Patriot NPUB30112 01.00 NPEB00299 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Sengoku Basara 4 Sumeragi BLJM61248 01.01.ncl | Unlock FPS | 01.01 | 01.02 |
| Sengoku Basara 4 Sumeragi NPJB00688 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Sengoku Basara 4 Sumeragi NPJB00688 01.01.ncl | Unlock FPS | 01.01 | 01.02 |
| Silent Hill Downpour BLJM60391 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Silent Hill Downpour BLUS30565 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Stranglehold BLES00144 01.20.ncl | Unlock FPS | 01.20 | 01.01 |
| Tales Of Xillia 2 BLJS10188 01.00.ncl | 60 FPS | 01.00 | 01.01 |
| Tales Of Xillia 2 BLJS10188 01.01.ncl | 60 FPS | 01.01 | 01.00 |
| The Last Of Us BCES01584 BCUS98174 01.00.ncl | Unlock FPS | 01.00 | 01.11 |
| Transformers War For Cybertron BLES00833 BLUS30357 01.01.ncl | Unlock FPS | 01.01 | 01.00 |
| Twisted Metal BCES01010 01.01 BCUS98106 01.00.ncl | 60 FPS | 01.00 | 01.06 |
| Twisted Metal BCUS98106 01.00 BCES01010 01.01.ncl | 60 FPS | 01.01 | 01.06 |
| Uncharted 2 Among Thieves BCAS20097 BCES00509 01.00.ncl | 60 FPS | 01.00 | 01.09 |
| Uncharted 2 Among Thieves BCAS20097 BCES00509 01.00.ncl | Unlock FPS | 01.00 | 01.09 |
| Uncharted 2 Among Thieves BCES00509 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 Among Thieves BCES00509 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 Among Thieves BCES00757 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 Among Thieves BCES00757 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 Among Thieves NPEA00365 01.00.ncl | 60 FPS | 01.00 | 01.10 |
| Uncharted 2 Among Thieves NPEA00365 01.00.ncl | Unlock FPS | 01.00 | 01.10 |
| Uncharted 2 El Reino De Los Ladrones BCAS20097 BCES00509 01.00.ncl | 60 FPS | 01.00 | 01.09 |
| Uncharted 2 El Reino De Los Ladrones BCAS20097 BCES00509 01.00.ncl | Unlock FPS | 01.00 | 01.09 |
| Uncharted 2 El Reino De Los Ladrones BCES00509 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 El Reino De Los Ladrones BCES00509 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 El Reino De Los Ladrones BCES00757 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 El Reino De Los Ladrones BCES00757 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 El Reino De Los Ladrones NPEA00365 01.00.ncl | 60 FPS | 01.00 | 01.10 |
| Uncharted 2 El Reino De Los Ladrones NPEA00365 01.00.ncl | Unlock FPS | 01.00 | 01.10 |
| Uncharted 2 Il Covo Dei Ladri BCAS20097 BCES00509 01.00.ncl | 60 FPS | 01.00 | 01.09 |
| Uncharted 2 Il Covo Dei Ladri BCAS20097 BCES00509 01.00.ncl | Unlock FPS | 01.00 | 01.09 |
| Uncharted 2 Il Covo Dei Ladri BCES00509 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 Il Covo Dei Ladri BCES00509 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 Il Covo Dei Ladri BCES00757 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted 2 Il Covo Dei Ladri BCES00757 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| Uncharted 2 Il Covo Dei Ladri NPEA00365 01.00.ncl | 60 FPS | 01.00 | 01.10 |
| Uncharted 2 Il Covo Dei Ladri NPEA00365 01.00.ncl | Unlock FPS | 01.00 | 01.10 |
| Uncharted 3 Drake's Deception BCAS25014 01.15.ncl | Unlock FPS | 01.15 | 01.19 |
| Uncharted 3 Drake's Deception BCES01175 01.17.ncl | Unlock FPS | 01.17 | 01.00 |
| Uncharted 3 Drake's Deception BCES01175 01.17.ncl | Unlock FPS | 01.17 | 01.19 |
| Uncharted 3 Drake's Deception BCES01175 01.18.ncl | Unlock FPS | 01.18 | 01.00 |
| Uncharted 3 Drake's Deception BCES01175 01.18.ncl | Unlock FPS | 01.18 | 01.19 |
| Uncharted 3 Drake's Deception BCES01175 01.19.ncl | Unlock FPS | 01.19 | 01.00 |
| Uncharted Drake's Fortune BCES00065 01.00.ncl | Unlock FPS | 01.00 | 01.01 |
| Uncharted Drake's Fortune BCES00065 BCUS98103 01.10.ncl | Unlock FPS | 01.10 | 01.01 |
| Uncharted Ougontou To Kieta Sendan BCJS30035 01.00.ncl | 60 FPS | 01.00 | 01.09 |
| Uncharted Ougontou To Kieta Sendan BCJS30035 01.00.ncl | Unlock FPS | 01.00 | 01.09 |
| Uncharted Ougontou To Kieta Sendan BCJS30035 01.09.ncl | 60 FPS | 01.09 | 01.00 |
| Uncharted Ougontou To Kieta Sendan BCJS30035 01.09.ncl | Unlock FPS | 01.09 | 01.00 |
| WRC 2 BLES001442 01.01.ncl | Unlock FPS | 01.01 | 01.20 |
| Worms Revolution Collection  2 BLES001442 01.01.ncl | Unlock FPS | 01.01 | 01.20 |
| Worms Revolution Collection 2 BLES001442 01.01.ncl | Unlock FPS | 01.01 | 01.20 |

---

## 3. Typy instrukcji bez odpowiednika w Artemis

Linie z tymi typami zostaly pominiete wewnatrz patchy, ktore mimo to zostaly dodane (patch dziala, ale bez tych linii).

| Typ | Przyklad gier |
|-----|---------------|

> bef64 = 64-bitowy float — brak w standardowym formacie Artemis NCL
> byte = zapis 1-bajtowy — brak standardowego kodu Artemis NCL
