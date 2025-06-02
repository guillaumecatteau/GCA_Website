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