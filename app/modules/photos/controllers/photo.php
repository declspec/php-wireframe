<?php
class PhotoController {
    private $_photoService;
    
    public function __construct($PhotoService) {
        $this->_photoService = $PhotoService;   
    }
    
    public function index($req, $res) {
        $res->send($this->_photoService->test());
    }   
}