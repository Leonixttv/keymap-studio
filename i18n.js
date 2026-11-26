"use strict";
const uiLanguages={en:"English",it:"Italiano",es:"Español",fr:"Français",de:"Deutsch"};
const suggested=navigator.language.split("-")[0];
let uiLanguage=Object.hasOwn(uiLanguages,suggested)?suggested:"en";
const translations=new Map(`
Modalità demo|Demo mode|Modo demo|Mode démo|Demomodus
Collega via USB|Connect via USB|Conectar por USB|Connecter en USB|Per USB verbinden
Scollega|Disconnect|Desconectar|Déconnecter|Trennen
USB scollegato|USB disconnected|USB desconectado|USB déconnecté|USB getrennt
Torna alla demo|Back to demo|Volver a la demo|Retour à la démo|Zurück zur Demo
CONFIGURATORE USB · VIAL E VIA|USB CONFIGURATOR · VIAL AND VIA|CONFIGURADOR USB · VIAL Y VIA|CONFIGURATEUR USB · VIAL ET VIA|USB-KONFIGURATOR · VIAL UND VIA
Tastiere custom|Custom keyboards|Teclados personalizados|Claviers personnalisés|Individuelle Tastaturen
Esplora la mappa demo o collega la tua tastiera.|Try the demo or connect your keyboard.|Prueba la demo o conecta tu teclado.|Essayez la démo ou connectez votre clavier.|Probiere die Demo aus oder verbinde deine Tastatur.
Definizione VIA|VIA definition|Definición VIA|Définition VIA|VIA-Definition
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
