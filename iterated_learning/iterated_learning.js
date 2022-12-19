/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*
This experiment is an iterated artificial language learning experiment, similar
to the one reported in Beckner et al. (2017) (but with different stimuli and a
modified production process, involving buttons rather than free typing).

The experiment features two main phases - observation (training) and production.

The observation trials are based on the code from word_learning.js, covered earlier
in the course. Production trials involve a loop, allowing participants to produce a 
complex label with a series of button clicks.

The iteration process is managed by a series of php scripts:
When the experiment opens, we look in server_data/il/ready_to_iterate for CSV files
to use as an input language.
If there is at least one such file, we select one, read in the input language from it,
and move the file to server_data/il/undergoing_iteration (so that no other participants
start working on the same file)
If the participant completes the experiment, we move their input language file to
server_data/il/completed_iteration, and save the language they produced during the
production phase to server_data/il/ready_to_iterate (so it can be used as input to
the next participant).
If the participant abandons the experiment, we move their input language file back
to server_data/il/ready_to_iterate so it becomes available for another participant
to use.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/*
As usual, we will dump all the trials on-screen at the end so you can see what's
going on. Note that data on critical trials is saved trial-by-trial as the experiment
runs, so unlike the word learning experiment we don't need to save all the data at 
the end of the experiment.

on_close fires when the participant leaves the experiment - we use this to catch cases
where a participant abandons the experiment part-way through, in which case we need 
to take the input language file they were working on and put it back in the 
ready_to_iterate folder so another participant get be assigned to it.
*/

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

/*
We'll generate a random participant ID when the experiment starts, and use this
to save a separate set of data files per participant.
*/

var participant_id = jsPsych.randomization.randomID(10);

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

/*
This is a modified version of our usual save_data function - it appends data to
filename in /home/UUN/server_data/il/directory i.e. we can specify which sub-folder 
of server_data/il/ we want to save to
*/
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

/*
As in previous weeks, we select the trial data we want to save then save it using
save_data (saving to server_data/il/participant_data). The file name is based on
a standard format, il_ID_chainX_gY.csv, where ID is the participant ID, X is the
chain number, Y is the generation number.
*/
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
/*** Listing, reading and saving language files *******************************/
/******************************************************************************/

/*
We need various functions which call PHP scripts which interact with saved language
files - this is how we read in a previous participant's language to use as input,
and save the current participant's output language to use as input for others. These 
functions are defined separately in manage_language_files.js.

Language files are simply CSV files with two names columns, object (giving the image
file) and label (giving the label for that object in the language).

The functions in manage_language_files.js are:

list_input_languages(): uses list_input_languages.php to return a list of files in
server_data/il/ready_to_iterate - these are candidate input languages which can be
used for iteration.

read_input_language(input_language_filename): reads a language file using 
load_input_language.php and returns a usable array of objects with two properties, 
object and label.

move_input_language(input_language_filename, from_folder, to_folder): At various points 
we need to move input language files around: we move the file from
ready_to_iterate to undergoing_iteration when a participant starts working on a
given file; we move the file back to ready_to_iterate if the participant abandons;
we move the file from undergoing_iteration to completed_iteration if they complete.
All of these are accomplished by move_input_language - we specify the file name,
the directory to move from, and the directory to move to, and move_input_language.php
does the moving for us.

save_output_language(object_label_list): When a participant completes the production 
phase, we need to save the language they produced in the final production test so that 
it can be used as input for another learner.  save_output_language works through 
object_label_list, which is a list of objects of the form 
{object:image_filename,label:'participant_label'} that is built
during the production phase of the experiment. save_output_language builds a
CSV string which can be directly saved to server-data/il/ready_to_iterate using the
normal save_data function. Output languages are saved to a file chainX_gY.csv where
X is the chain number and Y is the generation number.

Most of these functions as async, since there will be a short delay as we wait for the
PHP script to read/write files on the server.
*/

/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

/*
This is based heavily on the equivalent code in word_learning.js

make_observation_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a label to pair
it with.

Each observation trial consists of two trials: the initial presentation of the
object (for 1000ms) and then the object plus label (in the prompt) for 2000ms.
*/

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

