<?php
require(__DIR__ . '/controllers/photo.php');
require(__DIR__ . '/services/photo.php');

return function($dm) {
    $module = $dm->module("photos", array());
    
    $module->service("PhotoService");
    $module->controller("PhotoController");  
};