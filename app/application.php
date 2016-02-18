<?php
require(__DIR__ . '/configuration.php');
require(__DIR__ . '/vendor/php-di/dm.php');
require(__DIR__ . '/vendor/php-router/router.php');

class Application extends Router {
    public function __construct($baseUrl=null) {
        parent::__construct($baseUrl);
    }
    
    public static function bootstrap($appName, $config, callable $runFn=null) {
        $app = new Application($config->baseUrl);
        
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

        $dm->createInjector(array(function($provide) use(&$app, &$config) {
            $provide->constant("app", $app);
            $provide->constant("config", $config);
        }, $appName));
        
        return $app;
    }
    
    public static function configure($appName, $env) {
        $baseDirectory = __DIR__ . '/config';

        $config = array_merge(
            self::loadConfig($baseDirectory, $env), 
            self::loadConfig($baseDirectory . '/' . $appName, $env)
        );
        
        if (!isset($config["env"]))
            $config["env"] = $env;
        
        return new Configuration($config);
    }
    
    private static function loadConfig($directory, $env) {
        if (!is_dir($directory))
            return array(); // no config found
            
        $default = @include($directory . '/default.php');
        if (!is_array($default))
            $default = array();
        
        if ($env) {
            $envSpecific = @include($directory . '/' . strtolower($env));
            if (is_array($envSpecific))
                $default = array_merge($default, $envSpecific);
        }
        
        return $default;
    }
};