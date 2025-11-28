const BACKG_HOME = document.getElementById("backgroundHome");
const BACKG_MOTIF = document.getElementById("backgMotif");
// const BACKG_GRADIENT = document.querySelector(".backgrounds::after");
const BACKG_BLUR = document.getElementById("backgBlur");

function displayBackBlurMask () {
  BACKG_MOTIF.style.opacity = 0.5;
  BACKG_BLUR.style.backdropFilter = "blur(30px)";
}

function hideBackBlurMask () {
  BACKG_MOTIF.style.opacity = 0;
  BACKG_BLUR.style.backdropFilter = "blur(0px)";
}
// --------------------------------------
// Preloading des backgrounds desktop et mobile
// --------------------------------------
function preloadBackgroundDesktop() {
  const backgrounds = [
    "bck_Anim_Desktop.mp4",
    "bck_F1_Desktop.png",
    "bck_F2_Desktop.png",
    "bck_F3_Desktop.png",
    "bck_F4_Desktop.png",
    "bck_F5_Desktop.png",
    "bck_F6_Desktop.png",
    "bck_F7_Desktop.png"
  ];
  const base = "vue/assets/images/Backgrounds/";
  backgrounds.forEach(file => {
    if (file.endsWith('.mp4')) {
      const video = document.createElement('video');
      video.src = base + file;
      video.preload = 'auto';
    } else {
      const img = new Image();
      img.src = base + file;
    }
  });
}
function preloadBackgroundMobile() {
  const backgrounds = [
    "bck_Anim_Mobile.mp4",
    "bck_F1_Mobile.png",
    "bck_F2_Mobile.png",
    "bck_F3_Mobile.png",
    "bck_F4_Mobile.png",
    "bck_F5_Mobile.png",
    "bck_F6_Mobile.png",
    "bck_F7_Mobile.png"
  ];
  const base = "vue/assets/images/Backgrounds/";
  backgrounds.forEach(file => {
    if (file.endsWith('.mp4')) {
      const video = document.createElement('video');
      video.src = base + file;
      video.preload = 'auto';
    } else {
      const img = new Image();
      img.src = base + file;
    }
  });
}
// --------------------------------------
// Démarrage du background selon le device
// --------------------------------------
function startBackground() {
  const deviceType = window.getAnimationDevice(); // Utilise la détection centralisée
  const base = "vue/assets/images/Backgrounds/";
  const loopIds = ["backF2","backF3","backF4","backF5","backF6","backF7"];
  const loopSrcs = [2,3,4,5,6,7].map(i => base + `bck_F${i}_${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}.png`);

  // Preload F2 first
  const f2Img = document.getElementById("backF2");
  f2Img.src = loopSrcs[0];
  f2Img.onload = () => {
    // Insert the rest of the loop images into the DOM
    for (let i = 1; i < loopIds.length; i++) {
      const img = document.getElementById(loopIds[i]);
      if (img) {
        img.src = loopSrcs[i];
      }
    }
    // Start the animation sequence
    startBackgroundAnim();
  };

  // Preload video and F1 as before
  if (deviceType === "desktop") {
    preloadBackgroundDesktop();
  } else {
    preloadBackgroundMobile();
  }
}

