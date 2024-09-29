// URL de ton script sur GitHub
const url = 'https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/refs/heads/main/emploidutemps.js';

// Gestionnaire de fichiers
const fm = FileManager.local();
const libPath = fm.joinPath(fm.libraryDirectory(), 'EmploiDuTemps'); // Répertoire pour le script

// Créer le répertoire s'il n'existe pas
fm.createDirectory(libPath, true);

// Télécharger le contenu du script
let req = new Request(url);
let content = await req.loadString();

// Nom du fichier à sauvegarder
const filename = url.split('/').pop();
const scriptPath = fm.joinPath(libPath, filename);

// Écrire le contenu du script dans un fichier local
fm.writeString(scriptPath, content);

// Exécuter le script téléchargé
const scriptContent = fm.readString(scriptPath);
eval(scriptContent); // Exécuter le code du script

Script.complete();
