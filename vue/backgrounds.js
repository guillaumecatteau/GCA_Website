const BACKG_MOTIF = document.getElementById('backgMotif');
const BACKG_BLUR  = document.getElementById('backgBlur');

// Appele lors de la navigation vers une sous-page (affiche l'overlay flou)
function displayBackBlurMask() {
  BACKG_MOTIF.style.opacity       = 0.5;
  BACKG_BLUR.style.backdropFilter = 'blur(30px)';
}

// Appele lors du retour a l'accueil (retire l'overlay flou)
function hideBackBlurMask() {
  BACKG_MOTIF.style.opacity       = 0;
  BACKG_BLUR.style.backdropFilter = 'blur(0px)';
}

// Point d'entree appele par start.js - delegue a Three.js
function startBackground() {
  window.GCABackground?.init();
}