/*
Production trials involves showing the participant an object and asking them to
generate the appropriate label. Beckner et al (2017) used free typing in production,
i.e. participants could type anything in. In some recent work with online iterated
learning we (my RA Clem Ashton and I) switched to a more constrained production model:
participants are provided with a set of syllable options, and build complex labels
by clicking on those syllable buttons. With the correct choice of syllables this
reduces/removes the problem of participants typing English (e.g. "don't know", 
"no idea") or near-English versions of random labels (e.g. "vukano" -> "volcano").
/*

/*
This requires us to lay out a set of syllables which will be available. In order not
to make production too onerous, we randomise this set of syllables once at the start
of the experiment, i.e. the syllables will appear on-screen in random order, but that
order will be consistent throughout the experiment.

The syllables here are a subset of those used in the initial language by Beckner et al.
One of the drawbacks of this production method is that the syllable inventory has to
be relatively restricted, or the array of buttons becomes a bit overwhelming.
*/

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

/*
As the participant works through the production phase we need to keep track of the
labels they produce, so that if/when they complete the production phase, we can
save their final language to use as input for another participant. We will save
their productions to participant_final_label_set.
*/
var participant_final_label_set = [];

/*
make_production_trial takes an object_filename and creates a production trial for
that object; participants' choices are available_syllables plus the mandatory buttons
DELETE (to delete the last-selected syllable) and DONE (to move to the next trial), and 
they build a label by clicking on multiple syllables before eventually clicking 
DONE. 

In order to allow participants to respond multiple times on a single production trial, 
we use a loop - jsPsych provides a standard way to allow trials to loop, using the 
loop_function parameter; if loop_function returns true then the trial(s) in the looping node's 
timeline loops, if loop_function returns false then the loop ends. We can use this to loop an 
image-button-response trial until the participant clicks DONE - we create a variable 
called continue_production_loop, set it to true initially (so we loop), and then 
when the participant clicks DONE we set continue_production_loop to false so the 
loop ends. 

That's how the loop works. But we also want to show the participant's building label
on-screen as they click to build a label. We can do this by showing the building 
label in the trial's prompt - we create a representation of the building label (a list 
of all the syllables the participant has clicked on so far), add the selected syllable 
on each iteration of the loop to that building label, and then display that building 
label (appropriately formatted) in the trial prompt. As usual the prompt will normally 
appear below the buttons, so we are actually using a custom plugin, 
image-button-response-promptabovebuttons, to get the prompt where we want it - 
but this plugin is only trivially different from the usual image-button-response plugin. 

When the participant finally clicks DONE that triggers the end of the production loop,
but also saving of the data (using save_iterated_learning_data) and we add 
{object:object_filename,label:data.label} to the participant_final_label_set
list. Note that participants must produce *some* label - clicking the DONE button 
has no effect until they have built a label containing at least one syllable.

*/

