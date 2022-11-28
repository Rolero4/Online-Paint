<?php
    $file = fopen("semafor.txt","w+");
    flock($file, LOCK_EX);
        header('Content-Type: application/json');
        $path = './json/names.json';
        $jsonString = file_get_contents($path);
        $jsonData = json_decode($jsonString, true);
        echo $jsonData;
        flock($file, LOCK_UN);

        fclose($file);
?>