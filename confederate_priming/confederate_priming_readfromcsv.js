/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
This is a version of the code that reads the trial list from a CSV file.

Everything is the same as confederate_priming.js, except towards the end where 
we introduce some code to read from CSV.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv"); //dump the data to screen
  },
});

/******************************************************************************/
/*** Maintaining a list of images to preload **********************************/
/******************************************************************************/

//initially our images_to_preload list contains only 1 image, the microphone!
var images_to_preload = ["mic"];

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

/*
This is the save_data function provided in Alisdair's tutorial, section 06. 
*/
function save_data(name, data_in) {
  var url = "save_data.php";
  var data_to_send = { filename: name, filedata: data_in };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data_to_send),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
}

function save_confederate_priming_data(data) {
  // choose the data we want to save - this will also determine the order of the columns
  if (data.participant_task == "picture_selection") {
    var button_choices_as_string = data.button_choices.join(",");
    var data_to_save = [
      participant_id,
      data.trial_index,
      data.participant_task,
      data.recording_counter,
      data.time_elapsed,
      data.stimulus,
      "NA",
      "NA", //'missing' target and foil image
      button_choices_as_string,
      data.response,
      data.button_selected,
      data.rt,
    ];
  } else if (data.participant_task == "picture_description") {
    var data_to_save = [
      participant_id,
      data.trial_index,
      data.participant_task,
      data.recording_counter,
      data.time_elapsed,
      "NA", //'missing' sound file
      data.target,
      data.foil,
      "NA",
      "NA", //'missing' button_choices for description trials
      "NA", //'missing' data.response
      "NA", //'missing' button_selected
      data.rt,
    ];
  }
  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  var this_participant_filename = "cp_" + participant_id + ".csv";
  save_data(this_participant_filename, line);
}

/******************************************************************************/
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

var participant_id = jsPsych.randomization.randomID(10);

/******************************************************************************/
/*** Random waits *************************************************************/
/******************************************************************************/

function random_wait() {
  return 1800 + Math.floor(Math.random() * 1200);
}

/******************************************************************************/
/*** Picture selection trials *************************************************/
/******************************************************************************/

function make_picture_selection_trial(sound, target_image, foil_image) {
  //add target_image and foil_image to our preload list
  images_to_preload.push(target_image);
  images_to_preload.push(foil_image);

  //create sound file name
  var sound_file = "sounds/" + sound + ".wav";

  //generate random wait and random order of images
  var wait_duration = random_wait();
  var shuffled_image_choices = jsPsych.randomization.shuffle([
    target_image,
    foil_image,
  ]);

  //trial for the delay before the partner starts speaking
  var waiting_for_partner = {
    type: jsPsychAudioButtonResponse,
    stimulus: "sounds/silence.wav",
    prompt: "<p><em>Click on the picture your partner described</em></p>",
    choices: shuffled_image_choices,
    trial_duration: wait_duration,
    response_ends_trial: false, //just ignore any clicks the participant makes here!
    button_html:
      '<button class="jspsych-btn"> <img src="images/%choice%.png" width=250px></button>',
  };
  //audio trial
  var selection_trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file,
    prompt: "<p><em>Click on the picture your partner described</em></p>",
    choices: shuffled_image_choices,
    button_html:
      '<button class="jspsych-btn"> <img src="images/%choice%.png" width=250px></button>',
    post_trial_gap: 500, //a little pause after the participant makes their choice
    on_start: function (trial) {
      trial.data = {
        participant_task: "picture_selection",
        button_choices: shuffled_image_choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.button_choices[button_number];
      save_confederate_priming_data(data); //save the trial data
    },
  };
  var full_trial = { timeline: [waiting_for_partner, selection_trial] };
  return full_trial;
}

/******************************************************************************/
/*** Picture description trials ********************************************/
/******************************************************************************/

function make_picture_description_trial(target_image, foil_image) {
  //add target_image and foil_image to our preload list
  images_to_preload.push(target_image);
  images_to_preload.push(foil_image);

  //generate random wait and random order of images
  var wait_duration = random_wait();
  var shuffled_images = jsPsych.randomization.shuffle([
    target_image,
    foil_image,
  ]);
  var left_image = shuffled_images[0];
  var right_image = shuffled_images[1];
  //need to highlight the target with a green border - first need to work out whether
  //the target is on the left or the right!
  if (left_image == target_image) {
    var composite_image =
      "<img src=images/" +
      left_image +
      ".png width=250px style='border:5px solid green;'> <img src=images/" +
      right_image +
      ".png  width=250px>";
  } else {
    var composite_image =
      "<img src=images/" +
      left_image +
      ".png width=250px> <img src=images/" +
      right_image +
      ".png  width=250px style='border:5px solid green;'>";
  }
  var picture_plus_white_mic = {
    type: jsPsychHtmlButtonResponse,
    stimulus: composite_image,
    prompt: "<p><em>Describe the picture in the green box</p></em>",
    choices: ["mic"],
    button_html:
      '<button class="jspsych-btn" style="background-color: white;"> <img src="images/%choice%.png" width=75px></button>',
  };
  var picture_plus_orange_mic = {
    type: jsPsychHtmlButtonResponse,
    stimulus: composite_image,
    choices: ["mic"],
    prompt: "<p><em>Describe the picture in the green box</p></em>",
    button_html:
      '<button class="jspsych-btn" style="background-color: Darkorange;"> <img src="images/%choice%.png" width=75px></button>',
    on_start: function (trial) {
      trial.data = {
        participant_task: "picture_description",
        target: target_image,
        foil: foil_image,
      };
      start_recording(participant_id);
    },
    on_finish: function (data) {
      data.recording_counter = recording_counter;
      stop_recording();
      save_confederate_priming_data(data);
    },
  };
  var waiting_for_partner = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Waiting for partner to select",
    choices: [],
    trial_duration: wait_duration,
    post_trial_gap: 500, //short pause after the confederate makes their selection
  };
  var full_trial = {
    timeline: [
      picture_plus_white_mic,
      picture_plus_orange_mic,
      waiting_for_partner,
    ],
  };
  return full_trial;
}

