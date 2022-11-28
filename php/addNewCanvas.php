<?php
    //geting new json
    $path = './json/data.json';
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);

    header('Content-Type: application/json');
    $str_json = file_get_contents('php://input');
    $encoded_json = json_encode($str_json);


    //getting old json
    $data = file_get_contents($path);
    // decode json to associative array
    $json_arr = json_decode($data, true);

    array_push($json_arr, $str_json);

    // file_put_contents($path, $json_arr);
    file_put_contents($path, json_encode($json_arr));
    flock($file, LOCK_UN);

    fclose($file);
?>