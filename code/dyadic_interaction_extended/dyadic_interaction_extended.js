/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*
An edit to dyadic_interaction.js, where participants communicate about
4 objects, organised in two pairs each sharing a short label.
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
/*** Setting the port number for communicating with the server ****************/
/******************************************************************************/

// The extended server will run on a different port
var my_port_number = "/ws2/";

/******************************************************************************/
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

var participant_id = jsPsych.randomization.randomID(10);

/******************************************************************************/
/*** Label and object choices *************************************************/
/******************************************************************************/

/*
The director's label choices depend on the object.
*/
var object_4_labels = ["zop", "zopekil"];
var object_5_labels = ["zop", "zopudon"];
var object_1_labels = ["dax", "daxedop"];
var object_2_labels = ["dax", "daxalot"];

/*
The matcher always chooses between these four objects.
*/
var possible_objects = ["object1", "object2", "object4", "object5"];

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

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

function save_dyadic_interaction_data(data) {
  // choose the data we want to save - this will also determine the order of the columns
  var data_to_save = [
    participant_id,
    data.trial_index,
    data.trial_type,
    data.time_elapsed,
    data.partner_id,
    data.stimulus,
    data.observation_label,
    data.button_choices,
    data.button_selected,
    data.rt,
  ];

  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  var this_participant_filename = "di_" + participant_id + ".csv";
  save_data(this_participant_filename, line);
}

var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    var this_participant_filename = "di_" + participant_id + ".csv";
    save_data(
      this_participant_filename,
      "participant_id,trial_index,trial_type,time_elapsed,\
      partner_id,stimulus,observation_label,button1,button2,button_selected,rt\n"
    );
  },
};

/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

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
      {
        prompt: label,
        trial_duration: 2000,
        post_trial_gap: 500,
        data: { trial_type: "observation", observation_label: label },
        on_finish: function (data) {
          save_dyadic_interaction_data(data);
        },
      },
    ],
  };
  return trial;
}

/*
Note that our observation trials have been extended to cover the new objects.
*/
var observation_trial_obj4_long = make_observation_trial("object4", "zopekil");
var observation_trial_obj4_short = make_observation_trial("object4", "zop");
var observation_trial_obj5_long = make_observation_trial("object5", "zopudon");
var observation_trial_obj5_short = make_observation_trial("object5", "zop");
var observation_trial_obj1_long = make_observation_trial("object1", "daxedop");
var observation_trial_obj1_short = make_observation_trial("object1", "dax");
var observation_trial_obj2_long = make_observation_trial("object2", "daxalot");
var observation_trial_obj2_short = make_observation_trial("object2", "dax");

/*
Repeat and then shuffle to produce our observation trials - object 1 and object 4 are
3 times as frequent as objects 2 and 5, but both objects occur equally frequently with their
short and long labels.
*/

var observation_trials = jsPsych.randomization.repeat(
  [
    observation_trial_obj4_long,
    observation_trial_obj4_short,
    observation_trial_obj5_long,
    observation_trial_obj5_short,
    observation_trial_obj1_long,
    observation_trial_obj1_short,
    observation_trial_obj2_long,
    observation_trial_obj2_short
  ],
  [6, 6, 2, 2, //counts for objects 4 and 5
   6, 6, 2, 2, //counts for objects 1 and 2
  ]
);

/******************************************************************************/
/******************************************************************************/
/*** Interaction **************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*** The interaction loop *****************************************************/
/******************************************************************************/

var start_interaction_loop = {
  type: jsPsychCallFunction,
  func: interaction_loop,
};

/******************************************************************************/
/*** Waiting room **********************************************************/
/******************************************************************************/