function startBackgroundAnim() {
  const deviceType = window.getAnimationDevice() === "desktop" ? "Desktop" : "Mobile";
  const base = "vue/assets/images/Backgrounds/";
  const videoId = "backAnim";
  const videoSrc = base + (deviceType === "Desktop" ? "bck_Anim_Desktop.mp4" : "bck_Anim_Mobile.mp4");
  const f1Id = "backF1";
  const f1Src = base + (deviceType === "Desktop" ? "bck_F1_Desktop.png" : "bck_F1_Mobile.png");
  const loopIds = ["backF2","backF3","backF4","backF5","backF6","backF7"];
  const loopSrcs = [2,3,4,5,6,7].map(i => base + `bck_F${i}_${deviceType}.png`);

  // 1. Préload F2 puis push les autres images dans le DOM
  let loaded = 0;
  let loopImgs = [];
  loopSrcs.forEach((src, idx) => {
    const img = document.getElementById(loopIds[idx]);
    if (!img) return;
    img.style.opacity = 0;
    // F2 ne doit JAMAIS avoir de transition
    if (idx === 0) {
      img.style.transition = "none !important";
    } else {
      img.style.transition = "opacity 4s linear";
    }
    img.src = src;
    img.onload = () => {
      loaded++;
      if (loaded === 1) {
        // Dès que F2 est préloadée, on peut commencer à afficher les autres
        loopImgs = loopIds.map(id => document.getElementById(id));
      }
    };
  });

  // 2. Préload et affichage vidéo
  const videoEl = document.getElementById(videoId);
  videoEl.src = videoSrc;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.autoplay = true;
  videoEl.load();
  videoEl.style.opacity = 1;
  videoEl.onended = () => {
    // Figer sur la dernière frame
    try { videoEl.currentTime = Math.max(0, (videoEl.duration || 0) - 0.05); } catch(e){}
    videoEl.pause();
    videoEl.style.opacity = 1;
    // F1 fade in
    const f1El = document.getElementById(f1Id);
    const f2El = document.getElementById("backF2");
    f1El.style.backgroundImage = `url('${f1Src}')`;
    f1El.style.transition = "opacity 0.3s linear";
    f1El.style.opacity = 1;
    // F2 doit être visible sous F1 dès que F1 atteint 100% - SANS transition
    f2El.style.transition = "none !important";
    f2El.style.opacity = 1;
    setTimeout(() => {
      // F1 fade out
      f1El.style.transition = "opacity 2s linear";
      f1El.style.opacity = 0;
      // Attendre la fin du fade out avant de démarrer le loop
      setTimeout(() => {
        videoEl.style.opacity = 0;
        loopBackground(loopImgs);
      }, 2000); // 2000ms = durée du fade out
    }, 300);
  };
}

function loopBackground(loopImgs) {
  if (!loopImgs || loopImgs.length !== 6) return;
  let i = 0;
  let prev = loopImgs.length - 1;
  // Initialisation : F2 visible EN PERMANENCE, autres cachées
  loopImgs.forEach((img, idx) => {
    img.style.opacity = idx === 0 ? 1 : 0;
    if (idx === 0) {
      img.style.transition = "none !important"; // F2 sans transition
    } else {
      img.style.transition = "opacity 4s linear"; // F3-F7 avec transition pour fade in seulement
    }
  });    function crossfadeLoop() {
    prev = i;
    i = (i+1)%loopImgs.length;
    
    // Si on revient à F2, ne pas faire de transition
    if (i === 0) {
      return;
    }
    
    // L'image suivante fait son fade in de 4s PAR DESSUS les précédentes
    loopImgs[i].style.transition = "opacity 4s linear";
    loopImgs[i].style.opacity = 1;
    
    // Supprimer l'image précédente une fois que la nouvelle a fait son fade in
    // SAUF pour F7 qui a un traitement spécial
    if (i !== 5 && prev > 0) {
      setTimeout(() => {
        loopImgs[prev].style.opacity = 0;
      }, 4000); // Suppression après le fade in complet
    }
    
    // Traitement spécial pour F7 : fade out vers F2 uniquement
    if (i === 5) {
      setTimeout(() => {
        // F7 fait son fade out de 4s vers F2 (qui est toujours là en dessous)
        loopImgs[5].style.transition = "opacity 4s linear";
        loopImgs[5].style.opacity = 0;
        // Reset instantané des autres images pour le prochain cycle
        // À ce stade, seules F2 (toujours visible) et F7 (en fade out) sont visibles
        for (let j = 1; j < 5; j++) {
          loopImgs[j].style.opacity = 0;
        }
      }, 4000); // F7 fade out après 4s
    }
  }
  crossfadeLoop();
  window._loopTimer && clearInterval(window._loopTimer);
  window._loopTimer = setInterval(crossfadeLoop, 4000);
}

window.startBackground = startBackground; // Signifie la fonction startBackground comme fonction globale




