// =============================================================================
// PARTAGE — Popup "Partager / Share" (réseaux sociaux), fonction unifiée.
// =============================================================================
// Déclenché par n'importe quel élément .btnShare (icône latérale desktop, topbar
// tablet/mobile, page-view, galerie…). Partage par défaut l'URL courante
// (window.location.href) — le routeur SPA (controller/router.js) tient déjà
// l'URL à jour pour chaque page et section (home, détail projet/blog/expertise…).
// Un déclencheur peut préciser :
//   - data-share-url   : URL spécifique à partager (sinon l'URL courante)
//   - data-share-title : titre dédié (sinon le titre du document)
//   - data-share-type="media" + data-share-image="<url absolue>" : partage d'un
//     média (image ou vidéo YouTube, cf. Section Gallerie) — révèle Pinterest,
//     qui exige une image directe et n'a de sens que pour ce cas précis.
// Pour le partage d'une PAGE (projet/expertise/blog), le cover média est
// transmis aux réseaux via les balises Open Graph générées côté serveur
// (cf. index.php, templates/partials/head.php) — ce sont elles, pas ce script
// JS, que Facebook/LinkedIn/WhatsApp exploitent en visitant l'URL partagée.
// =============================================================================
(function () {
  'use strict';

  const overlay = document.getElementById('shareOverlay');
  if (!overlay) return;

  const box        = overlay.querySelector('.shareBox');
  const titleEl    = document.getElementById('shareBoxTitle');
  const btnClose   = document.getElementById('btnCloseShare');
  const linkCopy   = document.getElementById('shareLinkCopy');
  const copyLabel  = document.getElementById('shareLinkCopyLabel');
  const links = {
    facebook:  document.getElementById('shareLinkFacebook'),
    x:         document.getElementById('shareLinkX'),
    linkedin:  document.getElementById('shareLinkLinkedin'),
    pinterest: document.getElementById('shareLinkPinterest'),
    whatsapp:  document.getElementById('shareLinkWhatsapp'),
    email:     document.getElementById('shareLinkEmail'),
  };

  let _currentUrl = '';
  let _copyResetTimer = null;

  // Pinterest exige une image directe ("media") — n'a de sens que pour le partage d'un
  // média (cf. demande : "partage d'un élément" = image ou vidéo YouTube), pas pour une page
  // ou le site. Masqué sinon (cf. _buildLinks).
  function _buildLinks(url, title, imageUrl) {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    if (links.facebook) links.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    if (links.x)        links.x.href        = `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    if (links.linkedin) links.linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    if (links.whatsapp) links.whatsapp.href = `https://api.whatsapp.com/send?text=${t}%20${u}`;
    if (links.email)    links.email.href    = `mailto:?subject=${t}&body=${u}`;
    if (links.pinterest) {
      if (imageUrl) {
        const m = encodeURIComponent(imageUrl);
        links.pinterest.href = `https://pinterest.com/pin/create/button/?url=${u}&media=${m}&description=${t}`;
        links.pinterest.style.display = '';
      } else {
        links.pinterest.style.display = 'none';
      }
    }
  }

  function openShare(triggerBtn) {
    _currentUrl = triggerBtn?.dataset.shareUrl || window.location.href;
    const title = triggerBtn?.dataset.shareTitle || document.title;
    // data-share-type="media" + data-share-image="<url absolue>" — cf. Section Gallerie
    // (partage d'une image ou d'une vidéo YouTube directement, pas de la page du site).
    const imageUrl = triggerBtn?.dataset.shareType === 'media' ? (triggerBtn?.dataset.shareImage || null) : null;
    _buildLinks(_currentUrl, title, imageUrl);
    if (titleEl) titleEl.textContent = title;
    overlay.style.display = 'flex';
  }

  function closeShare() {
    overlay.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.btnShare');
    if (trigger) {
      e.preventDefault();
      openShare(trigger);
      return;
    }
    if (overlay.style.display === 'none') return;
    if (e.target === overlay || e.target === btnClose) closeShare();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeShare();
  });

  if (box) box.addEventListener('click', (e) => e.stopPropagation());

  if (linkCopy) {
    linkCopy.addEventListener('click', () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(_currentUrl).then(() => {
        linkCopy.classList.add('shareLink--copied');
        if (copyLabel) {
          const isEn = document.documentElement.lang === 'en';
          copyLabel.textContent = isEn ? 'Link copied!' : 'Lien copié !';
        }
        clearTimeout(_copyResetTimer);
        _copyResetTimer = setTimeout(() => {
          linkCopy.classList.remove('shareLink--copied');
          if (copyLabel) {
            const isEn = document.documentElement.lang === 'en';
            copyLabel.textContent = isEn ? copyLabel.getAttribute('data-en') : copyLabel.dataset._langFr || copyLabel.getAttribute('data-en');
          }
        }, 1500);
      }).catch(() => {});
    });
  }
})();
