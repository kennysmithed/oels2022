/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*
The experiment features two main trial types - observation (training) and production (test)
Observation: see object for 1 second, then object plus label for 2 seconds
Production: see object plus two labels, select label, confirm label choice to center cursor.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/*
As usual, we will dump all the trials on-screen at the end so you can see what's
going on. We will also use the save_data function to save that data to the server_data folder on the
jspsychlearning server. In this case we will save it to a file called "wordlearning_data.csv".
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    var all_data = jsPsych.data.get()
    var all_data_as_csv = all_data.csv(); //convert that to a csv file
    save_data("wordlearning_data.csv", all_data_as_csv); //save it
    jsPsych.data.displayData("csv"); //and also dump the data to screen
  },
});

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

/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

// Your code for observation trials goes here


/******************************************************************************/
/*** Production trials ************************************************/
/******************************************************************************/

// Your code for production trials goes here

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

var instruction_screen_observation = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Observation Instructions</h3>\
  <p>You will observe one object being named several times. \
  Just sit back and watch.</p>",
  choices: ["Continue"],
};

var instruction_screen_production = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Production Instructions</h3>\
  <p>Next, you will be shown the same object again. \
  Please name this object like you saw in the observation stage. \
  This will repeat several times.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment.</p>\
  <p  style='text-align:left'>Click Continue to finish the experiment and see your raw data. Your data will \
  also be saved to server_data.</p>",
  choices: ["Continue"],
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
I am using concat here to make sure the timeline is a flat list - just doing
timeline=[consent_screen,instruction_screen_observation,observation_trials,...]
depending on how you implement the production and observation trials, this might 
produce something with a nested structure (e.g. if observation_trials is itself a
list) that jspsych can't handle.
*/
var full_timeline = [].concat(
  consent_screen,
  instruction_screen_observation,
  //put your observation trials here
  instruction_screen_production,
  //put your production trials here
  final_screen
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

/*
Finally we call jsPsych.run to run the timeline we have created.
*/
jsPsych.run(full_timeline);
