"use strict";

const gallery = document.querySelector("[data-gallery]");
gallery.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-preview]");
  if (!button) return;
  for (const choice of gallery.querySelectorAll("button[data-preview]")) {
    const active = choice === button;
    choice.setAttribute("aria-pressed", String(active));
    document.getElementById("preview-" + choice.dataset.preview).hidden = !active;
  }
});

const siteText=new Map(`
skip|Vai al contenuto|Ir al contenido|Aller au contenu|Zum Inhalt
features|Funzioni|Funciones|Fonctionnalités|Funktionen
compatibility|Compatibilità|Compatibilidad|Compatibilité|Kompatibilität
eyebrow|Configuratore open source per tastiere custom|Configurador de código abierto para teclados personalizados|Configurateur open source pour claviers personnalisés|Open-Source-Konfigurator für individuelle Tastaturen
heroFirst|La tua tastiera,|Tu teclado,|Votre clavier,|Deine Tastatur,
heroSecond|come la vuoi.|a tu manera.|à votre façon.|wie du sie willst.
heroCopy|Rimappa i tasti, crea layer Fn e prova gli effetti RGB. Keymap Studio funziona offline e senza installazione.|Reasigna teclas, crea capas Fn y prueba efectos RGB. Keymap Studio funciona sin conexión y sin instalador.|Réaffectez les touches, créez des couches Fn et prévisualisez les effets RGB. Keymap Studio fonctionne hors ligne et sans installation.|Belege Tasten neu, erstelle Fn-Ebenen und teste RGB-Effekte. Keymap Studio funktioniert offline und ohne Installer.
download|Scarica|Descargar|Télécharger|Herunterladen
source|Vedi il codice ↗|Ver código ↗|Voir le code ↗|Quellcode ansehen ↗
demo|Modalità demo|Modo demo|Mode démo|Demomodus
caption|La mappa tasti in modalità demo.|El mapa de teclas en modo demo.|La disposition des touches en mode démo.|Die Tastenbelegung im Demomodus.
downloads|Scarica Keymap Studio|Descarga Keymap Studio|Télécharger Keymap Studio|Keymap Studio herunterladen
downloadCopy|Scegli il pacchetto portatile per il tuo sistema operativo.|Elige el paquete portátil para tu sistema.|Choisissez le paquet portable pour votre système.|Wähle das portable Paket für dein Betriebssystem.
windows|Eseguibile portatile x64|Ejecutable portátil x64|Exécutable portable x64|Portable x64-Anwendung
mac|Estrai lo ZIP e apri l’applicazione|Descomprime y abre la aplicación|Décompressez puis ouvrez l’application|ZIP entpacken und App öffnen
linux|Estrai e avvia keymap-studio|Extrae y ejecuta keymap-studio|Décompressez puis lancez keymap-studio|Entpacken und keymap-studio starten
packageNote|Il pacchetto macOS non è notarizzato. Per l’USB su Linux potrebbe servire una regola udev.|El paquete de macOS no está notarizado. El acceso USB en Linux puede requerir una regla udev.|Le paquet macOS n’est pas notarié. L’accès USB sous Linux peut nécessiter une règle udev.|Das macOS-Paket ist nicht notarisiert. Für USB unter Linux kann eine udev-Regel nötig sein.
usbHelp|Guida USB per Linux ↗|Guía USB para Linux ↗|Guide USB pour Linux ↗|USB-Anleitung für Linux ↗
featureHead|Personalizza la tua tastiera|Personaliza tu teclado|Personnalisez votre clavier|Gestalte deine Tastatur
featureIntro|Scopri cosa puoi configurare.|Explora lo que puedes configurar.|Découvrez les fonctions disponibles.|Entdecke die verfügbaren Einstellungen.
keys|Tasti e layer|Teclas y capas|Touches et couches|Tasten und Ebenen
keysCopy|Seleziona un tasto sulla mappa o premilo. Assegna un’azione, una scorciatoia o un layer Fn momentaneo.|Selecciona o pulsa una tecla. Asígnale una acción, un atajo o una capa Fn momentánea.|Sélectionnez ou pressez une touche. Affectez une action, un raccourci ou une couche Fn temporaire.|Wähle oder drücke eine Taste. Weise ihr eine Aktion, ein Kürzel oder eine temporäre Fn-Ebene zu.
layout|Layout e illuminazione|Distribución e iluminación|Disposition et éclairage|Layout und Beleuchtung
layoutCopy|Confronta le varianti fisiche, scegli le legende di dieci layout e guarda gli effetti RGB animati.|Compara variantes físicas, elige leyendas de diez distribuciones y prueba efectos RGB animados.|Comparez les variantes physiques, choisissez parmi dix dispositions et prévisualisez le RGB animé.|Vergleiche physische Varianten, wähle aus zehn Layouts und prüfe animierte RGB-Effekte.
macros|Macro e backup|Macros y copias|Macros et sauvegardes|Makros und Sicherungen
macroCopy|Configura macro, combo e manopole se supportate e salva una copia delle impostazioni.|Configura macros, combinaciones y perillas compatibles y guarda una copia de los ajustes.|Configurez macros, combinaisons et encodeurs compatibles et sauvegardez vos réglages.|Konfiguriere unterstützte Makros, Kombinationen und Drehgeber und sichere deine Einstellungen.
mapTab|Mappa tasti|Mapa de teclas|Affectation des touches|Tastenbelegung
layoutTab|Layout|Distribución|Disposition|Layout
rgbTab|Illuminazione|Iluminación|Éclairage|Beleuchtung
mapCaption|Seleziona un tasto e scegli il layer di Fn.|Selecciona una tecla y elige su capa Fn.|Sélectionnez une touche et sa couche Fn.|Wähle eine Taste und ihre Fn-Ebene.
layoutCaption|Confronta il layout attuale con la variante in anteprima.|Compara la distribución actual con la variante.|Comparez la disposition actuelle et la variante.|Vergleiche das aktuelle Layout mit der Variante.
rgbCaption|Scegli un colore e guarda l’effetto.|Elige un color y previsualiza su efecto.|Choisissez une couleur et prévisualisez l’effet.|Wähle eine Farbe und sieh dir den Effekt an.
connect|Collega la tua tastiera|Conecta tu teclado|Connectez votre clavier|Verbinde deine Tastatur
firmware|Le funzioni disponibili dipendono dal firmware installato.|Las funciones disponibles dependen del firmware.|Les fonctions disponibles dépendent du micrologiciel.|Die verfügbaren Funktionen hängen von der Firmware ab.
connectUsb|Collega via USB|Conecta por USB|Connectez en USB|Per USB verbinden
vialCopy|Apri l’app e collega la tastiera. Il layout e i layer vengono letti dal firmware.|Abre la aplicación y conecta el teclado. Se leen la distribución y las capas del firmware.|Ouvrez l’application et connectez le clavier. La disposition et les couches sont lues depuis le micrologiciel.|Öffne die App und verbinde die Tastatur. Layout und Ebenen werden aus der Firmware gelesen.
loadVia|Carica la definizione VIA|Carga la definición VIA|Chargez la définition VIA|VIA-Definition laden
viaCopy|Carica il JSON VIA del produttore e collega il modello corrispondente. Sono supportate le funzioni standard.|Importa el JSON VIA del fabricante y conecta el modelo correspondiente. Se admiten funciones estándar.|Importez le JSON VIA du fabricant et connectez le modèle correspondant. Les fonctions standard sont prises en charge.|Importiere die VIA-JSON des Herstellers und verbinde das passende Modell. Standardfunktionen werden unterstützt.
compatNote|I flussi USB sono stati verificati con dispositivi simulati. Flashing e menu VIA proprietari restano fuori da questa release.|Los flujos USB se probaron con dispositivos simulados. Esta versión no incluye flasheo ni menús propietarios de VIA.|Les flux USB ont été vérifiés avec des appareils simulés. Le flashage et les menus VIA propriétaires sont hors périmètre.|USB-Abläufe wurden mit simulierten Geräten geprüft. Flashen und proprietäre VIA-Menüs sind nicht enthalten.
openTitle|Open source|Código abierto|Open source|Open Source
openCopy|Codice e istruzioni di compilazione sono sotto GPL-2.0-or-later. Per segnalare un problema, indica modello e firmware.|El código y las instrucciones de compilación están bajo GPL-2.0-or-later. Indica el modelo y el firmware al informar de un problema.|Le code et les instructions de compilation sont sous GPL-2.0-or-later. Indiquez le modèle et le micrologiciel dans vos signalements.|Quellcode und Build-Anleitung stehen unter GPL-2.0-or-later. Gib bei Fehlerberichten Modell und Firmware an.
issue|Segnala un problema ↗|Informar de un problema ↗|Signaler un problème ↗|Problem melden ↗
releases|Tutte le versioni ↗|Todas las versiones ↗|Toutes les versions ↗|Alle Versionen ↗
`.trim().split("\n").map(line=>{const [key,...values]=line.split("|");return [key,values];}));
const defaultText=new Map([...document.querySelectorAll("[data-text]")].map(node=>[node,node.textContent]));
const languagePicker=document.querySelector("#language");
const siteLanguages={it:0,es:1,fr:2,de:3};
function changeSiteLanguage(language){
  if(language!=="en" && !Object.hasOwn(siteLanguages,language)) language="en";
  document.documentElement.lang=language;
  document.title="Keymap Studio — "+(siteText.get("eyebrow")?.[siteLanguages[language]]||"Open-source custom keyboard configurator");
  languagePicker.value=language;
  for(const [node,fallback] of defaultText) node.textContent=siteText.get(node.dataset.text)?.[siteLanguages[language]]||fallback;
}
let siteLanguage=new URLSearchParams(location.search).get("lang");
try {siteLanguage ||= localStorage.getItem("keymap-language");} catch {}
changeSiteLanguage(siteLanguage||navigator.language.split("-")[0]);
languagePicker.addEventListener("change",()=>{
  changeSiteLanguage(languagePicker.value);
  try {localStorage.setItem("keymap-language",languagePicker.value);} catch {}
});
