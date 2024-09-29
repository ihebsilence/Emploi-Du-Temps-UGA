/*
 *
 * Bienvenue sur le Widget Cours Cal. Ce script configure un widget qui affiche tes cours et passe automatiquement d'un jour à l'autre toutes les 5 secondes.
 * Tu peux personnaliser les éléments de ce widget dans la section `layout`.
 *
 */

// Spécifie la mise en page des éléments du widget.
const layout = `
  row
    column
      date
      battery
      events

    column(90)
      current
      future
`

/*
 * CODE
 * Ne modifie cette section qu'avec prudence.
 * =========================================
 */

// Variables de configuration
const codeFilename = "Widget UGA"
const gitHubUrl = "https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/refs/heads/main/emploidutemps.js"

// Gestion des fichiers iCloud
let files = FileManager.local()
const iCloudInUse = files.isFileStoredIniCloud(module.filename)

// Si iCloud est utilisé, bascule vers le FileManager iCloud
files = iCloudInUse ? FileManager.iCloud() : files

// Vérifie si le code du widget existe et le télécharge si nécessaire.
const pathToCode = files.joinPath(files.documentsDirectory(), codeFilename + ".js")
if (!files.fileExists(pathToCode)) {
  const req = new Request(gitHubUrl)
  const codeString = await req.loadString()
  files.writeString(pathToCode, codeString)
}

// Import du module
if (iCloudInUse) { await files.downloadFileFromiCloud(pathToCode) }
const code = importModule(codeFilename)

// Initialisation ou menu des paramètres
let preview
if (config.runsInApp) {
  preview = await code.runSetup(Script.name(), iCloudInUse, codeFilename, gitHubUrl)
  if (!preview) return
}

// Création du widget avec une mise à jour automatique toutes les 5 secondes
const widget = await code.createWidget(layout, Script.name(), iCloudInUse)
Script.setWidget(widget)

// Fonction pour le défilement des jours
async function autoUpdateWidget(dayIndex) {
  const today = new Date();
  widget.removeAllSubviews();

  widget.addText(`📅 Cours du ${['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayIndex % 7]}`).font = Font.boldSystemFont(16);
  widget.addSpacer(5);

  const eventsToday = await code.getEventsForDay(dayIndex % 7); // Appel aux événements du jour
  if (eventsToday.length > 0) {
    eventsToday.forEach(event => {
      const eventStack = widget.addStack();
      eventStack.layoutHorizontally();
      
      const dateFormatter = new DateFormatter();
      dateFormatter.dateFormat = "E dd/MM HH:mm";

      let eventDateText = eventStack.addText(`🕒 ${dateFormatter.string(event.start)}`);
      eventDateText.font = Font.regularSystemFont(14);
      eventDateText.textColor = Color.white();
      
      eventStack.addSpacer();
      
      let eventTitleText = eventStack.addText(`📚 ${event.title}`);
      eventTitleText.font = Font.regularSystemFont(14);
      eventTitleText.textColor = Color.white();
    });
  } else {
    widget.addText("Aucun cours aujourd'hui. 😌").font = Font.regularSystemFont(14);
  }

  widget.addSpacer();

  // Mise à jour du widget chaque 5 secondes
  setTimeout(() => autoUpdateWidget(dayIndex + 1), 5000);
}

// Si on est dans l'app, affiche un aperçu du widget avec la mise à jour automatique
if (config.runsInApp) {
  await autoUpdateWidget(new Date().getDay());

  if (preview == "small") { widget.presentSmall() }
  else if (preview == "medium") { widget.presentMedium() }
  else { widget.presentLarge() }
}

Script.complete();
