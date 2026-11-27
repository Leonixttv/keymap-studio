"use strict";
const uiLanguages={en:"English",it:"Italiano",es:"Español",fr:"Français",de:"Deutsch"};
const suggested=navigator.language.split("-")[0];
let uiLanguage=Object.hasOwn(uiLanguages,suggested)?suggested:"en";
const translations=new Map(`
Modalità demo|Demo mode|Modo demo|Mode démo|Demomodus
Collega via USB|Connect via USB|Conectar por USB|Connecter en USB|Per USB verbinden
Scollega|Disconnect|Desconectar|Déconnecter|Trennen
USB scollegato|USB disconnected|USB desconectado|USB déconnecté|USB getrennt
Interfaccia di configurazione scollegata|Configuration interface disconnected|Interfaz de configuración desconectada|Interface de configuration déconnectée|Konfigurationsschnittstelle getrennt
L’interfaccia di configurazione USB si è scollegata; la tastiera potrebbe continuare a funzionare. Esporta la bozza e ricollega la tastiera per riprendere la configurazione.|The USB configuration interface disconnected; the keyboard may still work. Export your draft and reconnect the keyboard to resume configuration.|La interfaz de configuración USB se ha desconectado; es posible que el teclado siga funcionando. Exporta el borrador y vuelve a conectar el teclado para continuar.|L’interface de configuration USB s’est déconnectée ; le clavier peut encore fonctionner. Exportez le brouillon et reconnectez le clavier pour reprendre la configuration.|Die USB-Konfigurationsschnittstelle wurde getrennt; die Tastatur funktioniert möglicherweise weiterhin. Exportiere den Entwurf und verbinde die Tastatur erneut, um die Konfiguration fortzusetzen.
Torna alla demo|Back to demo|Volver a la demo|Retour à la démo|Zurück zur Demo
CONFIGURATORE USB · VIAL E VIA|USB CONFIGURATOR · VIAL AND VIA|CONFIGURADOR USB · VIAL Y VIA|CONFIGURATEUR USB · VIAL ET VIA|USB-KONFIGURATOR · VIAL UND VIA
Tastiere custom|Custom keyboards|Teclados personalizados|Claviers personnalisés|Individuelle Tastaturen
Esplora la mappa demo o collega la tua tastiera.|Try the demo or connect your keyboard.|Prueba la demo o conecta tu teclado.|Essayez la démo ou connectez votre clavier.|Probiere die Demo aus oder verbinde deine Tastatur.
Definizione VIA|VIA definition|Definición VIA|Définition VIA|VIA-Definition
Definizioni VIA salvate|Saved VIA definitions|Definiciones VIA guardadas|Définitions VIA enregistrées|Gespeicherte VIA-Definitionen
Le definizioni sono associate agli identificativi USB e conservate su questo computer.|Definitions are matched by USB IDs and stored on this computer.|Las definiciones se asocian a los ID USB y se guardan en este ordenador.|Les définitions sont associées aux identifiants USB et enregistrées sur cet ordinateur.|Definitionen werden USB-IDs zugeordnet und auf diesem Computer gespeichert.
Nessuna definizione VIA salvata.|No saved VIA definitions.|No hay definiciones VIA guardadas.|Aucune définition VIA enregistrée.|Keine VIA-Definitionen gespeichert.
Protocollo VIA 9: modifica sperimentale dei tasti standard. Fn, macro, layout e altre funzioni avanzate non sono ancora modificabili.|VIA protocol 9: experimental basic key editing. Fn, macros, layouts and other advanced features cannot yet be edited.|Protocolo VIA 9: edición experimental de teclas básicas. Fn, macros, disposición y funciones avanzadas aún no se pueden editar.|Protocole VIA 9 : modification expérimentale des touches standard. Fn, macros, disposition et fonctions avancées ne sont pas encore modifiables.|VIA-Protokoll 9: experimentelle Bearbeitung von Standardtasten. Fn, Makros, Layout und erweiterte Funktionen sind noch nicht bearbeitbar.
Copia errore|Copy error|Copiar error|Copier l’erreur|Fehler kopieren
Chiudi errore|Dismiss error|Cerrar error|Fermer l’erreur|Fehler schließen
Errore copiato.|Error copied.|Error copiado.|Erreur copiée.|Fehler kopiert.
Seleziona e copia il messaggio manualmente.|Select and copy the message manually.|Selecciona y copia el mensaje manualmente.|Sélectionnez et copiez le message manuellement.|Wähle die Nachricht aus und kopiere sie manuell.
Versione protocollo VIA non supportata:|Unsupported VIA protocol version:|Versión del protocolo VIA no compatible:|Version du protocole VIA non prise en charge :|Nicht unterstützte VIA-Protokollversion:
Questa versione del protocollo è disponibile solo in lettura.|This protocol version is available read-only.|Esta versión del protocolo es de solo lectura.|Cette version du protocole est en lecture seule.|Diese Protokollversion ist nur lesbar.
Modifica tasti base sperimentale|Experimental basic key editing|Edición experimental de teclas básicas|Modification expérimentale des touches standard|Experimentelle Bearbeitung von Standardtasten
Protocollo 9: modifica sperimentale dei tasti standard disponibile.|Protocol 9: experimental basic key editing available.|Protocolo 9: edición experimental de teclas básicas disponible.|Protocole 9 : modification expérimentale des touches standard disponible.|Protokoll 9: experimentelle Bearbeitung von Standardtasten verfügbar.
VIA 9: puoi modificare solo i tasti standard.|VIA 9: only standard keys can be edited.|VIA 9: solo se pueden modificar las teclas estándar.|VIA 9 : seules les touches standard peuvent être modifiées.|VIA 9: Nur Standardtasten können bearbeitet werden.
Layer Tap (LT)|Layer Tap (LT)|Layer Tap (LT)|Layer Tap (LT)|Layer Tap (LT)
Premi per inviare il tasto; tieni premuto per attivare il layer.|Tap to send the key; hold to activate the layer.|Pulsa para enviar la tecla; mantén pulsado para activar la capa.|Appuyez pour envoyer la touche ; maintenez pour activer la couche.|Tippen sendet die Taste; Gedrückthalten aktiviert die Ebene.
Layer da attivare|Layer to activate|Capa que activar|Couche à activer|Zu aktivierende Ebene
Tasto da premere|Key to tap|Tecla al pulsar|Touche à envoyer|Taste beim Tippen
Assegna Layer Tap|Assign Layer Tap|Asignar Layer Tap|Affecter Layer Tap|Layer Tap zuweisen
Sola lettura sperimentale|Experimental read-only|Solo lectura experimental|Lecture seule expérimentale|Experimenteller Lesemodus
Protocollo 9: mappa in sola lettura sperimentale; le modifiche sono disattivate.|Protocol 9: experimental read-only keymap; changes are disabled.|Protocolo 9: mapa experimental de solo lectura; cambios desactivados.|Protocole 9 : disposition expérimentale en lecture seule ; modifications désactivées.|Protokoll 9: experimentelle schreibgeschützte Belegung; Änderungen sind deaktiviert.
Dimentica JSON VIA|Forget VIA JSONs|Olvidar JSON VIA|Oublier les JSON VIA|VIA-JSONs vergessen
Dimenticare tutti i JSON VIA salvati su questo computer?|Forget all VIA JSONs saved on this computer?|¿Olvidar todos los JSON VIA guardados en este ordenador?|Oublier tous les JSON VIA enregistrés sur cet ordinateur ?|Alle auf diesem Computer gespeicherten VIA-JSONs vergessen?
Impossibile eliminare i JSON VIA salvati.|Could not remove saved VIA JSONs.|No se pudieron eliminar los JSON VIA guardados.|Impossible de supprimer les JSON VIA enregistrés.|Gespeicherte VIA-JSONs konnten nicht entfernt werden.
JSON VIA dimenticati.|Saved VIA JSONs forgotten.|JSON VIA guardados eliminados.|JSON VIA enregistrés oubliés.|Gespeicherte VIA-JSONs vergessen.
Diagnostica tastiera|Keyboard diagnostics|Diagnóstico del teclado|Diagnostic du clavier|Tastaturdiagnose
Seleziona un tasto e genera un rapporto in sola lettura. Controllalo prima di condividerlo: non viene inviato automaticamente.|Select a key and generate a read-only report. Review it before sharing: it is never sent automatically.|Selecciona una tecla y genera un informe de solo lectura. Revísalo antes de compartirlo: no se envía automáticamente.|Sélectionnez une touche et générez un rapport en lecture seule. Vérifiez-le avant de le partager : il n’est jamais envoyé automatiquement.|Wähle eine Taste und erstelle einen schreibgeschützten Bericht. Prüfe ihn vor dem Teilen: Er wird nicht automatisch gesendet.
Genera rapporto|Generate report|Generar informe|Générer le rapport|Bericht erstellen
Copia rapporto|Copy report|Copiar informe|Copier le rapport|Bericht kopieren
Salva rapporto|Save report|Guardar informe|Enregistrer le rapport|Bericht speichern
Rapporto diagnostico|Diagnostic report|Informe de diagnóstico|Rapport de diagnostic|Diagnosebericht
Rapporto copiato.|Report copied.|Informe copiado.|Rapport copié.|Bericht kopiert.
Seleziona e copia il rapporto manualmente.|Select and copy the report manually.|Selecciona y copia el informe manualmente.|Sélectionnez et copiez le rapport manuellement.|Wähle den Bericht aus und kopiere ihn manuell.
Definizione disponibile solo fino alla chiusura dell’app.|Definition is available only until the app closes.|La definición solo está disponible hasta cerrar la aplicación.|La définition est disponible jusqu’à la fermeture de l’application.|Die Definition ist nur bis zum Schließen der App verfügbar.
Importa mappa|Import keymap|Importar mapa|Importer la disposition|Tastenbelegung importieren
Esporta mappa|Export keymap|Exportar mapa|Exporter la disposition|Tastenbelegung exportieren
Strumenti|Tools|Herramientas|Outils|Werkzeuge
Mappa tasti|Keymap|Mapa de teclas|Affectation des touches|Tastenbelegung
Configura manopole|Configure encoders|Configurar perillas|Configurer les encodeurs|Drehgeber konfigurieren
Layout|Layout|Distribución|Disposition|Layout
Illuminazione|Lighting|Iluminación|Éclairage|Beleuchtung
Funzioni avanzate|Advanced|Funciones avanzadas|Fonctions avancées|Erweitert
Backup|Backup|Copia de seguridad|Sauvegarde|Sicherung
Test tasti|Key tester|Prueba de teclas|Test des touches|Tastentest
Seleziona un tasto, poi scegli la sua nuova funzione.|Select a key, then choose its new action.|Selecciona una tecla y elige su función.|Sélectionnez une touche, puis choisissez son action.|Wähle eine Taste und anschließend ihre Funktion.
Layout della tastiera|Keyboard layout|Distribución del teclado|Disposition du clavier|Tastaturlayout
Seleziona premendo un tasto|Select by pressing a key|Seleccionar al pulsar una tecla|Sélectionner en appuyant sur une touche|Durch Tastendruck auswählen
Per la selezione fisica scegli il layer attivo sulla tastiera. La posizione è stimata dal codice ricevuto.|For physical selection, choose the layer active on the keyboard. The position is inferred from the received keycode.|Para seleccionar con el teclado, elige la capa activa. La posición se estima según el código recibido.|Pour la sélection physique, choisissez la couche active du clavier. La position est déduite du code reçu.|Wähle für die Tastenauswahl die aktive Tastaturebene. Die Position wird aus dem empfangenen Tastencode ermittelt.
Seleziona da matrice USB|Select from USB matrix|Seleccionar desde la matriz USB|Sélectionner depuis la matrice USB|Über USB-Matrix auswählen
Rilascia i tasti, poi premi il tasto da selezionare.|Release all keys, then press the key to select.|Suelta todas las teclas y pulsa la que quieras seleccionar.|Relâchez les touches, puis appuyez sur celle à sélectionner.|Lass alle Tasten los und drücke dann die gewünschte Taste.
Posizione selezionata dalla matrice.|Position selected from the matrix.|Posición seleccionada desde la matriz.|Position sélectionnée depuis la matrice.|Position aus der Matrix ausgewählt.
Posizione non univoca nella definizione del layout.|Position is not unique in the layout definition.|Posición ambigua en la definición del diseño.|Position ambiguë dans la définition du clavier.|Position in der Layoutdefinition nicht eindeutig.
Nessuna pressione rilevata dalla matrice USB.|No keypress detected by the USB matrix.|La matriz USB no detectó ninguna pulsación.|Aucun appui détecté par la matrice USB.|Die USB-Matrix hat keinen Tastendruck erkannt.
Lettura della matrice USB non riuscita.|Could not read the USB matrix.|No se pudo leer la matriz USB.|Impossible de lire la matrice USB.|Die USB-Matrix konnte nicht gelesen werden.
Premi un tasto per selezionarlo.|Press a key to select it.|Pulsa una tecla para seleccionarla.|Appuyez sur une touche pour la sélectionner.|Drücke eine Taste, um sie auszuwählen.
Assegnazione|Assignment|Asignación|Affectation|Zuweisung
Nessun tasto selezionato|No key selected|Ninguna tecla seleccionada|Aucune touche sélectionnée|Keine Taste ausgewählt
Funzione del tasto|Key action|Función de la tecla|Action de la touche|Tastenfunktion
Assegna|Assign|Asignar|Affecter|Zuweisen
Codice QMK|QMK keycode|Código QMK|Code QMK|QMK-Tastencode
Codice QMK esadecimale|Hexadecimal QMK keycode|Código QMK hexadecimal|Code QMK hexadécimal|Hexadezimaler QMK-Tastencode
Assegna codice|Assign keycode|Asignar código|Affecter le code|Tastencode zuweisen
Layer di Fn|Fn layer|Capa de Fn|Couche Fn|Fn-Ebene
Assegna Fn|Assign Fn|Asignar Fn|Affecter Fn|Fn zuweisen
Tieni premuto per usare il layer scelto. Rilascia per tornare al layer precedente.|Hold to use the selected layer. Release to return.|Mantén pulsado para usar la capa elegida. Suelta para volver.|Maintenez la touche pour utiliser la couche choisie. Relâchez-la pour revenir.|Halte die Taste für die gewählte Ebene gedrückt. Lass los, um zurückzukehren.
Annulla modifiche|Discard changes|Descartar cambios|Annuler les modifications|Änderungen verwerfen
Applica|Apply|Aplicar|Appliquer|Anwenden
Applica alla demo|Apply to demo|Aplicar a la demo|Appliquer à la démo|Auf Demo anwenden
Scrivi sulla tastiera|Write to keyboard|Escribir en el teclado|Écrire sur le clavier|Auf Tastatur schreiben
Nessuna modifica in sospeso|No pending changes|No hay cambios pendientes|Aucune modification en attente|Keine ausstehenden Änderungen
Scegli una funzione|Choose an action|Elige una función|Choisissez une action|Funktion wählen
Tasti standard|Standard keys|Teclas estándar|Touches standard|Standardtasten
Disabilitato|Disabled|Desactivado|Désactivé|Deaktiviert
Trasparente|Transparent|Transparente|Transparent|Transparent
Invio|Enter|Intro|Entrée|Eingabe
Spazio|Space|Espacio|Espace|Leertaste
Canc|Delete|Supr|Suppr|Entf
Layout e aspetto|Layout and appearance|Distribución y aspecto|Disposition et apparence|Layout und Darstellung
Tema dell’app|App theme|Tema de la aplicación|Thème de l’application|App-Design
Foresta|Forest|Bosque|Forêt|Wald
Oceano|Ocean|Océano|Océan|Ozean
Viola|Violet|Violeta|Violet|Violett
Grafite|Graphite|Grafito|Graphite|Graphit
Modifica la disposizione e guarda il risultato sulla tastiera qui sotto.|Change the layout and preview the result below.|Cambia la distribución y revisa el resultado abajo.|Modifiez la disposition et visualisez le résultat ci-dessous.|Ändere das Layout und sieh dir unten die Vorschau an.
Disposizione fisica|Physical layout|Distribución física|Disposition physique|Physisches Layout
Legende|Key legends|Leyendas|Légendes|Tastenbeschriftung
Lingua del layout|Layout language|Idioma de distribución|Langue de disposition|Layoutsprache
Legende per la visualizzazione. La digitazione segue il layout del sistema operativo.|Legends are for display. Typed characters follow the operating system layout.|Las leyendas son visuales. La escritura depende de la distribución del sistema.|Les légendes sont visuelles. La saisie suit la disposition du système.|Die Beschriftung ist visuell. Die Eingabe folgt dem Layout des Betriebssystems.
Mostra anche i simboli con Shift|Show Shift symbols|Mostrar símbolos con Mayús|Afficher les symboles avec Maj|Umschaltzeichen anzeigen
Aspetto|Appearance|Aspecto|Apparence|Darstellung
Palette|Palette|Paleta|Palette|Farbpalette
Case|Case|Carcasa|Boîtier|Gehäuse
Tasti|Keys|Teclas|Touches|Tasten
Accenti|Accents|Acentos|Accents|Akzente
Anteprima|Preview|Vista previa|Aperçu|Vorschau
Mostra attuale|Show current|Mostrar actual|Voir la disposition actuelle|Aktuelles Layout anzeigen
Mostra anteprima|Show preview|Mostrar vista previa|Voir l’aperçu|Vorschau anzeigen
Anteprima del layout|Layout preview|Vista previa de distribución|Aperçu de la disposition|Layout-Vorschau
Layout attuale|Current layout|Distribución actual|Disposition actuelle|Aktuelles Layout
Anteprima layout fisico|Physical layout preview|Vista previa física|Aperçu de la disposition physique|Vorschau des physischen Layouts
Salva layout|Save layout|Guardar distribución|Enregistrer la disposition|Layout speichern
Salva sulla tastiera|Save to keyboard|Guardar en el teclado|Enregistrer sur le clavier|Auf Tastatur speichern
Salva layout demo|Save demo layout|Guardar distribución de demo|Enregistrer la disposition démo|Demo-Layout speichern
Illuminazione underglow|Keyboard lighting|Iluminación del teclado|Éclairage du clavier|Tastaturbeleuchtung
Prova l’anteprima dei colori in modalità demo.|Preview colours in demo mode.|Prueba los colores en la demo.|Prévisualisez les couleurs en mode démo.|Vorschau der Farben im Demomodus.
Simulazione dei LED|LED simulation|Simulación de LED|Simulation des LED|LED-Simulation
Simulazione dell’effetto. La resa sulla tastiera può variare.|Effect simulation. Results on the keyboard may vary.|Simulación del efecto. El resultado puede variar.|Simulation de l’effet. Le rendu peut varier.|Effektsimulation. Die Darstellung kann abweichen.
Pausa anteprima|Pause preview|Pausar vista previa|Mettre en pause|Vorschau anhalten
Riprendi anteprima|Resume preview|Reanudar vista previa|Reprendre l’aperçu|Vorschau fortsetzen
Effetto|Effect|Efecto|Effet|Effekt
Colore|Colour|Color|Couleur|Farbe
Colore esadecimale|Hex colour|Color hexadecimal|Couleur hexadécimale|Hex-Farbe
Colori predefiniti|Preset colours|Colores predefinidos|Couleurs prédéfinies|Vordefinierte Farben
Luminosità|Brightness|Brillo|Luminosité|Helligkeit
Velocità|Speed|Velocidad|Vitesse|Geschwindigkeit
Salva illuminazione|Save lighting|Guardar iluminación|Enregistrer l’éclairage|Beleuchtung speichern
Spento|Off|Apagado|Éteint|Aus
Colore fisso|Solid colour|Color fijo|Couleur fixe|Statische Farbe
Le opzioni disponibili dipendono dal firmware della tastiera.|Available options depend on the keyboard firmware.|Las opciones dependen del firmware.|Les options dépendent du micrologiciel.|Die verfügbaren Optionen hängen von der Firmware ab.
Funzione|Feature|Función|Fonction|Funktion
Combinazioni (combo)|Combos|Combinaciones|Combinaisons|Tastenkombinationen
Pressioni multiple (tap dance)|Tap dance|Pulsaciones múltiples|Pressions multiples|Mehrfachanschläge
Manopole|Rotary encoders|Perillas|Encodeurs rotatifs|Drehgeber
Sostituzioni di tasto|Key overrides|Sustituciones de teclas|Substitutions de touches|Tastenersetzungen
Ripetizione alternativa|Alternate repeat|Repetición alternativa|Répétition alternative|Alternative Wiederholung
Impostazioni QMK|QMK settings|Ajustes QMK|Réglages QMK|QMK-Einstellungen
Salva|Save|Guardar|Enregistrer|Speichern
Salva nella demo|Save to demo|Guardar en la demo|Enregistrer dans la démo|In Demo speichern
Annulla sblocco|Cancel unlock|Cancelar desbloqueo|Annuler le déverrouillage|Entsperren abbrechen
Backup della tastiera|Keyboard backup|Copia del teclado|Sauvegarde du clavier|Tastatursicherung
Salva o ripristina in un file tutte le impostazioni accessibili sulla tastiera collegata.|Save or restore accessible settings on the connected keyboard.|Guarda o restaura los ajustes del teclado conectado.|Sauvegardez ou restaurez les réglages du clavier connecté.|Speichere oder lade die Einstellungen der verbundenen Tastatur.
Collega una tastiera compatibile per usare il backup.|Connect a compatible keyboard to use backups.|Conecta un teclado compatible para usar copias de seguridad.|Connectez un clavier compatible pour utiliser les sauvegardes.|Verbinde eine kompatible Tastatur, um Sicherungen zu nutzen.
Salva backup|Save backup|Guardar copia|Enregistrer une sauvegarde|Sicherung speichern
Ripristina backup|Restore backup|Restaurar copia|Restaurer une sauvegarde|Sicherung wiederherstellen
Verifica l’input ricevuto dal PC o i singoli switch sulla matrice.|Check system input or test individual switches in the matrix.|Comprueba la entrada o prueba los interruptores de la matriz.|Vérifiez la saisie ou testez les interrupteurs de la matrice.|Prüfe die Eingabe oder die einzelnen Schalter in der Matrix.
Pulisci|Clear|Limpiar|Effacer|Leeren
Test matrice USB|USB matrix test|Prueba de matriz USB|Test matriciel USB|USB-Matrixtest
Termina test|Stop test|Terminar prueba|Arrêter le test|Test beenden
Test della matrice|Matrix test|Prueba de matriz|Test matriciel|Matrixtest
Premi un tasto per iniziare.|Press a key to begin.|Pulsa una tecla para empezar.|Appuyez sur une touche pour commencer.|Drücke eine Taste, um zu beginnen.
Pronto.|Ready.|Listo.|Prêt.|Bereit.
Ctrl sinistro|Left Ctrl|Ctrl izquierdo|Ctrl gauche|Linke Strg
Shift sinistro|Left Shift|Mayús izquierda|Maj gauche|Linke Umschalttaste
Alt sinistro|Left Alt|Alt izquierdo|Alt gauche|Linke Alt
GUI sinistro|Left GUI|GUI izquierda|GUI gauche|Linke GUI
Ctrl destro|Right Ctrl|Ctrl derecho|Ctrl droit|Rechte Strg
Shift destro|Right Shift|Mayús derecha|Maj droite|Rechte Umschalttaste
Alt destro|Right Alt|Alt derecho|Alt droit|Rechte Alt
GUI destro|Right GUI|GUI derecha|GUI droite|Rechte GUI
La definizione VIA caricata non corrisponde agli ID USB della tastiera selezionata. Controlla il JSON e riprova.|The loaded VIA definition does not match the selected keyboard's USB IDs. Check the JSON and try again.|La definición VIA no coincide con los ID USB del teclado. Comprueba el JSON y vuelve a intentarlo.|La définition VIA ne correspond pas aux identifiants USB du clavier. Vérifiez le JSON et réessayez.|Die VIA-Definition passt nicht zu den USB-IDs der Tastatur. Prüfe die JSON-Datei und versuche es erneut.
`.trim().split("\n").map(line=>{const [it,...values]=line.split("|");return [it,values];}));
const originalText=new WeakMap();
const columns={en:0,es:1,fr:2,de:3};
function translateUi(value){
  if(uiLanguage==="it") return value;
  const parts=translations.get(value);
  return parts?.[columns[uiLanguage]] || parts?.[0] || value;
}
function translateValue(node,property){
  const current=node[property];
  const record=originalText.get(node);
  const original=record?.rendered===current?record.original:current;
  const content=original.trim();
  const rendered=content?original.replace(content,()=>translateUi(content)):original;
  originalText.set(node,{original,rendered});
  if(rendered!==current) node[property]=rendered;
}
function localizeNode(node){
  if(node.nodeType===Node.TEXT_NODE){translateValue(node,"data");return;}
  if(node.nodeType!==Node.ELEMENT_NODE || node.matches("script,style,[data-user-content]")) return;
  for(const key of ["aria-label","title","placeholder","label"]){
    const attr=node.getAttributeNode(key);
    if(attr) translateValue(attr,"value");
  }
  for(const child of node.childNodes) localizeNode(child);
}
function setUiLanguage(language){
  if(!Object.hasOwn(uiLanguages,language)) return;
  uiLanguage=language;
  document.documentElement.lang=language;
  document.querySelector("#uiLanguage").value=language;
  localizeNode(document.body);
}
document.addEventListener("DOMContentLoaded",()=>{
  const field=document.querySelector("#uiLanguage");
  field.replaceChildren(...Object.entries(uiLanguages).map(([value,title])=>new Option(title,value)));
  setUiLanguage(uiLanguage);
  new MutationObserver(records=>{
    for(const record of records){
      if(record.target.parentElement?.closest("[data-user-content]")) continue;
      if(record.type==="characterData") localizeNode(record.target);
      else for(const node of record.addedNodes) localizeNode(node);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true});
  field.addEventListener("change",()=>{setUiLanguage(field.value);updateAppearance();});
});

