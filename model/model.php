<?php

require_once('db.php');

function ProtectInjection($donnees)
{
    return htmlspecialchars(trim($donnees));
}
