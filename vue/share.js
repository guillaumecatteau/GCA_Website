// =============================================================================
// PARTAGE — Popup "Partager / Share" (réseaux sociaux)
// =============================================================================
// Déclenché par n'importe quel élément .btnShare (topbar desktop/tablet/mobile,
// page-view…). Partage toujours l'URL courante (window.location.href) — le
// routeur SPA (controller/router.js) tient déjà l'URL à jour pour chaque page
// et chaque section (home, détail projet/blog/expertise…), donc aucune logique
// de construction d'URL n'est nécessaire ici.
// Un déclencheur peut préciser un titre dédié via data-share-title (ex: titre
// d'un projet/article en page-view) ; à défaut le titre du document est utilisé.
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
    facebook: document.getElementById('shareLinkFacebook'),
    x:        document.getElementById('shareLinkX'),
    linkedin: document.getElementById('shareLinkLinkedin'),
    whatsapp: document.getElementById('shareLinkWhatsapp'),
    email:    document.getElementById('shareLinkEmail'),
  };

  let _currentUrl = '';
  let _copyResetTimer = null;

  function _buildLinks(url, title) {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    if (links.facebook) links.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    if (links.x)        links.x.href        = `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    if (links.linkedin) links.linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    if (links.whatsapp) links.whatsapp.href = `https://api.whatsapp.com/send?text=${t}%20${u}`;
    if (links.email)    links.email.href    = `mailto:?subject=${t}&body=${u}`;
  }

  function openShare(triggerBtn) {
    _currentUrl = triggerBtn?.dataset.shareUrl || window.location.href;
    const title = triggerBtn?.dataset.shareTitle || document.title;
    _buildLinks(_currentUrl, title);
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
