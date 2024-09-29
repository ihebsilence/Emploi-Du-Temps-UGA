// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: cloud-download;

const scriptURL = "https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/refs/heads/main/emploidutemps.js";

async function fetchAndRunScript(url) {
    const req = new Request(url);
    const scriptContent = await req.loadString();
    
    try {
        eval(scriptContent); // Évalue le script téléchargé
    } catch (error) {
        console.error("Error executing script: ", error);
    }
}

// Récupérer et exécuter le script
await fetchAndRunScript(scriptURL);
