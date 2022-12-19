/******************************************************************************/
/*** Listing, reading and saving language files *******************************/
/******************************************************************************/

/*
We need various functions which call PHP scripts which interact with saved language
files - this is how we read in a previous participant's language to use as input,
and save the current participant's output language to use as input for others. 

Language files are simply CSV files with two names columns, object (giving the image
file) and label (giving the label for that object in the language).

Most of these functions as async, since there will be a short delay as we wait for the
PHP script to read/write files on the server.
*/

/*
list_input_languages() uses list_input_languages.php to return a list of files in
server_data/il/ready_to_iterate - these are candidate input languages which can be
used for iteration.
*/

async function list_input_languages() {
    var response = await fetch("list_input_languages.php");
    // various steps to convert the string returned by the PHP script into
    // something we can work with
    var text_response = await response.text();
    var object_response = JSON.parse(text_response);
    var language_file_list = Object.values(object_response);
    return language_file_list;
  }
  
  /*
  Once we have selected an input language file, we need to read it in. This is handled
  by load_input_language.php - we simply convert the object is sends over to a usable
  array of objects using JSON.stringify.
  */
  
  async function read_input_language(input_language_filename) {
    var data_to_send = { filename: input_language_filename }; 
    var response = await fetch("load_input_language.php", {
      method: "POST",
      body: JSON.stringify(data_to_send),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
    var input_language_as_text = await response.text();
    var input_language = JSON.parse(input_language_as_text);
    return input_language;
  }
  
  /*
  At various points we need to move input language files around: we move the file from
  ready_to_iterate to undergoing_iteration when a participant starts working on a
  given file; we move the file back to ready_to_iterate if the participant abandons;
  we move the file from undergoing_iteration to completed_iteration if they complete.
  All of these are accomplished by move_input_language - we specify the file name,
  the directory to move from, and the directory to move to, and move_input_language.php
  does the moving for us.
  
  Note that this function isn't async, because we don't actually need to wait for the
  move to complete before we can proceed.
  */
  function move_input_language(input_language_filename, from_folder, to_folder) {
    var data_to_send = {
      filename: input_language_filename,
      source: from_folder,
      destination: to_folder,
    };
    fetch("move_input_language.php", {
      method: "POST",
      body: JSON.stringify(data_to_send),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  }
  
  /*
  When a participant completes the production phase, we need to save the language they
  produced in the final production test so that it can be used as input for another
  learner.  save_output_language works through object_label_list, which is a list of
  objects of the form {object:image_filename,label:'participant_label'} that is built
  during the production phase of the experiment. save_output_language builds a
  CSV string which can be directly saved to server-data/il/ready_to_iterate using the
  normal save_data function. Output languages are saved to a file chainX_gY.csv where
  X is the chain number and Y is the generation number.
  */
 
  function save_output_language(object_label_list) {
    var output_string = "object,label\n"; //column headers plus a new line
    for (object_label_pair of object_label_list) {
      //for each object_label_pair
      //append object,label\n to the end of output_string
      output_string =
        output_string +
        object_label_pair.object +
        "," +
        object_label_pair.label +
        "\n";
    }
    //work put the filename using global variables chain and generation
    var output_file_name = "chain" + chain + "_g" + generation + ".csv";
    save_data("ready_to_iterate", output_file_name, output_string);
  }
  