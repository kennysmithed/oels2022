/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
The experiment features two main trial types - picture selection (which is where
we present ambiguous sounds to alter people's phoneme boundary) and phoneme categorization
(where we test whether we have shifted their boundary).
Picture selection: hear a noun phrase plus two pictures, click on a picture
Phoneme categorization: hear a word, click on a button indicating if it was teen or dean.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/*
As usual, we will dump all the trials on-screen at the end so you can see what's
going on. Note that data on critical trials is saved trial-by-trial as the experiment
runs, so unlike the word learning experiment we don't need to save all the data at 
the end of the experiment.
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv"); //dump the data to screen
  },
});

/******************************************************************************/
/*** Social network questionnaire *********************************************/
/******************************************************************************/

/*
A partial implementation of the questions given at https://doi.org/10.1371/journal.pone.0183593.s005.
Fairly straightforward use of the survey-html-form plugin - note that all the
inputs are set to required.
 */

var social_network_questionnaire = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<p style='text-align:left'> <b>Social network questionnaire</b></p>\
              <p style='text-align:left'> In this questionnaire we would like to \
              gather information about your linguistic interactions. We realize \
              that some of the estimates are difficult to make. Please do your \
              best and be as accurate as possible.</p> \
              <p style='text-align:left'> Important: When providing estimates for \
              your exposure in a week, keep in mind that your habits may vary \
              considerably depending on the day of the week (e.g., weekday vs. weekend). \
              Please be as accurate as possible and do not simply multiply your \
              estimate for one day by 7.</p>",
  html: "<p style='text-align:left'>How old are you? <br> \
              <input required name='age' type='number'></p> \
         <p style='text-align:left'>With how many people do you converse orally \
         in a typical week? (Please only include people with whom you regularly \
           talk for longer than 5 minutes)<br> \
              <input required name='n_speak_to' type='number'></p> \
           <p style='text-align:left'>How many hours do you usually spend on \
           conversing orally with people in a typical week?<br>\
              <input required name='hours_speak_to' type='number'></p>",
};

/******************************************************************************/
/*** Picture selection trials *************************************************/
/******************************************************************************/

/*
Picture selection: hear a noun phrase plus two pictures, click on a picture
*/

/*
make_picture_selection_trial takes the base name of the sound file to present,
true/false for whether to use the manipulated audio version, and then the base
names of the target and foil pictures. It works out the path and full filename for
the audio file, and then returns an audio-button-response trial using that stimulus 
plus the two images as choices.

We use button_html to use the choices parameter as the names of image files, resulting 
in buttons which are images.

The left-right order of the buttons is randomised at the start of each trial, and
we record that randomisation order in trial.data as data.button_choices. Then at 
the end of the trial we figure out which image was selected, and also use 
save_perceptual_learning_data_line to save the trial data.
*/
function make_picture_selection_trial(
  sound,
  manipulated,
  target_image,
  foil_image
) {
  if (manipulated) {
    //manipulated files have "_man" (for manipulated) stuck on the end of the file name
    var sound_file = "picture_selection_sounds/" + sound + "_man.mp3";
  } else {
    var sound_file = "picture_selection_sounds/" + sound + ".mp3";
  }

  var trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file, //use the sound_file name we created above
    choices: [target_image, foil_image], //these will be shuffled on_start
    button_html:
      '<button class="jspsych-btn"> <img src="picture_selection_images/%choice%.jpg" width=250px></button>',
    post_trial_gap: 500, //a little pause between trials

    //at the start of the trial, randomise the left-right order of the choices
    //and note that randomisation in data as button_choices
    on_start: function (trial) {
      var shuffled_label_choices = jsPsych.randomization.shuffle(trial.choices);
      trial.choices = shuffled_label_choices;
      trial.data = {
        block: "picture_selection",
        button_choices: shuffled_label_choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.button_choices[button_number];
      save_perceptual_learning_data_line(data); //save the trial data
    },
  };
  return trial;
}

/*
Using make_picture_selection_trial to make a short list of picture selection trials, and shuffle it
*/
var selection_trials_unshuffled = [
  make_picture_selection_trial(
    "fresh_dill", 
    true, 
    "fresh_dill", 
    "dry_dill"
  ),
  make_picture_selection_trial(
    "orange_telephone",
    false,
    "orange_telephone",
    "black_telephone"
  ),
  make_picture_selection_trial(
    "angel_wing",
    false,
    "angel_wing",
    "airplane_wing"
  ),
  make_picture_selection_trial(
    "animal_ear", 
    false, 
    "animal_ear", 
    "animal_nose"),
];

