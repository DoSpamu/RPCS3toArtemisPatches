! UWAGA — UZYWAJ NA WLASNE RYZYKO !
===========================================

Ten folder to kopia USERLIST z dodatkowymi patchami RPCS3,
ktore zostaly dodane POMIMO niezgodnosci wersji gry.

CO TO OZNACZA:
- Normalny USERLIST (folder USERLIST) zawiera tylko patche dopasowane
  do dokladnej wersji gry (np. patch v01.00 trafil tylko do plikow .ncl v01.00).
- Ten folder (USERLIST_RISKY) zawiera ROWNIEZ patche z innych wersji gry.

RYZYKO:
- Patch pisany pod wersje 01.09 gry moze miec INNE adresy pamieci niz wersja 01.00.
- Jesli wersja sie nie zgadza, patch moze:
    * nie robic nic
    * zawieszac gre
    * psuc zapis gry (rzadko, ale mozliwe)
- W najgorszym razie: crash gry, powrot do XMB.

JAK ROZPOZNAC PATCHE RYZYKOWNE:
Wszystkie patche dodane z niezgodna wersja maja w nazwie numer wersji, np.:
    "Unlock FPS v01.04 (RPCS3)"   <- patch pisany pod v01.04
Patche bezpieczne (dopasowane wersja) maja nazwe bez numeru:
    "Unlock FPS (RPCS3)"          <- wersja dopasowana

CO ROBIC JESLI PATCH NIE DZIALA:
1. Wyłącz patch w Artemis
2. Zaktualizuj gre do wersji podanej w nazwie patcha
3. Lub uzyj folderu USERLIST (bezpieczny) zamiast USERLIST_RISKY

===========================================
Folder wygenerowany przez: node convert.js --risky
