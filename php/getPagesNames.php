<?php
        header('Content-Type: application/json');
        $path = './json/names.json';
        $jsonString = file_get_contents($path);
        $jsonData = json_decode($jsonString, true);
        echo $jsonData;
?>