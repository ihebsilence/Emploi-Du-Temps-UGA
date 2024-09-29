// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: cloud-download;

const scriptURL = "https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/refs/heads/main/emploidutemps.js";

async function fetchAndRunScript(url) {
    const req = new Request(url);
    
    try {
        const scriptContent = await req.loadString();
        console.log("Script downloaded successfully.");
        
        // Affichage du contenu du script pour vérification
        console.log(scriptContent);

        eval(scriptContent); // Évalue le script téléchargé
    } catch (error) {
        console.error("Error during fetching or executing script: ", error);
    }
}

// Récupérer et exécuter le script
await fetchAndRunScript(scriptURL);
