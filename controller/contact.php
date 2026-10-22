<?php
/**
 * contact.php — Formulaire de contact public (section Contact de la home).
 * Valide les champs côté serveur puis envoie un email via model_mail.php
 * (cf. sendContactEmail, même convention que sendResetPasswordEmail : mail()
 * natif, fonctionnel une fois le site hébergé, silencieux/loggé en local).
 *
 * Sécurité : tous les champs passent par ProtectInjection() (trim + htmlspecialchars),
 * même convention que les autres formulaires du site (register.php...) — neutralise
 * toute tentative d'injection HTML/JS. Les champs utilisés dans les en-têtes email
 * (nom, prénom, mail, sujet) sont en plus débarrassés des retours à la ligne dans
 * sendContactEmail() pour empêcher l'injection d'en-têtes SMTP.
 */
header('Content-Type: application/json');
require_once('../model/model.php'); // ProtectInjection()
require_once('../model/model_mail.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$name      = ProtectInjection($_POST['name'] ?? '');
$firstname = ProtectInjection($_POST['firstname'] ?? '');
$company   = ProtectInjection($_POST['company'] ?? '');
$mail      = ProtectInjection($_POST['mail'] ?? '');
$phone     = ProtectInjection($_POST['phone'] ?? '');
$subject   = ProtectInjection($_POST['subject'] ?? '');
$message   = ProtectInjection($_POST['message'] ?? '');

// Champs obligatoires : nom, prénom, email, sujet, message (compagnie/téléphone facultatifs)
if (!$name || !$firstname || !$mail || !$subject || !$message) {
    echo json_encode(['success' => false, 'code' => 'MISSING_FIELD', 'message' => 'Merci de remplir tous les champs obligatoires.']);
    exit;
}
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'code' => 'INVALID_MAIL', 'message' => 'Adresse email non valide.']);
    exit;
}
if (
    mb_strlen($name) > 100 || mb_strlen($firstname) > 100 || mb_strlen($company) > 150 ||
    mb_strlen($phone) > 30 || mb_strlen($subject) > 150 || mb_strlen($message) > 2000
) {
    echo json_encode(['success' => false, 'code' => 'FIELD_TOO_LONG', 'message' => 'Un des champs dépasse la longueur autorisée.']);
    exit;
}

$sent = sendContactEmail($name, $firstname, $company, $mail, $phone, $subject, $message);

echo json_encode($sent
    ? ['success' => true, 'code' => 'CONTACT_SENT', 'message' => 'Message envoyé.']
    : ['success' => false, 'code' => 'MAIL_ERROR', 'message' => 'Une erreur technique est survenue.']);
