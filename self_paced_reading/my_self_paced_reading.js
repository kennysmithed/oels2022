/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/* 
Nothing fancy going on in here - once again we we use a built-in function to dump 
the raw data on the screen. 
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

/******************************************************************************/
/*** Self-paced reading trials ************************************************/
/******************************************************************************/

/*
You need to write the code for these!
*/


/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
As usual, your experiment will need a consent screen and some instruction screens.

For the initial consent screen I am using a button response, as per last week - I like a
button response here because I think it makes it less likely that people will keypress
through before they realise what they are supposed to be doing.

For the instruction screen I am using keyboard response as per last week. Note that
jsPsych provides an instructions plugin (https://www.jspsych.org/7.3/plugins/instructions/)
which would be better if you were providing many many pages of instructions.
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

// These instructions are taken from the code for the original experiment , which is
// not written in jsPsych but is available at https://code.google.com/archive/p/enochson-amt/
var instruction_screen_1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Instructions</h3>\
  <p style='text-align:left'>Read the following sentences, one word at a time, \
  pressing SPACE after each word to move on to the next word.</p>\
  <p style='text-align:left'>After each word-by-word sentence, you will see a \
  yes/no question. For yes/no questions, press y for yes and n for no.</p>\
  <p style='text-align:left'>Try to read at a natural pace; quickly, but \
  with comprehension.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion \
  code so the participant can claim their payment.</p>\
  <p style='text-align:left'>This is a placeholder for that information.",
  choices: ["Click to finish the experiment and see your raw data"],
};

/******************************************************************************/
/*** Collect demographics *******************************************************/
/******************************************************************************/

/*
Often you want to collect demographic information from your participants - e.g.
age, gender, whether they are a native speaker of some language - and also give
them the opportunity to provide free-text comments (e.g. in case there is a problem
with your experiment that they have noticed). The survey-html-form plugin provides
a way to mix various response types on a single form. Note that the age response
is flagged as required - this prevents participants from going past this trial
without providing a response.
*/

var demographics_form = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<p style='text-align:left'> Please answer a few final questions about yourself and our experiment.</p>",
  html: "<p style='text-align:left'>Are you a native speaker of English?<br>  \
            <input type='radio' name='english' value='yes'>yes<br>\
            <input type='radio' name='english' value='no'>no<br></p> \
        <p style='text-align:left'>What is your age? <br> \
            <input required name='age' type='number'></p> \
        <p style='text-align:left'>Any other comments?<br> \
            <textarea name='comments'rows='10' cols='60'></textarea></p>",
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
This experiment is very simple, and our timeline is just a list of the trials we
set up above. You will need to add your self-paced reading trials to this timeline.
*/
var full_timeline = [
  consent_screen,
  instruction_screen_1, 
  demographics_form,
  final_screen,
];

/*
Finally we call jsPsych.run to run the timeline we have created.
*/
jsPsych.run(full_timeline);
