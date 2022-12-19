/*
This file contains some CSV-reading utilities to be used in conjunction with 
confederate_priming_readfromcsv.js - specifically, it includes code to fetch 
a CSV file from confederate_priming/trial_lists/ and convert the contents of 
that file to a javascript array, which can then be used to build a trial list.
*/

/*
This function reads the trial list provided in triallist_filename and converts it
to a javascript array. We use fetch to get the file contents, .text() to retrieve the 
text content of the file, and then use process_data to turn a text representation 
of the contents of the CSV file into a more usable javascript representation.
*/

async function read_trial_list(triallist_filename) {
  var full_filename = "trial_lists/" + triallist_filename;
  var response = await fetch(full_filename);
  var csv_as_text = await response.text();
  var trial_list = process_data(csv_as_text);
  return trial_list;
}

/*
process_data takes a CSV file which has been read as a series of strings seperated by
commas and newlines and turns it into an array of javascript objects, where the column
headers in the CSV file become the parameters of the javascript objects, one object
per line in the CSV file. For example, the CSV file:

column1_title,column2_title
row1_data1,row1_data2
row2_data1,row2_data2

becomes
[
{column1_title:row1_data1,column2_title:row1_data2},
{column1_title:row2_data1,column2_title:row2_data2},
]

NB this code is based on https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
*/
function process_data(raw_data) {
  var raw_data_lines = raw_data.split(/\r\n|\n/); //split at newlines to get rows
  var headers = raw_data_lines[0].split(","); //first row is headers
  var processed_data = [];
  for (var i = 1; i < raw_data_lines.length; i++) {
    //iterate through lines
    var data = raw_data_lines[i].split(","); //split columns at commas
    if (data.length == headers.length) {
      //check number of columns matches
      var trial_object = {};
      for (var j = 0; j < headers.length; j++) {
        //iterate through columns
        trial_object[headers[j]] = data[j]; //add column:data to trial_object
      }
    }
    processed_data.push(trial_object);
  }
  return processed_data;
}
