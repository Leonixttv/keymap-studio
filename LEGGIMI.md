# Keymap Studio 0.5.2

Configuratore desktop open source, in italiano, per tastiere custom USB. Apri Keymap-Studio-Portable.exe su Windows x64. Funziona anche offline.

## Collega una tastiera

- **Vial 5 o 6** — premi **Collega via USB**. La definizione del modello, il layout, i layer e le opzioni vengono letti dal firmware.
- **VIA 12 o 13** — scegli **Definizione VIA**, carica il JSON VIA fornito per il modello e poi collega la tastiera. Gli ID USB del file devono corrispondere al dispositivo. È un supporto alle funzioni standard, con menu proprietari dipendenti dal produttore.
- **Demo** — prova mappa, varianti fisiche, legende, colori ed editor senza un dispositivo.

## Funzioni

- **Mappa tasti** — assegnazione grafica per layer, codici QMK, multimediali, macro esistenti e profili JSON. L’importazione delle mappe si applica solo dopo conferma dalla scheda della mappa. Quando **Seleziona premendo un tasto** è attivo, premi un tasto fisico per evidenziarne la posizione. La selezione usa il segnale ricevuto da Windows e la mappa salvata. Se più posizioni producono lo stesso segnale, seleziona il tasto con il mouse. Per creare un tasto Fn, seleziona il tasto, scegli **Layer di Fn**, premi **Assegna Fn** e salva la mappa. Il tasto attiva il layer scelto finché lo tieni premuto.
- **Layout** — anteprima delle alternative definite dal firmware, confronto con la disposizione attuale, legende per sei layout e colori personalizzabili. Per digitare con gli stessi simboli seleziona il layout corrispondente in Windows.
- **Illuminazione** — selettore, campioni, HEX e anteprima animata. Supporta VialRGB, QMK RGBLight esposto da Vial e le voci standard VIA qmk_rgblight e qmk_rgb_matrix dichiarate nel JSON. La resa reale e gli effetti compilati dipendono dai LED e dal firmware.
- **Funzioni avanzate** — macro a passaggi, manopole per layer, combo, tap dance, sostituzioni, ripetizione alternativa e impostazioni QMK disponibili sul dispositivo. Su Vial alcune scritture richiedono lo sblocco fisico. Per le macro di testo sono disponibili i caratteri ASCII stampabili. Per Invio e Tab usa un passaggio tasto.
- **Test tasti** — input ricevuto dall’app e test switch via matrice USB quando il firmware e le dimensioni della matrice lo permettono.
- **Backup** — copia della mappa salvata, del layout, delle macro, delle manopole, dell’illuminazione e delle funzioni supportate. Ripristina su una tastiera compatibile. Prima di scrivere, l’app scarica un backup della configurazione attuale. Le sezioni già scritte possono risultare modificate se il dispositivo si scollega durante il ripristino.

L’app configura il firmware già installato. Il flashing, i protocolli proprietari e l’interpretazione dei menu VIA personalizzati non fanno parte di questa versione.

## Compilazione e licenza

Su Windows x64 con Node.js 24:

    npm ci
    npm start
    npm run build:portable

Il risultato è dist/Keymap-Studio-Portable.exe, senza firma digitale. Include Electron e un launcher .NET Framework. Il codice di Keymap Studio è GPL-2.0-or-later. Il file COPYING contiene il testo GPL v2. Electron e il decompressore XZ hanno licenze proprie.

Riferimenti: [specifica VIA](https://caniusevia.com/docs/specification/), [firmware Vial QMK](https://github.com/vial-kb/vial-qmk) e [Vial GUI](https://github.com/vial-kb/vial-gui).
