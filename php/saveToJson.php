<?php
    // Program to display complete URL
    $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $url_components = parse_url($url);
    parse_str($url_components['query'], $params);
    $id = $params['id'];



    //geting new json
    $path = './json/data.json';

    header('Content-Type: application/json');
    $str_json = file_get_contents('php://input');
    $encoded_json = json_encode($str_json);
    
    //getting old json
    $data = file_get_contents($path);
    // decode json to associative array
    $json_arr = json_decode($data, true);

    //id
    $json_arr[$id] = $encoded_json;
    
    // file_put_contents($path, $json_arr);
    file_put_contents($path, json_encode($json_arr));
?>