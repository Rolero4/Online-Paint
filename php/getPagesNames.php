<?php
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);
    $path = './json/names.json';

    header('Content-Type: application/json');
    $jsonString = file_get_contents($path);
    $jsonData = json_decode($jsonString, true);
    echo $jsonData;

    flock($file, LOCK_UN);
    fclose($file);
?>