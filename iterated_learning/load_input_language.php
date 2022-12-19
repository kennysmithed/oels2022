<?php
$json = file_get_contents('php://input');
$obj = json_decode($json, true);
$username = explode("/", dirname(__FILE__))[2];
$filename = $obj["filename"];
$server_data_ready_path = '/home/'.$username.'/server_data/il/ready_to_iterate';
$server_data_undergoing_path = '/home/'.$username.'/server_data/il/undergoing_iteration';
$path = $server_data_ready_path.'/'.$filename;
$mv_path = $server_data_undergoing_path.'/'.$filename;
if (substr(realpath(dirname($path)), 0, strlen($server_data_ready_path))!=$server_data_ready_path) {
    print("attempt to read from bad path: ".$path);
} else {

  $csv = array_map('str_getcsv', file($path));
  array_walk($csv, function(&$a) use ($csv) {
        $a = array_combine($csv[0], $a);
      });
  array_shift($csv); # remove column header

  #return the read-in csv
  print(json_encode($csv));
};
?>
