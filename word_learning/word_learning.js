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
    var all_data = jsPsych.data.get(); //get all data
    var all_data_as_csv = all_data.csv(); //convert to csv format
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

/*
make_observation_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a label to pair
it with.

I am using the image-button-response trial type, even though the participant doesn't
provide a response at all, just because it was the easiest way to make the layout
look similar to the production trial type.

Each observation trial consists of two trials: the initial presentation of the
object (for 1000ms) and then the object plus label (in the prompt) for 2000ms. The
initial 1000ms presentation contains some dummy text as the prompt - '&nbsp;' is
a special html space character.

In the 2000ms part of the trial I add a property to the trial's data, noting that
this trial is part of the observation block of the experiment - this will come in
handy later, and will allow us to strip out the important bit of the observation
trials from all the other clutter that jspsych saves as data.
*/

function make_observation_trial(object, label) {
  var object_filename = "images/" + object + ".jpg"; //build file name for the object
  trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    choices: [],
    timeline: [
      {
        prompt: "&nbsp;", //dummy text
        trial_duration: 1000,
      },
      { prompt: label, 
        trial_duration: 2000, 
        data: { block: "observation" } },
    ],
  };
  return trial;
}

/*
Now we can use this function to make some observation trials - object4 paired with
two non-word labels, buv and cal.
*/
var observation_trial_object4_buv = make_observation_trial("object4", "buv");
var observation_trial_object4_cal = make_observation_trial("object4", "cal");

/*
We are going to need several of these trials in training - we can do this using
the built-in function that jspsych provides for repeating trials, jsPsych.randomization.repeat.
I will have 3 occurrences of buv and 2 of cal.
*/
var observation_trials = jsPsych.randomization.repeat(
  [observation_trial_object4_buv, observation_trial_object4_cal],
  [3, 2]
);

/******************************************************************************/
/*** Production trials ************************************************/
/******************************************************************************/

/*
make_production_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a list of labels
the participant must select among when labelling the object, which will appear as
clickable buttons.

Each production trial consists of two sub-trials: the object plus label choices presented 
as buttons, then a second trial where the participant clicks again on the label they selected 
on the first trial, to centre their mouse (i.e to prevent rapid clicking through on the
left or right button).

The first subtrial is the most important part, where we present the two label choices
and have the participant click. We want the labels to appear in a random order on
each trial (e.g. so the same label isn't always on the left). I do this by using
the on_start property of the trial: when the trial starts, but before anything is shown
to the participant, the labels are shuffled randomly. We also store that shuffling in
the trial's data parameter, creating a new data field called label_choices. We also
label this trial data as being from the production block, which will be handy later.

The participant will therefore be shown the labels as clickable buttons with the randomised
order. When the trial ends (i.e. on_finish) we use the response property
returned by the trial to figure out which label the participant selected, and
record that in the trial data under label_selected.

The second subtrial involves a 1-button trial where the participant clicks on the
label they selected under subtrial 1. Passing information from one trial to another
is a little fiddly - in the trial's on_start parameter we use jsPsych.data.get()
to retrieve the data from the last trial (this is a complex object so we have to do
some digging to get the data we want), consult the label_selected property of that
trial (where we stored the label the participant selected on subtrial 1) and then
present that label as the sole choice.
*/

function make_production_trial(object, label_choices) {
  var object_filename = "images/" + object + ".jpg";
  var trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    timeline: [
      //subtrial 1: show the two labelled buttons and have the participant select
      {
        choices: label_choices, //these will be shuffled on_start
        //at the start of the trial, randomise the left-right order of the labels
        //and note that randomisation in data as label_choices
        on_start: function (trial) {
          var shuffled_label_choices =
            jsPsych.randomization.shuffle(label_choices);
          trial.choices = shuffled_label_choices;
          trial.data = {
            block: "production",
            label_choices: shuffled_label_choices,
          };
        },
        //at the end of the trial, use data.response to figure out
        //which label they selected, and add that to data
        on_finish: function (data) {
          var button_number = data.response;
          data.label_selected = data.label_choices[button_number];
        },
      },
      //subtrial 2: show the image plus selected label, make the participant click that label
      //(to re-center their mouse)
      {
        choices: [], //dummy choices to be over-written on_start
        on_start: function (trial) {
          //get the last trial response (the data generated by the button-click)
          var last_trial_data = jsPsych.data.get().last(1).values()[0];
          //look up the label_selected on that last trial
          var last_trial_label = last_trial_data.label_selected;
          trial.choices = [last_trial_label]; //this is your only choice
        },
      },
    ],
  };
  return trial;
}

/*
Use the same procedure as for observation trials to generate repeated production trials -
I am having 5 here, just testing the participant on object4 and forcing them to choose
between the two labels they saw it with in training, buv and cal.
*/
var production_trial_object4 = make_production_trial("object4", ["buv", "cal"]);
var production_trials = jsPsych.randomization.repeat(
  [production_trial_object4],
  5
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
  <p style='text-align:left'>Click Continue to finish the experiment and see your raw data. Your data will \
  also be saved to server_data.</p>",
  choices: ["Continue"],
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
I am using concat here to make sure the timeline is a flat list - just doing
timeline=[consent_screen,instruction_screen_observation,observation_trials,...]
would produce something with a nested structure (observation_trials is itself a
list) that jspsych can't handle.
*/
var full_timeline = [].concat(
  consent_screen,
  instruction_screen_observation,
  observation_trials,
  instruction_screen_production,
  production_trials,
  final_screen
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

/*
Finally we call jsPsych.run to run the timeline we have created.
*/
jsPsych.run(full_timeline);
