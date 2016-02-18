<?php
require($_SERVER['DOCUMENT_ROOT'] . '/../app/application.php');

$config = Application::configure("core.api", "dev");

$app = Application::bootstrap("core.api", $config, function($app, $controller) {
    $errorController = $controller->create("ErrorController");
    
    $app->all("/", function() {
        throw new Exception("Test Exception"); 
    });

    $app->all('*', array($errorController, "notFound"));
    $app->error(array($errorController, "serverError"));
});

$app->run();