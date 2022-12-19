<?php
$json = file_get_contents('php://input');
$obj = json_decode($json, true);
$username = explode("/", dirname(__FILE__))[2];
$filename = $obj["filename"];
$source_dir = $obj["source"];
$destination_dir = $obj["destination"];
$source_dir_path = '/home/'.$username.'/server_data/il/'.$source_dir;
$destination_dir_path = '/home/'.$username.'/server_data/il/'.$destination_dir;
$source_path = $source_dir_path.'/'.$filename;
$destination_path = $destination_dir_path.'/'.$filename;
if (substr(realpath(dirname($source_path)), 0, strlen($source_dir_path))!=$source_dir_path) {
    print("attempt to read from bad path: ".$source_dir_path);
} else {
  rename($source_path, $destination_path);
};
?>
