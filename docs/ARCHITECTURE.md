# Architecture du site — GC Digital Arts

Ce document explique comment le site est construit et comment ses principaux mécanismes
fonctionnent (routage, rendu des pages publiques, responsive, admin tool, build CSS). Il sert
de point d'entrée pour comprendre rapidement le projet avant d'y intervenir.

## 1. Stack & principes généraux

- **Backend** : PHP procédural (pas de framework), un seul point d'entrée `index.php`.
- **Frontend** : HTML généré côté PHP (templates) + JavaScript vanilla (pas de framework JS).
  Le site se comporte comme une **SPA maison** : une seule page HTML est chargée, toutes les
  "pages" (home, portfolio, bio, admin tool...) sont des blocs déjà présents dans le DOM,
  affichés/masqués en JS (`style.display`), jamais de rechargement de page pendant la navigation.
- **Base de données** : MySQL (`gcwebsite`), accès via PDO (`model/db.php`).
- **CSS** : SCSS compilé vers `vue/assets/css/main.css` (voir § 7).
- **Fond 3D** : Three.js (`vue/threejs-background.js`, `vue/backgrounds.js`).

## 2. Structure des dossiers

```
controller/       Logique serveur (routes API, auth, upload) + routeur SPA (router.js)
model/            Accès BDD (un fichier par entité : pages, medias, tags, users, comments)
templates/
  admin/          Vues de l'admin tool (un fichier par section : pages, medias, tags, users...)
  pages/          Vues des pages publiques (home, bio, portfolio, page-view...)
  partials/       Fragments réutilisés partout (topbar, nav mobile/tablette/desktop, head, scripts)
vue/              JS applicatif (un fichier par domaine) + tout le CSS/SCSS + assets images
  assets/scss/    Sources SCSS (abstracts / base / layout / components)
database/         Schéma SQL (gcwebsite.sql = état courant, migration_v2.sql = historique)
```

Convention : chaque "section" a généralement 3 fichiers qui se répondent —
`templates/admin/xxx.php` (HTML), `vue/xxx.js` ou logique dans `admintool.js` (comportement),
`controller/admin/xxx.php` + `model/model_xxx.php` (API + BDD).

## 3. Cycle de vie d'une page (SPA maison)

1. `index.php` charge TOUT le HTML (topbar, menus, ET tous les conteneurs de page
   `#cntHOME`, `#cntPAGEVIEW`, `#cntBLOG`, `#cntADMINTOOL`...) en une seule requête.
   Chaque conteneur est masqué par défaut (`style="display:none"`).
2. `controller/start.js` joue l'intro (logo, fond 3D) puis appelle soit la home normale, soit
   `window._routerInit()` / `window._routerNavigate()` si l'URL chargée n'est pas `/` (deep link).
