/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*
This code features potential answers to the harder questions at the end of the 
week 9 practical, specifically:
- Adding a few test trials at the end of each training block.
- Adding a maximum generation number.
- Adding a deduplication filter.

As usual I will strip out basically all other comments, so remaining comments deal 
with the additions to the code.
*/

/******************************************************************************/
/*** Setting max generation number ********************************************/
/******************************************************************************/

/* 
It makes sense to specify the max generation number out front as a variable that 
we can easily see, then we can refer to that variable later in the code. I am also 
going to do the same for the bottleneck size, the number of picture-label pairs 
used in the training phase, since modifying this was one of the earlier exercises.
*/

var bottleneck_size = 14;
var n_intermediate_tests = 3;
var max_generations = 10;

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

var jsPsych = initJsPsych({
  on_close: function () {
    move_input_language(
      input_language_filename,
      "undergoing_iteration",
      "ready_to_iterate"
    );
  },
  on_finish: function () {
    jsPsych.data.displayData("csv"); //dump the data to screen
  },
});

/******************************************************************************/
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

var participant_id = jsPsych.randomization.randomID(10);

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

function save_data(directory, filename, data) {
  var url = "save_data.php";
  var data_to_send = {
    directory: directory,
    filename: filename,
    filedata: data,
  };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data_to_send),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
}

function save_iterated_learning_data(data) {
  // choose the data we want to save - this will also determine the order of the columns
  var data_to_save = [
    participant_id,
    chain,
    generation,
    data.trial_index,
    data.block,
    data.time_elapsed,
    data.stimulus,
    data.label,
  ];
  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  //build filename using the participant_id, chain and generation global variables
  var filename =
    "il_" + participant_id + "_chain" + chain + "_g" + generation + ".csv";
  //save to participant_data folder
  save_data("participant_data", filename, line);
}

/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

function make_observation_trial(object_filename, label) {
  trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    stimulus_height: 150,
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
        data: { block: "observation", label: label },
        on_finish: function (data) {
          save_iterated_learning_data(data);
        },
      },
    ],
  };
  return trial;
}

/******************************************************************************/
/*** Production *****************************************************/
/******************************************************************************/

var available_syllables = jsPsych.randomization.shuffle([
  "ti",
  "ta",
  "to",
  "tu",
  "ki",
  "ka",
  "ko",
  "ku",
  "si",
  "sa",
  "so",
  "su",
  "vi",
  "va",
  "vo",
  "vu",
]);

var participant_final_label_set = [];

/*
Change here - I am adding an argument to this function, final_test - if final_test=true, we
add the label produced by the participant_final_label_set, otherwise we don't. This allows 
us to use make_production_trial to generate intermediate tests without contaminating the 
participant_final_label_set that we will use for iteration.
*/
function make_production_trial(object_filename, final_test) {
  var building_label = []; //store the syllables of the building label here
  var continue_production_loop = true; //use this to control the production loop
  //add the DELETE and DONE buttons to the syllables
  var buttons = available_syllables.concat(["DELETE", "DONE"]);

  //define what a single production trial looks like - this will loop
  var single_production_trial = {
    type: jsPsychImageButtonResponsePromptAboveButtons,
    stimulus: object_filename,
    stimulus_height: 150,
    choices: buttons,
    //show the building label in the prompt
    prompt: function () {
      //if the building label is empty, dummy prompt
      if (building_label.length == 0) {
        return "&nbsp;";
      }
      //otherwise, paste together the syllables in building_label into a single word using join
      else {
        return building_label.join("");
      }
    },
    //after the participant clicks, what happens depends on what they clicked
    on_finish: function (data) {
      //figure out what button they clicked using buttons and data.response
      var button_pressed = buttons[data.response];
      //if they clicked DONE
      if (button_pressed == "DONE") {
        //only end the loop if they have produced *something*
        if (building_label.length > 0) {
          var final_label = building_label.join("");
          data.label = final_label;
          data.block = "production"; //mark it as production data
          //only add to participant_final_label_set if this is a final test trial
          if (final_test) {
            participant_final_label_set.push({
              object: object_filename,
              label: final_label,
            });
          }
          save_iterated_learning_data(data); //save the data (which will include the built label)
          continue_production_loop = false; //break out of the loop
        }
      }
      //if they clicked DELETE, just delete the last syllable from building_label
      //which can be done using slice
      else if (button_pressed == "DELETE") {
        building_label = building_label.slice(0, -1);
      }
      //otherwise they must have clicked a syllable button, so just add that
      //to the building label
      else {
        building_label.push(button_pressed);
      }
    },
  };
  //slot single_production_trial into a loop
  var production_loop = {
    timeline: [single_production_trial],
    loop_function: function () {
      return continue_production_loop; //keep looping until continue_production_loop=false
    },
  };
  return production_loop;
}

/******************************************************************************/
/*** Building training and testing timelines **********************************/
/******************************************************************************/

