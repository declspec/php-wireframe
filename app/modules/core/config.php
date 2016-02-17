<?php
require(__DIR__ . '/controllers/page.php');

return function($dm) {
    $module = $dm->module("core", array());
   
    // Register controllers
    $module->controller("PageController");
};