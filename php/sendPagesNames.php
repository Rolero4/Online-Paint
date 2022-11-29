<?php
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);
    $path = './json/names.json';

    header('Content-Type: application/json');
    $str_json = file_get_contents('php://input');
    $encoded_data = json_encode($str_json);
    file_put_contents($path, $encoded_data);
    flock($file, LOCK_UN);

    fclose($file);
?>