/*
There are some changes in here to add the end-of-training-block intermediate tests.
*/
function build_training_timeline(object_label_pairs, n_repetitions) {
  var training_timeline = []; //build up our training timeline here
  //this for-loop works through the n_repetitions blocks
  for (i = 0; i < n_repetitions; i++) {
    //randomise order of presentation in each block
    var shuffled_object_label_pairs =
      jsPsych.randomization.shuffle(object_label_pairs);
    //in each block, present each object-label pair once
    for (object_label_pair of shuffled_object_label_pairs) {
      var trial = make_observation_trial(
        object_label_pair.object,
        object_label_pair.label
      );
      training_timeline.push(trial);
    }
    //NEW BIT: once we have done the observation trials for this block, we can add some
    //test trials - let's test on n_intermediate_tests of them, which is a variable set at the
    //top of the code
    //first we select object_label_pairs to test on
    var object_label_pairs_to_test =
      jsPsych.randomization.sampleWithoutReplacement(
        object_label_pairs,
        n_intermediate_tests
      );

    //then we'll add an instruction screen to the timeline telling the participant how the 
    //test works - instruction_screen_intermediate_testing is defined alongside the other 
    //instruction screens 
    
    training_timeline.push(instruction_screen_intermediate_testing);
    //then we have a for loop to create test trials for each of these - note
    //this works in basically exactly the same way as the loop in build_testing_timeline
    //except that we set final_test=false when we call make_production_trial so that it doesn't
    //add the labels produced during intermediate tests to the final language used for iteration
    for (object_label_pair of object_label_pairs_to_test) {
      var test_trial = make_production_trial(object_label_pair.object, false);
      training_timeline.push(test_trial);
    }
  }
  return training_timeline;
}

function build_testing_timeline(object_label_pairs) {
  var testing_timeline = [];
  var shuffled_object_label_pairs =
    jsPsych.randomization.shuffle(object_label_pairs);
  for (object_label_pair of shuffled_object_label_pairs) {
    //here in the final test we set final_test = true so that the participant's productions 
    //are added to the final language used for iteration
    var trial = make_production_trial(object_label_pair.object, true);
    testing_timeline.push(trial);
  }
  return testing_timeline;
}

/******************************************************************************/
/*** Instruction trials, headers etc ******************************************/
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
  <p style='text-align:left'>We will start by showing you pictures and describing them in the alien \
  language, you just have to watch and learn.</p>",
  choices: ["Continue"],
};

var instruction_screen_intermediate_testing = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Testing Instructions</h3>\
  <p style='text-align:left'>Now we will show you pictures and you have to describe them in \
  the alien language, clicking to build your description. \
  You can use the DELETE button if you make a mistake, and click DONE \
  when you are happy.</p>",
  choices: ["Continue"],
};

var instruction_screen_final_testing = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Final Test Instructions</h3>\
  <p style='text-align:left'>Now for the final test - as before, we will show you pictures \
  and you have to describe them in the alien language, clicking to build your description.</p>\
  <p>Good luck! And <b>remember to answer every question, \
  even if you aren't sure if it's right</b>.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion \
  code so the participant can claim their payment.</p>\
  <p style='text-align:left'>This is a placeholder for that information.</p>",
  choices: ["Finish"],
};

var cannot_iterate_info = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Oh dear!</h3>\
  <p style='text-align:left'>Participants see this screen if there are no input \
  languages available to iterate from.</p>\
  <p style='text-align:left'>You might tell them to close the browser and come back later.</p>",
  choices: [],
};

var preload_trial = {
  type: jsPsychPreload,
  auto_preload: true,
};

var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    var this_participant_filename =
      "il_" + participant_id + "_chain" + chain + "_g" + generation + ".csv";
    save_data(
      "participant_data",
      this_participant_filename,
      "participant_id,chain,generation,trial_index,block,time_elapsed,stimulus,label\n"
    );
  },
};

/******************************************************************************/
/*** Deduplication ************************************************************/
/******************************************************************************/

/*
This is a new function that takes a list of object-label pairs and reduces it to 
a list of object-label pairs where each labek is unique. 
*/
function deduplicate(object_label_pairs) {
  //shuffle them so we don't end up picking the first unique labels
  var shuffled_object_label_pairs =
    jsPsych.randomization.shuffle(object_label_pairs);
  //need building list of deduplicated_object_label_pairs and deduplicated_labels
  var deduplicated_object_label_pairs = [];
  var deduplicated_labels = [];
  //now iterated through shuffled_object_label_pairs
  for (this_object_label_pair of shuffled_object_label_pairs) {
    var this_label = this_object_label_pair.label; //get the label
    //if the label is already in deduplicated_labels
    if (deduplicated_labels.includes(this_label)) {
      //do nothing!
    } else {
      //otherwise it's a label we haven't seen yet, so we can add it
      deduplicated_object_label_pairs.push(this_object_label_pair);
      deduplicated_labels.push(this_label);
    }
  }
  return deduplicated_object_label_pairs;
}

/******************************************************************************/
/*** Putting it all together **************************************************/
/******************************************************************************/

