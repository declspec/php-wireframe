<?php
require(__DIR__ . '/controllers/error.php');
require(__DIR__ . '/services/template.php');

return function($dm) {
    $module = $dm->module('core.web', array('core'));
    
    $module->controller('ErrorController');
    $module->provider('TemplateService', 'TemplateServiceProvider');
};