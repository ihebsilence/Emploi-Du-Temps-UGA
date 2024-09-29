// Variables utilisées par Scriptable.
// icon-color: deep-green; icon-glyph: magic;

const icsURL = 'https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/main/ADE.ics';

// Fonction pour récupérer le fichier ICS
async function fetchICSFile(url) {
  const req = new Request(url);
  const icsData = await req.loadString();
  return icsData;
}

// Fonction pour analyser le fichier ICS
function parseICS(icsData) {
  const events = [];
  const eventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;
  const matches = icsData.match(eventRegex);

  if (matches) {
    matches.forEach(eventData => {
      const event = {};
      const summaryMatch = eventData.match(/SUMMARY:(.*)/);
      const startMatch = eventData.match(/DTSTART.*:(.*)/);
      const endMatch = eventData.match(/DTEND.*:(.*)/);
      const locationMatch = eventData.match(/LOCATION:(.*)/);

      if (summaryMatch) event.title = summaryMatch[1].trim();
      if (startMatch) {
        event.start = new Date(startMatch[1].trim()); // Convertir en objet Date
      }
      if (endMatch) {
        event.end = new Date(endMatch[1].trim());
      }
      if (locationMatch) event.location = locationMatch[1].trim();

      if (event.title && event.start) {
        events.push(event);
      }
    });
  }

  return events;
}

// Fonction pour vérifier si une date est dans la même semaine que la date actuelle
function isSameWeek(date) {
  const today = new Date();
  const dayOfWeek = today.getDay();  // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const startOfWeek = new Date(today);  
  startOfWeek.setDate(today.getDate() - dayOfWeek);  // Fixer au dimanche précédent

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);  // Fixer au samedi de la semaine

  return date >= startOfWeek && date <= endOfWeek;
}

// Fonction pour vérifier si l'événement correspond au jour actuel
function isSameDay(eventDate, currentDate) {
  return eventDate.getDate() === currentDate.getDate() &&
         eventDate.getMonth() === currentDate.getMonth() &&
         eventDate.getFullYear() === currentDate.getFullYear();
}

// Création du widget pour afficher les événements du jour actuel
async function createWidget(events) {
  let darkBlue = new Color("#333d72", 1);
  let lightBlue = new Color("#3d99ce", 1);

  let gradient = new LinearGradient();
  gradient.colors = [Color.dynamic(Color.white(), darkBlue), Color.dynamic(Color.white(), lightBlue)];
  gradient.locations = [0, 1];

  let widget = new ListWidget();
  widget.backgroundGradient = gradient;

  // Style et couleur des textes
  let titleFont = Font.boldSystemFont(18);
  let eventFont = Font.regularSystemFont(14);
  let titleColor = Color.white();
  let eventColor = Color.white();

  // Ajout du titre
  let header = widget.addStack();
  header.centerAlignContent();
  let title = header.addText(`📅 Cours de la semaine`);
  title.font = titleFont;
  title.textColor = titleColor;

  widget.addSpacer(10);

  // Vérification des événements de la semaine
  const today = new Date();
  const weekEvents = events.filter(event => isSameWeek(event.start));

  if (weekEvents.length > 0) {
    weekEvents.forEach(event => {
      // Filtrer les événements du jour actuel uniquement
      if (isSameDay(event.start, today)) {
        let eventStack = widget.addStack();
        eventStack.layoutHorizontally();
        eventStack.centerAlignContent();

        // Date et heure de l'événement
        const dateFormatter = new DateFormatter();
        dateFormatter.dateFormat = "HH:mm";

        let eventTime = eventStack.addText(`🕒 ${dateFormatter.string(event.start)} - ${dateFormatter.string(event.end)}`);
        eventTime.font = eventFont;
        eventTime.textColor = eventColor;

        eventStack.addSpacer(10);

        // Titre de l'événement et lieu
        let eventTitle = eventStack.addText(`📚 ${event.title} - ${event.location || 'Lieu non spécifié'}`);
        eventTitle.font = eventFont;
        eventTitle.textColor = eventColor;
      }
    });
  } else {
    let noEventText = widget.addText("Aucun cours cette semaine 😌");
    noEventText.font = eventFont;
    noEventText.textColor = eventColor;
  }

  widget.addSpacer();

  return widget;
}

// Récupération et affichage des événements du fichier ICS
const icsData = await fetchICSFile(icsURL);
const events = parseICS(icsData);

if (config.runsInWidget) {
  let widget = await createWidget(events);
  Script.setWidget(widget);
} else {
  let widget = await createWidget(events);
  await widget.presentMedium();
}

Script.complete();
