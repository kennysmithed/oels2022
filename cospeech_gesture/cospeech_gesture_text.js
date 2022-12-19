/*
This version uses the survey-text plugin to get a free-text response.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

/******************************************************************************/
/*** A video-button-response trial **********************************************************/
/******************************************************************************/

/*
This is similar to the video_trial in the buttons version, but now we 
have an empty array for the choices parameter - this means there are no buttons on 
screen. Because there are no buttons, we don't need to bother specifying response_allowed_while_playing: false, 
because participants cannot respond at all! Instead, we specify that the trial
should end after the video finishes, which we do using the trial_ends_after_video
parameter.
*/

var video_trial = {
  type: jsPsychVideoButtonResponse,
  stimulus: ["videos/experiment1/E1_A_FG_BL.mp4"],
  choices: [], //no choices = no buttons
  trial_ends_after_video: true,
};

/******************************************************************************/
/*** A survey-text trial **********************************************************/
/******************************************************************************/

/*
We use the survey-text plugin to present a single text question to the participant.
questions is an array of questions: here we just have a single question. For each 
question we have to specify the prompt. Here I am also specifying that for this 
question a response is required, which prevents participants continuing without 
providing a response.
*/

var text_response_trial = {
  type: jsPsychSurveyText,
  questions: [
    { prompt: "What day has the meeting been rescheduled to?", required: true },
  ],
};

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
These are the same as the buttons version.
*/

var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3>\
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant\
  what they will be doing, how their data will be used, and how they will be remunerated.</p>\
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed\
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};

var instruction_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Instructions</h3> \
  <p style='text-align:left'>On the next screen, you will see a video of a person.\
  Focus on the screen. Listen closely to what the person says!</p>\
  <p style='text-align:left'>Do not spend too much time answering the question, \
  try to respond as fast as possible - we are interested in your initial reaction \
  and a quick, intuitive judgment.</p>",
  choices: ["Click when you are ready to begin"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that \
  contains a completion code so the participant can claim their payment.</p>\
  <p style='text-align:left'>This is a placeholder for that information.</p>",
  choices: ["Click to finish the experiment and see your raw data"],
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
Now we just slot in our text_response_trial after the video_trial
*/
var full_timeline = [
  consent_screen,
  instruction_screen,
  video_trial,
  text_response_trial,
  final_screen,
];

jsPsych.run(full_timeline);
