<?php
class CheckedException extends Exception {    
    public function getUncheckedException() {
        return $this->getPrevious();
    }
    
    public function __construct($message, Exception $uncheckedException = null) {
        parent::__construct($message, 0, $uncheckedException);   
    }
};