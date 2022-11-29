<?php
    // Program to display complete URL
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);
    $path = './json/data.json';

    header('Content-Type: application/json');    
    //url params
    $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $url_components = parse_url($url);
    parse_str($url_components['query'], $params);
    $id = $params['id'];
    //old json
    $data = file_get_contents($path);
    $json_arr = json_decode($data, true);
    $json_index = json_decode($json_arr[$id], true);
    echo json_encode($json_index);
    
    flock($file, LOCK_UN);
    fclose($file);
?>