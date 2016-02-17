<?php
class PageController {
    public function __construct() {
        
    }
    
    public function home($req, $res) {
        $res->send("<h1>Home Page</h1>");   
    }   
}