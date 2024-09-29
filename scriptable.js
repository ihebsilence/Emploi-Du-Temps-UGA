// Ton code ici

// Fonction exportée pour exécuter le script
export async function createWidget() {
    // Récupération et affichage des événements
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
}
