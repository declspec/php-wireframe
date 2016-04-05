<?php
require(__DIR__ . '/../../../vendor/smarty/Smarty.class.php');

class TemplateServiceProvider {
    private $_compileDir=null;
    private $_templateDir=null;
    private $_cacheDir=null;
    private $_globals=array();
    
    public function setCompileDirectory($directory) {
        $this->_compileDir = $directory;   
    }   
    
    public function setTemplateDirectory($directory) {
        $this->_templateDir = $directory;   
    }
    
    public function setCacheDirectory($directory) {
        $this->_cacheDir = $directory;   
    }
    
    public function addGlobals(array $globals) {
        $this->_globals = array_merge($this->_globals, $globals);
    }
    
    public function addGlobal($name, $value) {
        $this->_globals[$name] = $value;   
    }
    
    public function _get() {
        return new TemplateService($this->_compileDir, $this->_templateDir, $this->_cacheDir, $this->_globals);   
    }
};

class TemplateService {    
    private $_compileDir;
    private $_templateDir;
    private $_cacheDir;
    private $_globals;
    
    public function __construct($compileDir, $templateDir, $cacheDir, $globals) {
        $this->_compileDir = $compileDir;
        $this->_templateDir = $templateDir;
        $this->_cacheDir = $cacheDir;   
        $this->_globals = $globals;
    }
    
    public function render($view, array $variables = null) {
        $smarty = new Smarty();
        
        if ($this->_templateDir)
            $smarty->setTemplateDir($this->_templateDir);
        
        if ($this->_compileDir)
            $smarty->setCompileDir($this->_compileDir);

        if ($this->_cacheDir)
            $smarty->setCompileDir($this->_compileDir);
            
        if ($variables !== null) {
            foreach($variables as $key=>$value)
                $smarty->assign($key, $value);   
        }

        $smarty->assign('global', $this->_globals);
        return $smarty->fetch($view);
    } 
};