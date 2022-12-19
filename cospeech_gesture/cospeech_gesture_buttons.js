/*
This is a javascript block comment - the interpreter ignores this stuff, it's for
you to read, although note that anyone looking at the source code of your experiment
will see these comments, including any curious participants!
*/

// Individual lines can be commented out like this.

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/* 
Nothing fancy going on in here, except that on_finish (so after the final trial 
in the experiment) we use a built-in function to dump the raw data on the screen. 
Obviously you wouldn't do this with a real experiment, and we will show you how 
to save data in a subsequent example, but this at least allows you to see what 
the data looks like behind the scenes.
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

/******************************************************************************/
/*** A video-button-response trial **********************************************************/
/******************************************************************************/

/*
First we lay out our single experimental trial.
This is of type:'video-button-response', because we are going to show the participant
a video and then ask them to click on an on-screen button indicating their response.

stimulus is an array (enclised in []) specifying the video they will see.
choices is an array giving the labels on the buttons they will see - here there 
are 2 choices.
response_allowed_while_playing specifies whether participants can respond while the video
is playing - it's set to false here to force participants to wait to respond.
*/

var video_trial = {
  type: jsPsychVideoButtonResponse,
  stimulus: ["videos/experiment1/E1_A_FG_BL.mp4"],
  choices: ["Monday", "Friday"],
  response_allowed_while_playing: false,
};

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
In addition to the experimental trials, we will need some screens which explain to the
participants what they are doing. I am using html-button-response trials for instructions,
there are other options.
*/

//Bit of html formatting in this one - a header and some left-aligning of the
//text, otherwise it is centered, which I think is hard to read.
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

//Another html-button-response trials, just like the consent screen.
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
This experiment is very simple, and our timeline is just a list of the trials we
set up above. There's no randomisation, so our trials will always play in the same
order every time we run through the experiment - later we'll see how to do
randomisation.
*/
var full_timeline = [
  consent_screen,
  instruction_screen,
  video_trial,
  final_screen,
];

/*
Finally we call jsPsych.run to run the timeline we have created.
*/

jsPsych.run(full_timeline);
