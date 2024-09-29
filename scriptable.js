// URL du script à télécharger
const url = 'https://raw.githubusercontent.com/ihebsilence/Emploi-Du-Temps-UGA/refs/heads/main/emploidutemps.js';

// Initialiser le gestionnaire de fichiers
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

// Importer et exécuter le script téléchargé
const scriptModule = importModule(scriptPath);
await scriptModule.main(); // Assure-toi que le script a une fonction main()
Script.complete();