/******************************************************************************/
/*** Write headers for data file **********************************************/
/******************************************************************************/

var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    var this_participant_filename = "cp_" + participant_id + ".csv";
    save_data(
      this_participant_filename,
      "participant_id,trial_index,participant_task,recording_counter,time_elapsed,sound_file,target_image,foil_image,button_choice0,button_choice1,response,button_selected,rt\n"
    );
  },
};

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3> \
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant \
  what they will be doing, how their data will be used, and how they will be \
  remunerated.</p> \
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed \
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};

var audio_permission_instructions1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Permission to access your microphone</h3>\
  <p style='text-align:left'>In this experiment you will be interacting with another participant. \
  You will be recording audio descriptions using your microphone, and listening to \
  descriptions your partner has recorded.</p>\
  <p style='text-align:left'><b>On the next screen we will ask for permission to access your microphone</b>. \
  When the pop-up appears asking for permission to access your microphone, please grant \
  access, otherwise the experiment won't work. </p>\
  <p style='text-align:left'>We will only record when you click the record button - you are always in control.</p>",
  choices: ["Continue"],
  on_finish: function () {
    request_mic_access();
  },
};

var audio_permission_instructions2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Grant permission to access your microphone</h3>\
  <p style='text-align:left'>Please grant us permission to access you microphone in the pop-up, then \
  click below to continue.</p>",
  choices: ["I have granted mic access and am ready to continue"],
};

var pre_interaction_instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Instructions for interaction</h3>\
  <p style='text-align:left'>During the experiment, you will alternate between describing pictures \
  to your partner and matching pictures your partner describes to you.</p>\
  <p style='text-align:left'>When it is your turn to describe, you will see two pictures, one of which \
  will be highlighted with a green box. You should <u>describe the picture highlighted in the green box</u> to \
  your partner. There are no rules as to what you can or cannot say; you can name the object if you like. \
  Remember that your partner sees the same two pictures, but they may not be in the same positions \
  (left/right).</p>\
  <p style='text-align:left'>When it is your turn to match, simply click on the picture your partner \
  describes to you.</p>",
  choices: ["I have granted mic access and am ready to continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment.</p>\
  <p style='text-align:left'>Click Continue to finish the experiment and see your raw data. \
  Your trial was also saved to the server trial by trial.</p>",
  choices: ["Continue"],
};

/******************************************************************************/
/*** Reading the trial list from a CSV file ***********************************/
/******************************************************************************/

/*
This function reads the trial list provided in triallist_filename (using code in a 
separate file, read_from_csv.js), and converts it to a series of jsPsych trials. 
We read the trial list in as a javascript array using read_trial_list (defined 
in read_from_csv.js). Since reading the CSV file takes some time, we have to 
use the async and await functions to ensure that the CSV file has been read before we 
start processing it. We then use build_timeline to turn the array into a list of jsPsych 
trials. 
*/

async function read_trials_and_prepare_timeline(triallist_filename) {
  var trial_list = await read_trial_list(triallist_filename);
  var interaction_trials = build_timeline(trial_list);
  var preload_trial = build_button_image_preload();
  var full_timeline = [].concat(
    consent_screen,
    audio_permission_instructions1,
    audio_permission_instructions2,
    preload_trial,
    write_headers,
    pre_interaction_instructions,
    interaction_trials,
    final_screen
  );
  jsPsych.run(full_timeline);
}

/*
build_timeline takes a trial list read from a CSV and uses make_picture_selection_trial
and make_picture_description_trial to convert each row of that CSV file into a jsPsych trial, 
reading the relevant info from the appropriate columns in the CSV data structure.
*/
function build_timeline(trial_list) {
  var interaction_trials = [];
  for (trial of trial_list) {
    if (trial.participantRole == "match") {
      var match_trial = make_picture_selection_trial(
        trial.soundFile,
        trial.targetImage,
        trial.distractorImage
      );
      interaction_trials.push(match_trial);
    } else if (trial.participantRole == "direct") {
      var direct_trial = make_picture_description_trial(
        trial.targetImage,
        trial.distractorImage
      );
      interaction_trials.push(direct_trial);
    }
  }
  return interaction_trials;
}

/*
This simply wraps up the code to build the preload trial into a function, so we 
can call it once we've created our trial list (which will have built images_to_preload
for us).
*/

function build_button_image_preload() {
  var images_to_preload_with_path = [];
  for (image of images_to_preload) {
    var full_image_name = "images/" + image + ".png";
    images_to_preload_with_path.push(full_image_name);
  }

  /*
Now we can make our preload trial
*/
  var preload = {
    type: jsPsychPreload,
    auto_preload: true,
    images: images_to_preload_with_path,
  };

  return preload;
}

/*
Finally, run the code to read the trial list and start the experiment - I have
provided two trial lists, overspecific_confederate.csv (a confederate who always produces
redundant colour adjectives) and minimal_confederate.csv (who never does).
*/
read_trials_and_prepare_timeline("overspecific_confederate.csv");
