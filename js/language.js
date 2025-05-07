// document.addEventListener("DOMContentLoaded", function () {
//     const LANGUAGESELECTOR = document.querySelector("#lang");

//     // Détecter la langue du navigateur
//     const browserLang = navigator.language || navigator.userLanguage;
//     let selectedLanguage = browserLang.startsWith("fr") ? "FR" : "EN";

//     // Mettre à jour l'attribut lang de la balise <html> en fonction de la langue détectée
//     document.documentElement.setAttribute("lang", selectedLanguage.toLowerCase());

//     // Mettre à jour le sélecteur de langue
//     LANGUAGESELECTOR.value = selectedLanguage.toLowerCase();

//     // Fonction pour afficher/masquer les éléments en fonction de la langue
//     function updateLanguageDisplay(lang) {
//       // On s'assure de ne pas affecter les éléments qui n'ont pas de lang
//       const elements = document.querySelectorAll("[lang]");
//       elements.forEach(el => {
//         const elementLang = el.getAttribute("lang").toUpperCase();

//         // Seules les listes avec lang="FR" ou lang="EN" doivent être masquées ou affichées
//         if (elementLang === lang) {
//           el.classList.remove("hidden");
//         } else {
//           el.classList.add("hidden");
//         }
//       });
//     }

//     // Initialiser l'affichage avec la langue par défaut
//     updateLanguageDisplay(selectedLanguage);

//     // Mettre à jour la langue lorsque l'utilisateur change le sélecteur
//     LANGUAGESELECTOR.addEventListener("change", function () {
//       selectedLanguage = LANGUAGESELECTOR.value.toUpperCase();
      
//       // Mettre à jour l'attribut lang de la balise <html>
//       document.documentElement.setAttribute("lang", selectedLanguage.toLowerCase());
      
//       // Mettre à jour l'affichage des éléments en fonction de la langue sélectionnée
//       updateLanguageDisplay(selectedLanguage);
//     });
//   });