3. Naviguer = appeler une fonction `accessXxx()` (définie dans `vue/navigation.js`) :
   - masque le conteneur courant (`unloadPage()`, fade-out),
   - après un délai (~500ms, le temps du fade), affiche le nouveau conteneur
     (`displayXxx()` : `style.display = "flex"` + fade-in) et met à jour l'état
     (`_setPage(key)` → variable globale `page` + URL via l'API History).
4. `controller/router.js` gère l'URL (pushState/popstate) : associe une **page-key**
   (`page` = `"home" | "portfolio" | "pageView" | "adminTool" | ...`) à un slug (`/portfolio`,
   `/p/{slug}`...), et route les retours arrière navigateur vers la bonne fonction `accessXxx()`.

Pas de vrai routeur déclaratif : chaque nouvelle page nécessite un couple
`accessXxx()` / `displayXxx()` dans `navigation.js` + une entrée dans les tables `_SLUG`/`_ROUTES`
de `router.js` si elle doit avoir une URL dédiée.

## 4. Pages projet / expertise / blog (`page-view`)

Un seul template public (`templates/pages/page-view.php`) sert les 3 types de contenu
(`pages.type = projet|expertise|blog`), rendu dynamiquement par `vue/page-view.js` :

- `window._loadPageView(slug)` fetch `controller/controller.php?action=admin_pages&sub=get_by_slug`
  et appelle `_renderMain()` (cover + titre + blocs de contenu) puis `_renderSide()` (détails :
  client/dates/tags, ou timeline d'expériences, ou carrousels "liés").
- **Cover vidéo** : si `pages.cover_video_url` est renseigné (admin), un bouton play apparaît
  sur la cover ; au clic, une iframe YouTube se charge en fondu par-dessus (jamais préchargée).
- **Responsive** (voir aussi § 5) : le right panel (`#pageViewSide`) est un unique élément DOM
  déplacé par `_positionSide()` — sous le left panel en desktop (grille 2 colonnes), ou
  directement entre le titre et le premier bloc de contenu en tablette/mobile (pas une "popup"
  supplémentaire : son style de carte disparaît une fois inséré dans le flux).

## 5. Système responsive

### Seuils (source unique)

| Seuil | Valeur | SCSS (`_variables.scss` / `_mixins.scss`) | JS (`vue/breakpoints.js`) |
|---|---|---|---|
| Mobile | 800px | `$bp-mobile` / `@include mobile` | `window.BP_MOBILE`, `isMobileMode()` |
| Tablette (réservé) | 1024px | `$bp-tablet` / `@include tablet` (actuellement inutilisé) | `window.BP_TABLET` |
| Burger / stacking | 1917px | `$bp-header` / `@include wide-header` | `window.BP_HEADER`, `isStackedMode()` |

Le seuil qui déclenche le menu burger et l'empilement des pages publiques est **1917px**
(`wide-header`/`isStackedMode`), **pas** 1024px (`$bp-tablet`, réservé pour un usage futur).
La plage "tablette pure" (empilé mais pas mobile) est couverte par le mixin SCSS
`@include tablet-range` et son équivalent JS `window.isTabletRange()`.

`vue/breakpoints.js` est chargé en tout premier (avant `navigation.js`/`router.js`/
`page-view.js`, cf. `templates/partials/scripts.php`) : **toute nouvelle logique responsive en
JS doit utiliser ses fonctions** (`isStackedMode()`, `isTabletRange()`, `isMobileMode()`,
`isDesktopMode()`) plutôt que redéclarer des constantes locales `800`/`1917`.

### 3 modes de navigation, mutuellement exclusifs

- **Desktop** (> 1917px) : menu latéral `#sectionNav` (accueil) + `.mainNavContainerDesktop`.
- **Tablette** (800–1917px) : menu `.navTablet` (panneau plein écran depuis le burger).
- **Mobile** (≤ 800px) : menu `.navMobile` + burger repositionné en bas à droite, main logo
  masqué sauf sur la home (`body.page-home`, togglé en JS à chaque changement de `page`).

Chaque nouvel élément de chrome "desktop-only" doit explicitement se masquer dans
`@include wide-header` — rien n'est caché par défaut par la seule largeur d'écran.

## 6. Admin tool — réservé au desktop

L'admin tool (`/admin`, `/admin/users`, ...) n'est accessible qu'en mode desktop
(`window.isAdminAllowed()` = `isDesktopMode()`), à 3 niveaux de garde :

1. UI : les boutons d'accès (`btnDirectAdmin`, `btnAdminLog`) sont dans `.topBarDesktop`,
   déjà masqué en tablette/mobile.
2. Routage : `controller/router.js` redirige toute route admin (`window.ADMIN_ROUTE_KEYS`,
   cf. `vue/breakpoints.js`) vers `home` si `!isAdminAllowed()`.
3. Résilience : `accessAdminTool()` (navigation.js) a le même garde en entrée, et un listener
   `resize` éjecte vers la home si la fenêtre repasse sous le seuil desktop pendant qu'on est
   déjà dans l'admin tool.

Sections de l'admin tool : Utilisateurs, Tags, Médias, Pages, Expériences, **Commentaires**
(modération : masquer/supprimer les commentaires publics des pages), **Messagerie** (boîte de
réception : répondre aux messages privés envoyés par les utilisateurs depuis leur espace
compte), Analytics, Éditeur de scène.

## 6bis. Espace utilisateur & messagerie privée

- Accessible en cliquant son nom dans la topbar desktop (`#btnUserLogDesktop` → `accessUserProfile()`).
- Deux onglets (`templates/pages/userprofile.php`, piloté par `vue/user-profile.js`) :
  **Informations** (nom/prénom/email/date d'inscription/newsletter, + bouton "Réinitialiser le
  mot de passe") et **Messagerie** (chat direct avec l'admin).
- Le chat réutilise la table `comments` : `page_id NULL` = message de messagerie privée (pas un
  commentaire public sur une page), `is_admin_reply` distingue l'auteur, `read_at` alimente les
  compteurs non-lus. Voir `model/model_comments.php` (fonctions `*Chat*`) et l'admin tool section
  "Messagerie" (`templates/admin/messages.php`) pour le pendant côté admin (liste des fils +
  réponse).
- Réinitialisation de mot de passe par email : `controller/forgot_password.php` génère un
  token (`users.reset_token`) et envoie un lien `/?token=...` par email (`model/model_mail.php`,
  `mail()` natif — nécessite un hébergement avec SMTP sortant configuré, ex. Infomaniak, pas de
  config supplémentaire requise en prod). Le lien est intercepté tout en haut de
  `startSequence()` (controller/start.js), avant l'intro normale, et affiche directement
  `#cntRESETPASSWORD` via `window.accessResetPassword(token)`.

## 7. Build CSS (SCSS)

```
npm run scss:build   # compilation unique, minifiée (vue/assets/css/main.css)
npm run scss:watch   # recompilation auto + source maps (dev)
```

PowerShell bloque `npm run ...` en exécution directe (policy) → utiliser
`cmd /c "npm run scss:build"`. Le navigateur charge le CSS **compilé**, jamais les fichiers
`.scss` directement — toujours rebuild après une modif SCSS pour vérifier dans le navigateur.

Organisation des sources (`vue/assets/scss/`) :
- `abstracts/` — variables, mixins (aucune règle CSS générée directement).
- `base/` — reset + styles de base.
- `layout/` — structure globale (nav, grilles).
- `components/` — un fichier par fonctionnalité (page-view, admintool, sections...).

## 8. Système de design (résumé — voir mémoire repo pour le détail complet)

- Fond sombre (`$color-bg`), textes clairs par défaut (`$color-text-muted`), blanc
  (`$color-text-primary`) réservé à l'état actif/focus.
- Composants canoniques déjà définis : `.formInput`/`.formSelect`/`.formTextarea` (champs),
  `.expActionBtn` (icône cliquable générique), `.glass-block` (mixin, panneaux translucides),
  `.tagItem`/`.expCardTag` (tags), `.btnMedium`/`.btnSmall` (boutons).
- Toute icône cliquable suit le même pattern hover (`scale(1.1)`, transition "bounce"),
  jamais de nouveau système de hover inventé au cas par cas.
- Border-radius standardisés : `$radius-sm` (champs/tags), `$radius-md` (cartes de liste),
  `$radius-lg` (panneaux).

## 9. Environnement de dev local

- Apache sur le port **8080**, vhost `gcwebsite` → `http://gcwebsite:8080/` (ne pas utiliser
  `localhost:8080/GCA_Website/`, le site a un `<base href="/">`).
- PHP : `C:\wamp64\bin\php\php8.2.26\php.exe`. MySQL : base `gcwebsite`.
- Accès rapide à l'admin tool en dev (uniquement en desktop, cf. § 6) : bouton `#btnDirectAdmin`
  dans la topbar, ou en console après l'intro (~4s) : `window.accessAdminTool()`.
