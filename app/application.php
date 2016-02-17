<?php
require(__DIR__ . '/vendor/php-di/dm.php');
require(__DIR__ . '/vendor/php-router/router.php');

class Application extends Router {
    public function __construct($baseUrl=null) {
        parent::__construct($baseUrl);
    }
    
    public static function bootstrap($appName, $baseUrl, callable $runFn=null) {
        $app = new Application($baseUrl);
        
        // Create the dependency manager with a basic module resolver
        // to load missing modules.
        $dm = new DependencyManager(function($name, $manager) {
            $fn = require(__DIR__ . "/modules/{$name}/config.php");
            if (!is_callable($fn))
                throw new UnexpectedValueException("configuration for module '{$name}' did not return a callable expression");
            
            call_user_func($fn, $manager);
        });

        // Attach the 'runFn' if one is provided.
        if ($runFn !== null) 
            $dm->module($appName)->run($runFn);

        $dm->createInjector(array(function($provide) use(&$app) {
            $provide->constant("app", $app);
        }, $appName));
        
        return $app;
    }
};