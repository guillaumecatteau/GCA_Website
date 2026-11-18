<?php
/**
 * model_mail.php — Envoi d'emails transactionnels.
 *
 * Utilise la fonction mail() native de PHP : fonctionne telle quelle une fois le
 * site hébergé chez Infomaniak (SMTP sortant configuré par l'hébergeur pour le
 * domaine). En local (WAMP), mail() n'est generalement pas configuré — l'échec
 * d'envoi est loggé côté serveur pour le debug.
 */

/**
 * sendContactEmail — Transmet un message du formulaire de contact public
 * (section Contact de la home) à l'adresse de réception du site.
 * $fromName/$fromFirstname/$fromMail/$subject sont débarrassés de tout retour à la
 * ligne avant d'être injectés dans les headers (protection contre l'injection
 * d'en-têtes SMTP). $company/$phone sont facultatifs (chaîne vide si absents).
 */
function sendContactEmail(
    string $fromName,
    string $fromFirstname,
    string $company,
    string $fromMail,
    string $phone,
    string $subject,
    string $message
): bool
{
    $toMail = 'contact@gcdigitalarts.com';

    $cleanName      = preg_replace('/[\r\n]+/', ' ', $fromName);
    $cleanFirstname = preg_replace('/[\r\n]+/', ' ', $fromFirstname);
    $cleanMail      = preg_replace('/[\r\n]+/', '', $fromMail);
    $cleanSubject   = preg_replace('/[\r\n]+/', ' ', $subject);
    $cleanCompany   = preg_replace('/[\r\n]+/', ' ', $company);
    $cleanPhone     = preg_replace('/[\r\n]+/', ' ', $phone);

    $mailSubject = "[Formulaire de contact] $cleanSubject";

    $body  = "Nouveau message depuis le formulaire de contact du site.\n\n";
    $body .= "Nom       : $cleanName\n";
    $body .= "Prénom    : $cleanFirstname\n";
    if ($cleanCompany !== '') $body .= "Compagnie : $cleanCompany\n";
    $body .= "Email     : $cleanMail\n";
    if ($cleanPhone !== '')   $body .= "Téléphone : $cleanPhone\n";
    $body .= "Sujet     : $cleanSubject\n\n";
    $body .= "Message :\n$message\n";

    $fromAddr = 'no-reply@gcdigitalarts.com';
    $headers  = "From: GC Digital Arts <$fromAddr>\r\n";
    $headers .= "Reply-To: $cleanFirstname $cleanName <$cleanMail>\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = @mail($toMail, $mailSubject, $body, $headers);
    if (!$sent) {
        error_log("sendContactEmail: échec d'envoi du message de contact (expéditeur: $cleanMail)");
    }
    return $sent;
}
