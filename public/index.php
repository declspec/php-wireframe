<?php
require($_SERVER['DOCUMENT_ROOT'] . '/../app/application.php');

$app = Application::bootstrap(array("core.api"), "dev", function($app, $controller) {
    $errorController = $controller->create("ErrorController");
    
    $app->all("/", function() {
        echo "index.php";
    });

    $app->all('*', array($errorController, "notFound"));
    $app->error(array($errorController, "serverError"));
});

$app->run();