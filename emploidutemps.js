// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
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

// Récupérer les données ICS
const icsData = await fetchICSFile(icsURL);

// Analyser le fichier ICS pour extraire les événements
const events = parseICS(icsData);

// Filtrer les événements de la semaine
const weeklyEvents = getEventsThisWeek(events);

// Détermination du jour actuel pour le défilement
const today = new Date();
const dayOfWeek = today.getDay(); // 0 (dimanche) à 6 (samedi)
const dayEvents = weeklyEvents.filter(event => event.start.getDay() === dayOfWeek);

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

// Affichage des événements du jour
widget.addText("Cours du jour").font = Font.boldSystemFont(16);
widget.addSpacer(5);

if (dayEvents.length > 0) {
  dayEvents.forEach(event => {
    const eventStack = widget.addStack();
    eventStack.layoutHorizontally();
    
    const dateFormatter = new DateFormatter();
    dateFormatter.dateFormat = "E dd/MM HH:mm";

    let eventDateText = eventStack.addText(`${dateFormatter.string(event.start)}`);
    eventDateText.font = Font.regularSystemFont(14);
    eventDateText.textColor = Color.white();
    
    eventStack.addSpacer();
    
    let eventTitleText = eventStack.addText(event.title);
    eventTitleText.font = Font.regularSystemFont(14);
    eventTitleText.textColor = Color.white();
  });
} else {
  let noEventsText = widget.addText("Aucun cours aujourd'hui.");
  noEventsText.font = Font.regularSystemFont(14);
  noEventsText.textColor = Color.white();
}

widget.addSpacer();

// Présenter le widget ou le définir
if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
  Script.complete();
}

// Pour le défilement, tu pourrais envisager de programmer un autre script qui met à jour le widget chaque jour
