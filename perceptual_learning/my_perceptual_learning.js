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
going on. Note that in our final implementation the data on critical trials is 
saved trial-by-trial as the experiment runs, so unlike the word learning experiment 
we don't need to save all the data at the end of the experiment.
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

// Your implementation goes here!


/******************************************************************************/
/*** Phoneme categorization trials ********************************************/
/******************************************************************************/

/*
Phoneme categorization: hear a word, click on either "dean" or "teen"
*/

// Your implementation goes here!

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
We will use the preload plugin to automatically preload the audio stimuli - we are 
including it here since it should be compatible with your code no matter how you 
build it!
*/

var preload = {
  type: jsPsychPreload,
  auto_preload: true,
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
  social_network_questionnaire,
  instruction_screen_picture_selection,
  // your picture selection_trials go here
  instruction_screen_phoneme_categorization,
  // your phoneme categorization trials go here,
  final_screen
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);