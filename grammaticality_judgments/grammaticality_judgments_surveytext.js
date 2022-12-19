/*
This is a version of the grammaticality judgment code that uses the survey-text
plugin, rather than html-keyboard-response.
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
/*** Judgment trials **********************************************************/
/******************************************************************************/

/* A change here - we use the survey-text plugin, use the preamble to provide 
the reference sentence, and then provide a list of questions where the prompt 
in each is the sentence to be rated.
*/

var survey_text_judgment_trial = {
  type: jsPsychSurveyText,
  preamble:
    "<p style='text-align:left'>Give each sentence a numerical value.\
    This example sentence would receive a score of 100:</p>\
  <p><em>Who said my brother was kept tabs on by the FBI?</em></p>\
  <p style='text-align:left'>Now provide ratings for the sentences below.</p>",
  questions: [
    { prompt: "Where did Blake buy the hat?" },
    { prompt: "What did you claim that Blake bought?" },
    { prompt: "What did you make the claim that Blake bought?" },
    { prompt: "Did where Blake buy the hat?" },
  ],
};

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
For simplicity just deleting everything apart from the opening consent screen.
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

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
We swap out the old judgment trials for our new 
*/
var full_timeline = [consent_screen, survey_text_judgment_trial];

/*
Finally we call jsPsych.run to run the timeline we have created.
*/

jsPsych.run(full_timeline);
