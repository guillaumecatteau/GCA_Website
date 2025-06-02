<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="/controller/controller.php" method="POST">
        <label for="">Login</label>
        <input type="text" name="login">
        <label for="">Password</label>
        <input type="password" name="password">
        <input type="submit" name="bEnvoyer" value="Se connecter">
    </form>
    <a href="/vue/inscription.php">Inscrivez vous ici</a>
</body>
</html>