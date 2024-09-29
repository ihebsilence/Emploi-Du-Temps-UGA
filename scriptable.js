// Variables utilisées par Scriptable.
// icon-color: deep-green; icon-glyph: magic;

const widgetInputRAW = args.widgetParameter;
const icsURL = widgetInputRAW || 'https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/main/ADE.ics';

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

// Fonction pour obtenir les événements d'un jour spécifique
function getDayEvents(events, day) {
  return events.filter(event => event.start.getDay() === day);
}

// Ajout d'une fonction de mise à jour automatique pour changer de jour toutes les 5 secondes
async function updateWidget(widget, dayIndex) {
  const dayEvents = getDayEvents(weeklyEvents, dayIndex % 7);

  // Efface le contenu précédent
  widget.removeAllSubviews();

  widget.addText(`📅 Cours du ${['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayIndex % 7]}`).font = Font.boldSystemFont(16);
  widget.addSpacer(5);

  if (dayEvents.length > 0) {
    dayEvents.forEach(event => {
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
    let noEventsText = widget.addText("Aucun cours aujourd'hui. 😌");
    noEventsText.font = Font.regularSystemFont(14);
    noEventsText.textColor = Color.white();
  }

  widget.addSpacer();

  // Requête pour une mise à jour toutes les 5 secondes (fonctionne dans l'app mais pas sur l'écran d'accueil)
  setTimeout(() => updateWidget(widget, dayIndex + 1), 5000);
}

// Récupération et analyse des données ICS
const icsData = await fetchICSFile(icsURL);
const events = parseICS(icsData);
const weeklyEvents = getEventsThisWeek(events);

// Création du widget
let widget = new ListWidget();
widget.setPadding(10, 10, 10, 10);

// Style du widget
const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [
  new Color('17A589'),
  new Color('48C9B0')
];
widget.backgroundGradient = gradient;

// Initialisation avec le jour actuel
const todayIndex = new Date().getDay();
updateWidget(widget, todayIndex);

// Présentation du widget
if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
  Script.complete();
}