function waiting_room() {
  var waiting_room_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "You are in the waiting room",
    choices: [],
    on_finish: function () {
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(waiting_room_trial);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Waiting for partner ******************************************************/
/******************************************************************************/

function waiting_for_partner() {
  end_waiting(); //end any current waiting trial
  var waiting_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Waiting for partner",
    choices: [],
    on_finish: function () {
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(waiting_trial);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Ending infinite wait trials **********************************************/
/******************************************************************************/

function end_waiting() {
  if (
    jsPsych.getCurrentTrial().stimulus == "Waiting for partner" ||
    jsPsych.getCurrentTrial().stimulus == "You are in the waiting room"
  ) {
    jsPsych.finishTrial();
  }
}

/******************************************************************************/
/*** Instructions after being paired ******************************************/
/******************************************************************************/

function show_interaction_instructions() {
  end_waiting();
  var instruction_screen_interaction = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Pre-interaction Instructions</h3>\
      <p style='text-align:left'>Time to communicate with your partner!</p>\
      <p style='text-align:left'>When you are the SENDER you'll see an object \
      on your screen, and your job is to select a label to name it for the your partner \
      (the receiver), so that they can select the correct object.</p> \
      <p style='text-align:left'>When you are the RECEIVER you'll wait for the sender to \
      select a label, then you'll see the label selected by the sender plus several objects - \
      you just have to click on the object that you think is being named by the sender.</p>",
    choices: ["Continue"],
    on_finish: function () {
      send_to_server({ response_type: "INTERACTION_INSTRUCTIONS_COMPLETE" });
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(instruction_screen_interaction);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Instructions when partner drops out **************************************/
/******************************************************************************/

function partner_dropout() {
  end_waiting();
  var stranded_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Oh no, something has gone wrong!</h3>\
      <p style='text-align:left'>Unfortunately it looks like something has gone wrong - sorry!</p>\
      <p style='text-align:left'>Clock continue to progress to the final screen and finish the experiment.</p>",
    choices: ["Continue"],
  };
  jsPsych.addNodeToEndOfTimeline(stranded_screen);
  end_experiment();
}

/******************************************************************************/
/*** End-of-experiment screen *************************************************/
/******************************************************************************/

function end_experiment() {
  var final_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Finished!</h3>\
      <p style='text-align:left'>Experiments often end \
      with a final screen, e.g. that contains a completion \
      code so the participant can claim their payment.</p>\
      <p style='text-align:left'>This is a placeholder for that information.</p>",
    choices: ["Continue"],
    on_finish: function () {
      close_socket();
      jsPsych.endCurrentTimeline();
    },
  };
  jsPsych.addNodeToEndOfTimeline(final_screen);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Director (label selection) trials ****************************************/
/******************************************************************************/

/*
A small addition here  - need to show object-specific labels to the director
*/

function director_trial(target_object, partner_id) {
  end_waiting();
  //look up label choices depending on object 
  if (target_object == "object4") {
    label_choices = object_4_labels; 
  } else if (target_object == "object5") {
    label_choices = object_5_labels;
  }
  //adding if-statement to retrieve object1 and object2 labels 
  else if (target_object == "object1") {
    label_choices = object_1_labels;
  }
  else if (target_object == "object2") {
  label_choices = object_2_labels;
  }

  var object_filename = "images/" + target_object + ".jpg";

  var label_selected; //to be filled in later
  var n_clicks_required; //to be filled in later
  var n_clicks_given = 0;

  //subtrial 1 - just show the object
  var subtrial1 = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    prompt: "&nbsp;", //placeholder prompt
    choices: label_choices, //these buttons are invisible and unclickable!
    button_html:
      '<button style="visibility: hidden;" class="jspsych-btn">%choice%</button>',
    response_ends_trial: false,
    trial_duration: 1000,
  };
  //subtrial 2: show the two labelled buttons and have the participant select
  var subtrial2 = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    prompt: "&nbsp;", //placeholder prompt
    choices: [],
    //at the start of the trial, randomise the left-right order of the labels
    //and note that randomisation in data
    on_start: function (trial) {
      var shuffled_label_choices = jsPsych.randomization.shuffle(label_choices);
      trial.choices = shuffled_label_choices;
      trial.data = {
        block: "production",
        button_choices: shuffled_label_choices,
      };
    },
    //at the end, use data.response to figure out
    //which label they selected, and add that to data and save
    on_finish: function (data) {
      var button_number = data.response;
      label_selected = data.button_choices[button_number]; //keep track of this in our variable
      n_clicks_required = label_selected.length; //this determines how many times we click in the loop
      data.button_selected = label_selected; //add this to data so it is saved to data file
      data.trial_type = "director"; //add this to data so it is saved to data file
      data.partner_id = partner_id; //add this to data so it is saved to data file
      save_dyadic_interaction_data(data);
    },
  };
  //subtrial 3: this is where we make the participant do a specified number of clicks
  //first we define what a single clicking trial looks like
  var single_click_trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    prompt: "",
    choices: [],
    on_start: function (trial) {
      //get the label selected on subtrial 2 from the variable label_selected
      trial.choices = [label_selected]; //this is your only choice
      //n_clicks_required tells you how many times to click
      trial.prompt = "Click " + n_clicks_required + " times to send!";
    },
    //once we have clicked, increment the click counter
    on_finish: function () {
      n_clicks_given += 1;
    },
  };
  //now we can set up the loop
  var subtrial3 = {
    timeline: [single_click_trial],
    loop_function: function () {
      //keep looping until n_clicks_given = n_clicks_required
      if (n_clicks_given < n_clicks_required) {
        return true;
      } else {
        return false;
      }
    },
  };
  //finally, let the server know what we did
  var message_to_server = {
    type: jsPsychCallFunction,
    func: function () {
      //let the server know what label the participant selected,
      //and some other info that makes the server's life easier
      send_to_server({
        response_type: "RESPONSE",
        participant: participant_id,
        partner: partner_id,
        role: "Director",
        target_object: target_object,
        response: label_selected,
      });
      jsPsych.pauseExperiment();
    },
  };
  //put the three sub-parts plus the message-send together in a single complex trial
  var trial = {
    timeline: [subtrial1, subtrial2, subtrial3, message_to_server],
  };
  jsPsych.addNodeToEndOfTimeline(trial);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Matcher (object selection) trials ****************************************/
/******************************************************************************/

/*
Note that we are making the matcher choose between all 4 objects here - possibly 
unnecessary?
*/

function matcher_trial(label, partner_id) {
  end_waiting();
  var object_choices = possible_objects; //global variable defined at top!
  var trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: label,
    choices: object_choices,
    button_html:
      '<button class="jspsych-btn"> <img src="images/%choice%.jpg"></button>',

    on_start: function (trial) {
      var shuffled_object_choices = jsPsych.randomization.shuffle(
        trial.choices
      );
      trial.choices = shuffled_object_choices;
      trial.data = { button_choices: shuffled_object_choices };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.trial_type = "matcher";
      data.button_selected = data.button_choices[button_number];
      data.partner_id = partner_id; //add this to data so it is saved to data file
      save_dyadic_interaction_data(data);
      send_to_server({
        response_type: "RESPONSE",
        participant: participant_id,
        partner: partner_id,
        role: "Matcher",
        director_label: label,
        response: data.button_selected,
      });
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(trial);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/*** Feedback trials **********************************************************/
/******************************************************************************/

function display_feedback(score) {
  end_waiting();
  if (score == 1) {
    var feedback_stim = "Correct!";
  } else {
    var feedback_stim = "Incorrect!";
  }
  var feedback_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: feedback_stim,
    choices: [],
    trial_duration: 1500,
    on_finish: function () {
      send_to_server({ response_type: "FINISHED_FEEDBACK" });
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(feedback_trial);
  jsPsych.resumeExperiment();
}

/******************************************************************************/
/******************************************************************************/
/*** Build and run the timeline ***********************************************/
/******************************************************************************/
/******************************************************************************/

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

var instruction_screen_observation = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
  "<h3>Observation Instructions</h3>\
  <p>You will observe four objects being named several times. \
  Just sit back and watch.</p>",
  choices: ["Continue"],
};

var instruction_screen_enter_waiting_room = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
  "<h3>You are about to enter the waiting room for pairing!</h3>\
  <p style='text-align:left'>Once you proceed past this point we will attempt to pair \
  you with another participant. As soon as you are paired you will start to play the \
  communication game together. <b> Once you are paired, your partner will be waiting for you \
  and depends on you to finish the experiment</b>, so please progress through the experiment \
  in a timely fashion, and please if at all possible <b>don't abandon or reload the \
  experiment</b> since this will also end the experiment for your partner.</p>",
  choices: ["Continue"],
};

var preload_trial = {
  type: jsPsychPreload,
  auto_preload: true,
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

var full_timeline = [].concat(
  consent_screen,
  preload_trial,
  write_headers,
  instruction_screen_observation,
  observation_trials,
  instruction_screen_enter_waiting_room,
  start_interaction_loop
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);
