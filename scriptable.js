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

      if (summaryMatch) event.title = summaryMatch[1].trim();
      if (startMatch) event.start = new Date(startMatch[1].trim());
      if (endMatch) event.end = new Date(endMatch[1].trim());

      if (event.title && event.start) {
        events.push(event);
      }
    });
  }

  return events;
}

// Fonction pour obtenir les événements de cette semaine
function getEventsThisWeek(events) {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + 7);

  return events.filter(event => event.start >= now && event.start <= endOfWeek);
}

// Fonction pour vérifier si deux dates sont dans le même jour
function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Fonction pour afficher les informations de débogage des dates
function logEventDates(events) {
  console.log("===== Débogage des événements =====");
  events.forEach(event => {
    console.log(`Titre: ${event.title}`);
    console.log(`Date de début: ${event.start}`);
    console.log(`Aujourd'hui: ${new Date()}`);
    console.log(`Même jour ? ${isSameDay(event.start, new Date())}`);
  });
}

// Création du widget avec un style et une mise en page similaires au widget CitiBike
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

  // Affichage des événements du jour
  const today = new Date();
  const dayEvents = events.filter(event => isSameDay(event.start, today));
  
  if (dayEvents.length > 0) {
    dayEvents.forEach(event => {
      let eventStack = widget.addStack();
      eventStack.layoutHorizontally();
      eventStack.centerAlignContent();

      // Date et heure de l'événement
      const dateFormatter = new DateFormatter();
      dateFormatter.dateFormat = "HH:mm";

      let eventTime = eventStack.addText(`🕒 ${dateFormatter.string(event.start)}`);
      eventTime.font = eventFont;
      eventTime.textColor = eventColor;

      eventStack.addSpacer(10);

      // Titre de l'événement
      let eventTitle = eventStack.addText(`📚 ${event.title}`);
      eventTitle.font = eventFont;
      eventTitle.textColor = eventColor;
    });
  } else {
    let noEventText = widget.addText("Aucun cours aujourd'hui 😌");
    noEventText.font = eventFont;
    noEventText.textColor = eventColor;
  }

  widget.addSpacer();

  return widget;
}

// Récupération et affichage des événements
const icsData = await fetchICSFile(icsURL);
const events = parseICS(icsData);
const weeklyEvents = getEventsThisWeek(events);

// Journalisation des dates pour le débogage
logEventDates(weeklyEvents);

if (config.runsInWidget) {
  let widget = await createWidget(weeklyEvents);
  Script.setWidget(widget);
} else {
  let widget = await createWidget(weeklyEvents);
  await widget.presentMedium();
}

Script.complete();
