// =============================================================================
// USER PROFILE — Espace utilisateur connecté (infos + messagerie avec l'admin)
// =============================================================================
(function () {
  'use strict';

  let _ownMail = null; // mémorisé après le fetch des infos, réutilisé par "Réinitialiser le mot de passe"

  function _fmtDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function _loadInfo() {
    fetch('controller/user_profile.php')
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const u = json.user;
        _ownMail = u.mail;
        document.getElementById('userProfileInfoName').textContent = u.name || '';
        document.getElementById('userProfileInfoFirstname').textContent = u.firstname || '';
        document.getElementById('userProfileInfoMail').textContent = u.mail || '';
        document.getElementById('userProfileInfoSubscription').textContent = _fmtDate(u.subscription);
        document.getElementById('userProfileInfoNewsletter').textContent = (+u.newsletter) ? 'Oui' : 'Non';
      })
      .catch(() => {});
  }

  function _renderChatThread(messages) {
    const thread = document.getElementById('userChatThread');
    if (!thread) return;
    thread.innerHTML = '';
    messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = 'chatBubble ' + (+msg.is_admin_reply ? 'chatBubble--other' : 'chatBubble--self');
      const text = document.createElement('p');
      text.className = 'chatBubbleText';
      text.textContent = msg.message;
      const meta = document.createElement('span');
      meta.className = 'chatBubbleMeta';
      meta.textContent = new Date(msg.created_at).toLocaleString('fr-FR');
      bubble.appendChild(text);
      bubble.appendChild(meta);
      thread.appendChild(bubble);
    });
    thread.scrollTop = thread.scrollHeight;
  }

  function _loadChat() {
    fetch('controller/user_chat.php')
      .then(r => r.json())
      .then(json => { if (json.success) _renderChatThread(json.messages); })
      .catch(() => {});
  }

  function _sendChatMessage() {
    const input = document.getElementById('userChatInput');
    const message = input.value.trim();
    if (!message) return;
    const btn = document.getElementById('btnUserChatSend');
    btn.classList.add('btnOff');
    fetch('controller/user_chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) { input.value = ''; _loadChat(); }
        btn.classList.remove('btnOff');
      })
      .catch(() => btn.classList.remove('btnOff'));
  }

  function _switchTab(tab) {
    document.querySelectorAll('.userProfileTabBtn').forEach(btn => {
      btn.classList.toggle('userProfileTabBtn--active', btn.dataset.tab === tab);
    });
    document.getElementById('userProfileTabInfo').style.display = tab === 'info' ? 'flex' : 'none';
    document.getElementById('userProfileTabChat').style.display = tab === 'chat' ? 'flex' : 'none';
    if (tab === 'chat') _loadChat();
  }

  function _resetOwnPassword() {
    if (!_ownMail) return;
    const btn = document.getElementById('btnResetOwnPassword');
    const msg = document.getElementById('msgResetOwnPassword');
    btn.classList.add('btnOff');
    const formData = new FormData();
    formData.append('mail', _ownMail);
    fetch('controller/forgot_password.php', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(json => {
        msg.textContent = json.message;
        msg.style.display = 'block';
        btn.classList.remove('btnOff');
      })
      .catch(() => btn.classList.remove('btnOff'));
  }

  // Appelé par navigation.js à chaque affichage de l'espace utilisateur (displayUserProfile)
  window._initUserProfile = function () {
    _switchTab('info');
    _loadInfo();

    document.getElementById('btnUserProfileTabInfo').onclick = () => _switchTab('info');
    document.getElementById('btnUserProfileTabChat').onclick = () => _switchTab('chat');
    document.getElementById('btnResetOwnPassword').onclick = _resetOwnPassword;
    document.getElementById('btnUserChatSend').onclick = _sendChatMessage;
    document.getElementById('userChatInput').oninput = (e) => {
      document.getElementById('btnUserChatSend').classList.toggle('btnOff', !e.target.value.trim());
    };
  };

  // ── Page de réinitialisation (lien reçu par email, ?token=...) ──────────────
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  window._initResetPassword = function (token) {
    const inputPassword = document.getElementById('inputPasswordReset');
    const inputConfirm  = document.getElementById('inputPasswordConfirmReset');
    const errPassword   = document.getElementById('passwordErrorTextReset');
    const errConfirm    = document.getElementById('passwordConfirmErrorTextReset');
    const btnSubmit     = document.getElementById('btnSubmitResetPassword');
    const msg           = document.getElementById('msgResetPasswordPage');

    function validate() {
      const validPassword = PASSWORD_REGEX.test(inputPassword.value);
      const match = inputPassword.value === inputConfirm.value && inputConfirm.value !== '';
      errPassword.style.display = (!validPassword && inputPassword.value) ? 'block' : 'none';
      errConfirm.style.display = (!match && inputConfirm.value) ? 'block' : 'none';
      btnSubmit.classList.toggle('btnOff', !(validPassword && match));
    }
    inputPassword.oninput = validate;
    inputConfirm.oninput = validate;

    btnSubmit.onclick = (e) => {
      e.preventDefault();
      if (btnSubmit.classList.contains('btnOff')) return;
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', inputPassword.value);
      fetch('controller/reset_password.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(json => {
          msg.textContent = json.message;
          msg.style.display = 'block';
          if (json.success) {
            btnSubmit.classList.add('btnOff');
            setTimeout(() => { window.location.href = '/'; }, 2000);
          }
        })
        .catch(() => { msg.textContent = 'Erreur technique ! Réessayez.'; msg.style.display = 'block'; });
    };
  };
})();
