/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
Participants alternate between two trial types:

Picture selection trials, where they hear audio from their partner (in fact recorded
audio from our confederate) and select the matching picture from 2 possibilities. 

Picture description trials, where they see a picture and produce a description for
their partner (clicking a mic icon to start and stop recording). 

We simulate the confederate preparing to speak and making a selection based on the 
participant's productions by inserting variable-duration "waiting for partner" screens.

We are interested in whether, on critical trials, the construction used by the partner
(featuring a redundant colour adjective) influences the description the participant 
produces on the following picture description trial.

NB The code for audio recording was developed in conjunction with Annie Holz, and
is adapted from the demo at https://experiments.ppls.ed.ac.uk/.
*/

/******************************************************************************/
/*** Infrastructure for recording audio ***************************************/
/******************************************************************************/

/*
Capturing audio in javascript is actually fairly straightforward thanks to the
getUserMedia and MediaRecorder functions. We want to create a single MediaRecorder
which we use throughout the experiment, so the participant doesn't have to grant
microphone access repeatedly.
*/

/*
Rather than clutter up this file with the code for handling audio, I have put it
in a seperate js file, which is loaded by my_confederate_priming.html in the same way as this
file - this other file is called confederate_priming_utilities.js, and includes
the audio recording code. That code creates several global variables and functions
which are used in recording audio - the only ones you have to worry about when
reading this code are:

recording_counter - just a counter where we keep track of how many audio recordings
we have made - the first recording is 0, the second 1 etc. We use these in the filenames
of recordings and also in the CSV data saved on the server so you can link particular
recordings to particular experiment trials.

request_mic_access() - this tries to create the various media and recorder objects we
need to record audio, and will prompt the participant for mic access via a pop-up.

start_recording(filename_prefix) starts audio recording, the audio will be saved
to a file called filename_prefix_recording_counter.webm when the recording is stopped.

stop_recording() stops the current audio recording, triggering saving of the audio file,
and also increments the recording_counter
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
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

/*
We'll generate a random participant ID when the experiment starts, and use this
to save a separate set of data files per participant.
*/

var participant_id = jsPsych.randomization.randomID(10);


/******************************************************************************/
/*** Picture selection trials *************************************************/
/******************************************************************************/

/*
Picture selection: wait while the confederate prepares to click their mic button
(in reality, a random duration wait), then hear a description from the confederate
plus two pictures, then click on a picture.
*/

// Your implementation here

/******************************************************************************/
/*** Picture description trials ********************************************/
/******************************************************************************/

/*
Picture description: see the picture to be described, click
on the mic icon to begin recording a description, then click on the mic icon to
stop recording, then finally wait while the confederate
prepares completes the picture selection task (in reality, a random duration wait).

If you want to implement this so it actually records audio, you can use 
start_recording(participant_id);
to start recording, and 
stop_recording();
to stop recording at the appropriate time.
*/


// Your implementation here

/******************************************************************************/
/*** Preload ******************************************************************/
/******************************************************************************/

var preload = {
  type: jsPsychPreload,
  auto_preload: true
};



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
/*** Build the full timeline *******************************************************/
/******************************************************************************/

var full_timeline = [].concat(
  consent_screen,
  audio_permission_instructions1,
  audio_permission_instructions2,
  preload,
  pre_interaction_instructions,
  // interaction trials go in here
  final_screen
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);