function make_production_trial(object_filename) {
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
          participant_final_label_set.push({
            object: object_filename,
            label: final_label,
          }); //add this object-label pair to participant_final_label_set
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
If all goes well, we will read an input language from a CSV file on the server and
use it to construct an observation/training timeline, consisting of a series of
observation trials, and a testing/production timeline, consisting of a series of
production trials.

This is achieved by build_training_timeline and build_testing_timeline,
both of which take an input language specified as a list of {object:object_filename,label:a_label}
objects.
*/

/*
build_training_timeline takes a list of object_label_pairs and builds a training
timeline consisting of n_repetitions blocks - each block contains one observation
trial for each object-label pair in object_label_pairs.
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
  }
  return training_timeline;
}

/*
build_testing_timeline takes a list of object_label_pairs and builds a testing timeline
of one production trial for each object in object_label_pairs, in random order. Note
that the labels are simply discarded.
*/
function build_testing_timeline(object_label_pairs) {
  var testing_timeline = [];
  var shuffled_object_label_pairs =
    jsPsych.randomization.shuffle(object_label_pairs);
  for (object_label_pair of shuffled_object_label_pairs) {
    var trial = make_production_trial(object_label_pair.object);
    testing_timeline.push(trial);
  }
  return testing_timeline;
}

/******************************************************************************/
/*** Instruction trials, headers etc ******************************************/
/******************************************************************************/

/*
As usual, your experiment will need some instruction screens, plus a preload, and
a call-function trial to write the header row for our data CSV.
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
  <p style='text-align:left'>We will start by showing you pictures and describing them in the alien \
  language, you just have to watch and learn.</p>",
  choices: ["Continue"],
};

var instruction_screen_testing = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Testing Instructions</h3>\
  <p style='text-align:left'>Now we will show you pictures and you have to describe them in \
  the alien language, clicking to build your description. \
  You can use the DELETE button if you make a mistake, and click DONE \
  when you are happy.</p>\
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
/*** Putting it all together **************************************************/
/******************************************************************************/

/*
Now we are in a position to put all of these functions together.

1. We see if there are any input languages available for iteration. If not, we
just tell the participant to come back later. If there is, we proceed.
2. We select a random input language to use. The name of this file tells us what
chain and generation we are running (e.g. if the filename is chain10_g7.csv we know
we are running generation 7 of chain 10), so we can extract that info.
3. We read in the input language from the appropriate file.
4. We use that input language to generate training trials for this participant. We
impose a bottleneck on transmission by taking a subset of the language of the
previous generation (here, 14 randomly-selected object-label pairs) and using that
to build the training timeline (here, repeating each of those object-label pairs once).
5. We use that input language to build a testing timeline, requiring the participant
to do a production trial for each object.
6. We build the full experiment timeline, combining the training and testing timelines
with the various information screens.
7. We move the input language file we are using from server_data/il/ready_to_iterate to
server_data/il/undergoing_iteration, so that another participant doesn't also start
working on this input language.
8. We run the timeline
9a. If the participant completes the experiment (i.e. gets to the end of the production
phase), we save the language they produced during production as a new input language
in server_data/il/ready_to_iterate and also move the input language they were trained on to
server_data/il/completed_iteration, so that we know it's been done.
9b. If the participant abandons the experiment we need to recycle their input language -
they haven't completed the experiment, so we need someone else to run this generation
of this chain. This is caught by initJsPsych's on_close parameter (way up at the top of the file) - 
we simply move the input language file they were working on back to the
server_data/il/ready_to_iterate folder. 

An additional thing to note: I have not implemented the deduplication filter from
the Beckner et al. method here - I figured the code was complicated enough! If you
want to implement this you will need two extra steps:
1. Before implementing step 9a, saving the participant's produced language to the
ready_to_iterate folder, you need to check it is usable, i.e. contains enough distinct
labels. If so, you proceed as normal; if not, you recycle their input language and
try again.
2. On step 4, selecting object-label pairs to use for training, you would need to
select in a way that avoids duplicate labels, rather than selecting randomly.

Also note that there is no maximum generation number in this code - chains will
run forever! If you want to stop at e.g. 10 generations, this could also be implemented
in step 9a - check this participant's generation number, if they are at generation 10
then don't save their lexicon to the ready_to_iterate folder.
*/

/*
In various places we need to know what chain and generation we are running (e.g.
for saving the participant's final language), and also what input language we are 
working with (e.g. if the participant drops out we need to recycle that file for 
another participant). We store this info in these three variables, which will be 
updated once we get this information.
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
    var training_object_label_pairs =
      jsPsych.randomization.sampleWithoutReplacement(input_language, 14);
    // Note just 1 repetition of each label in training, just to keep the experiment duration down for you!
    var training_timeline = build_training_timeline(
      training_object_label_pairs,
      1
    );

    // 5. We use that input language to build a testing timeline, requiring the participant
    // to do a production trial for each object.
    var testing_timeline = build_testing_timeline(input_language);

    // NB I am creating a tidy-up trial, to run when the participant completes the production
    // phase, at this point, so it looks out of sequence! I could have done this in the
    // on_close of the last production trial, but it seemed simpler to do it as a
    // stand-alone event in the timeline, using the call-function trial type.
    // 9. If the participant completes the experiment (i.e. gets to the end of the production
    // phase), we save the language they produced during production as a new input language
    // in server_data/il/ready_to_iterate and also move the input language they were trained on to
    // server_data/il/completed_iteration, so that we know it's been done.
    var tidy_up_trial = {
      type: jsPsychCallFunction,
      func: function () {
        save_output_language(participant_final_label_set);
        move_input_language(
          input_language_filename,
          "undergoing_iteration",
          "completed_iteration"
        );
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
      instruction_screen_testing,
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