var selection_trials = jsPsych.randomization.shuffle(
  selection_trials_unshuffled
);

/******************************************************************************/
/*** Phoneme categorization trials ********************************************/
/******************************************************************************/

/*
Phoneme categorization: hear a word, click on either "dean" or "teen"

Very similar to the process of building the picture selection trials, the only
differences being that the choices are always the same (dean vs teen) and the
left-right order of the buttons is not randomised.
*/

function make_categorization_trial(sound) {
  //add the path and file extension
  var sound_file = "phoneme_categorization_sounds/" + sound + ".mp3";
  var trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file,
    choices: ["dean", "teen"],
    post_trial_gap: 500,
    on_start: function (trial) {
      trial.data = {
        block: "phoneme_categorization",
        button_choices: trial.choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.button_choices[button_number];
      save_perceptual_learning_data_line(data);
    },
  };
  return trial;
}
  

var categorization_trials_unshuffled = [
  make_categorization_trial("samespeaker_VOT5"),
  make_categorization_trial("samespeaker_VOT10"),
  make_categorization_trial("samespeaker_VOT15"),
  make_categorization_trial("samespeaker_VOT20"),
  make_categorization_trial("samespeaker_VOT25"),
  make_categorization_trial("samespeaker_VOT30"),
  make_categorization_trial("samespeaker_VOT50"),
  make_categorization_trial("samespeaker_VOT80"),
];

var categorization_trials = jsPsych.randomization.shuffle(
  categorization_trials_unshuffled
);


/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
As usual, your experiment will need some instruction screens.
*/

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

var instruction_screen_picture_selection = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Picture Selection Instructions</h3>\
  <p style='text-align:left'>You will now see a series of picture pairs. At the same time, \
  you will hear the description of one of the pictures on the screen. \
  Please click on the picture that best matches the description you hear.</p>",
  choices: ["Continue"],
};

var instruction_screen_phoneme_categorization = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Phoneme Categorization Instructions</h3>\
  <p style='text-align:left'>You will now hear a series of words. For each one, please \
  indicate whether you hear \"teen\" or \"dean\" by clicking on the appropriate box on \
  the screen. The task might seem repetitive but please listen carefully to each word.</p>",
  choices: ["Continue"],
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
/*** Preload stimuli **********************************************************/
/******************************************************************************/

/*
We will use the preload plugin to automatically preload the audio stimuli for all 
the audio-button-response trials - note that this *will not* preload the images 
used in the buttons, because the audio-button-response plugin doesn't flag up those 
images for preloading. Fixing that is one of the exercises for this practical!  
*/

var preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

/******************************************************************************/
/*** Write headers for data file **********************************************/
/******************************************************************************/

/*
Since we are saving data line-by-line we want to write the headers for our data file 
(showing the column names) exactly once, near the start of the experiment. One 
way to do that (i.e. run some code that has no visible effect for the participant
but does something behind the scenes for us) is to use the call-function plugin, 
which allows us to do something (in this case, call an anonymous function which 
will use save_data to save the headers) without the participant seeing anything.
*/
var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    //write column headers to perceptuallearning_data.csv
    save_data(
      "perceptuallearning_data.csv",
      "block,trial_index,time_elapsed,stimulus,button_choice_1,button_choice_2,button_selected,response,rt\n"
    );
  },
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
I am using concat here to make sure the timeline is a flat list as per the word learning experiment.
*/
var full_timeline = [].concat(
  consent_screen,
  preload,
  write_headers,
  social_network_questionnaire,
  instruction_screen_picture_selection,
  selection_trials,
  instruction_screen_phoneme_categorization,
  categorization_trials,
  final_screen
);

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

/*
This is the saveData function provided in the tutorial, just renamed to match my naming convention
(using _ between words in variable names rather than capitalisation)
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

/*
This is a slightly modification to Alisdair's saveDataLine code.
*/
function save_perceptual_learning_data_line(data) {
  // choose the data we want to save - this will also determine the order of the columns
  var data_to_save = [
    data.block,
    data.trial_index,
    data.time_elapsed,
    data.stimulus,
    data.button_choices,
    data.button_selected,
    data.response,
    data.rt,
  ];
  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  save_data("perceptuallearning_data.csv", line);
}

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);