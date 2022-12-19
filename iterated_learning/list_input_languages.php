<?php
$username = explode("/", dirname(__FILE__))[2];
$ready_path = '/home/'.$username.'/server_data/il/ready_to_iterate';
$contents = array_diff(scandir($ready_path), array('.', '..'));
print(json_encode($contents));
?>
