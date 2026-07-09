const BACKG_MOTIF = document.getElementById('backgMotif');
const BACKG_BLUR  = document.getElementById('backgBlur');

// Affiche l'overlay flou + motif (navigation vers sous-page)
// withMotif=false : blur seul sans le motif (ex: prévisualisation scène)
function displayBackBlurMask(withMotif = true) {
  if (withMotif) BACKG_MOTIF.style.opacity = 0.5;
  BACKG_BLUR.style.backdropFilter = 'blur(30px)';
}

// Retire l'overlay flou et le motif
function hideBackBlurMask() {
  BACKG_MOTIF.style.opacity       = 0;
  BACKG_BLUR.style.backdropFilter = 'blur(0px)';
}

// Point d'entree appele par start.js - delegue a Three.js
function startBackground() {
  window.GCABackground?.init();
}