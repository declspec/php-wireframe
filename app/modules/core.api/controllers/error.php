<?php
class ErrorController {
    private $_apiService;
    
    public function __construct($ApiService) {
        $this->_apiService = $ApiService;
    }
    
    public function notFound($req, $res) {
        $this->_apiService->sendNotFound($res);
    }
    
    public function serverError($err, $req, $res) {
        $message = 'An unexpected error occurred when processing your request.';
        
        if ($err instanceof CheckedException) {
            $message = $err->getMessage();
            $err = $err->getUncheckedException();
        }
        
        if ($err !== null) {
            // TODO: Log the exception somewhere   
        }
        
        $this->_apiService->sendServerError($res, $message);
    }
};