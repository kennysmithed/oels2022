<?php
$username = explode("/", dirname(__FILE__))[2];
$server_data = "/home/".$username."/server_data";
$datapath = $server_data.'/audio';
$path = $datapath."/".$_POST["filename"].".webm";
if (substr(realpath(dirname($path)), 0, strlen($datapath))!=$datapath) {
    error_log("attempt to write to bad path: ".$path);
} else {
    copy($_FILES['filedata']['tmp_name'], $path);
}
?>
