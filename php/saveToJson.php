<?php
    //geting new json
    $path = './json/data.json';
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);

    // Program to display complete URL
    $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $url_components = parse_url($url);
    parse_str($url_components['query'], $params);
    $id = $params['id'];

    header('Content-Type: application/json');
    $str_json = file_get_contents('php://input');
        
    //getting old json
    $data = file_get_contents($path);
    // decode json to associative array
    $json_arr = json_decode($data, true);

    //id
    $json_arr[$id] = $str_json;
        
    // file_put_contents($path, $json_arr);
    file_put_contents($path, json_encode($json_arr));
    flock($file, LOCK_UN);

    fclose($file);
?>