/*
The extended version features a more complex set of decisions in step 9a, when the 
participant completes the experiment. 

First, we check whether they have produced enough unique labels for iteration, by 
deduplicating their final label set. If they have, then we save the language they 
produced as a new input language in server_data/il/ready_to_iterate (***UNLESS they are 
the max_generations participant in their chain, in which case we simply don't save their 
output file to server_data/il/ready_to_iterate, which means nobody will be added after 
them in this chain***) and also move the input language they were trained on to
server_data/il/completed_iteration, so that we know it's been done. But if they didn't 
produce enough unique labels to iterate from, we basically treat them as if they abandoned -
we recycle their input language into server_data/il/ready_to_iterate, and don't save 
their output language.
*/
var chain;
var generation;
var input_language_filename;

async function run_experiment() {
  //1. We see if there are any input languages available for iteration
  var available_input_languages = await list_input_languages();
  //...If not, we just tell the participant to come back later (using the cannot_iterate_info html-keyboard-response trial created above)
  if ((await available_input_languages.length) == 0) {
    jsPsych.run({ timeline: [cannot_iterate_info] });
  }
  //...If there is, we proceed.
  else {
    //2. We select a random input language to use.
    input_language_filename = jsPsych.randomization.shuffle(
      available_input_languages
    )[0];
    //...The name of this file tells us what chain and generation we are running
    //To retrieve generation and chain info from filename, split the filename at _ and .
    var split_filename = input_language_filename.split(/_|\./);
    //chainX will be the first item in split_filename, just need to lop off the 'chain' prefix and convert to integer
    chain = parseInt(split_filename[0].substring(5));
    //gY will be the second item in split_filename, ust need to lop off the 'g' prefix and convert to integer
    var input_generation = parseInt(split_filename[1].substring(1));
    //*This* generation will be the input language generation + 1
    generation = input_generation + 1;

    // 3. We read in the input language from the appropriate file.
    var input_language = await read_input_language(input_language_filename);

    // 4. We use that input language to generate training trials for this participant.
    // We impose a bottleneck on transmission by taking a subset of the language
    // of the previous generation (here, 14 randomly-selected object-label pairs)
    // and using that to build the training timeline (here, repeating each of those
    // object-label pairs once)
    // THIS NOW REFERS TO THE bottleneck_size VARIABLE DEFINED AT THE TOP OF THE CODE,
    // making it easy to change the bottleneck size.
    // WE ALSO NEED TO DEDUPLICATE THE INPUT LANGUAGE BEFORE SELECTING TRAINING LABELS
    var deduplicated_input_language = deduplicate(input_language);
    var training_object_label_pairs =
      jsPsych.randomization.sampleWithoutReplacement(
        deduplicated_input_language,
        bottleneck_size
      );
    // Note just 1 repetition of each label in training, just to keep the experiment duration down for you!
    var training_timeline = build_training_timeline(
      training_object_label_pairs,
      1
    );

    // 5. We use that input language to build a testing timeline, requiring the participant
    // to do a production trial for each object.
    var testing_timeline = build_testing_timeline(input_language);

    // 9. If the participant completes the experiment (i.e. gets to the end of the production
    // phase), AND produced enough unique labels for us (their deduplicated label set is at least
    //big as our bottleneck size) we save the language they produced during production as a new input language
    // in server_data/il/ready_to_iterate (UNLESS they are already the max_generations
    // participant in this chain, in which case we just skip that step) and also move the
    // input language they were trained on to server_data/il/completed_iteration, so that we
    // know it's been done. But if they fail the deduplication check, we just move their input language
    // back to the ready_to_iterate folder so another participant can pick it up.
    var tidy_up_trial = {
      type: jsPsychCallFunction,
      func: function () {
        var deduplicated_final_label_set = deduplicate(
          participant_final_label_set
        );
        if (deduplicated_final_label_set.length >= bottleneck_size) {
          //THIS NOW CONTAINS A CHECK ON max_generations
          if (generation < max_generations) {
            save_output_language(participant_final_label_set);
          }
          move_input_language(
            input_language_filename,
            "undergoing_iteration",
            "completed_iteration"
          );
        } else {
          //if they failed the deduplication check then we have to re-run this generation,
          //so we just recycle their input file back to the ready_to_iterate folder as if they
          //had abandoned
          move_input_language(
            input_language_filename,
            "undergoing_iteration",
            "ready_to_iterate"
          );
        }
      },
    };

    // 6. We build the full experiment timeline, combining the training and testing timelines
    // with the various information screens.
    var full_timeline = [].concat(
      consent_screen,
      preload_trial,
      write_headers,
      instruction_screen_observation,
      training_timeline,
      instruction_screen_final_testing,
      testing_timeline,
      tidy_up_trial,
      final_screen
    );
    // 7. We move the input language file we are using from server_data/il/ready_to_iterate to
    // server_data/il/undergoing_iteration, so that another participant doesn't
    // also start working on this input language.
    move_input_language(
      input_language_filename,
      "ready_to_iterate",
      "undergoing_iteration"
    );

    // 8. We run the timeline
    jsPsych.run(full_timeline);
  }
}

/*
Then to get everything going we just call our run_experiment() function.
*/
run_experiment();
