<?php
        header('Content-Type: application/json');
        $str_json = file_get_contents('php://input');
        $encoded_data = json_encode($str_json);
        $path = './json/names.json';
        file_put_contents($path, $encoded_data);
?>