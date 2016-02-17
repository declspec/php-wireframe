<?php
require($_SERVER['DOCUMENT_ROOT'] . '/../app/application.php');

$baseUrl = substr(__DIR__, strlen($_SERVER["DOCUMENT_ROOT"]));

$app = Application::bootstrap("photos", $baseUrl, function($app, $controller) {
    $photoController = $controller->create("PhotoController");
    
    $app->all("/", array($photoController, "index"));
});

$app->run();