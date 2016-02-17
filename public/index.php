<?php
require($_SERVER['DOCUMENT_ROOT'] . '/../app/application.php');

$app = Application::bootstrap("core", null, function($app, $controller) {
    $pageController = $controller->create("PageController");
    
    $app->all("/", array($pageController, "home"));
});

$app->run();