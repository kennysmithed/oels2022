---
title: Week 7 practical, notes
description: Some notes on answers to the practical questions
---

### Run the code once and look at the `perceptuallearning_data.csv` file to make sure it makes sense to you. You can also compare the data saved in the server with the data dumped in the browser. Run the code again and see what happens to that file, and think about how you might want to save your data for a real experiment.

Because we are saving the data trial-by-trial, and only saving the critical trials (and not e.g. the instruction screens), the data saved on the server is a bit more compact and neat than the data dumped in the browser window at the end. But even though we are saving the data trial-by-trial, we are still just appending new data to the end of the CSV file (including the header row). As I said last week, that's pretty messy, and not really what you want if you are collecting real data, so next week we'll show you how to create a separate CSV file for each participant (using a unique participant ID in the file name).

### Check you can add a few more picture selection trials with other images and sound files (you might need to consult the `perceptual_learning_stims.csv` file to see the full list of stimuli).

This just involves adding some more lines using the `make_picture_selection_trial` and `make_categorization_trial` functions to make trials. So our current code for creating a list of picture selection trials is:

```js
var selection_trials_unshuffled = [
  make_picture_selection_trial(
    "fresh_dill", 
    true, 
    "fresh_dill", 
    "dry_dill"
  ),
  make_picture_selection_trial(
    "orange_telephone",
    false,
    "orange_telephone",
    "black_telephone"
  ),
  make_picture_selection_trial(
    "angel_wing",
    false,
    "angel_wing",
    "airplane_wing"
  ),
  make_picture_selection_trial(
    "animal_ear", 
    false, 
    "animal_ear", 
    "animal_nose"),
];

```
 (Then the list is shuffled and eventually added to the timeline). So we can just add more trials, like this:

 ```js
var selection_trials_unshuffled = [
  //same 4 trials as before
  make_picture_selection_trial(
    "fresh_dill", 
    true, 
    "fresh_dill", 
    "dry_dill"
  ),
  make_picture_selection_trial(
    "orange_telephone",
    false,
    "orange_telephone",
    "black_telephone"
  ),
  make_picture_selection_trial(
    "angel_wing",
    false,
    "angel_wing",
    "airplane_wing"
  ),
  make_picture_selection_trial(
    "animal_ear", 
    false, 
    "animal_ear", 
    "animal_nose"),
  //2 new trials
  make_picture_selection_trial(
    "falling_dominoes",
    true,
    "falling_dominoes",
    "standing_dominoes"
  ),
  make_picture_selection_trial(
    "eiffel_tower", 
    false, 
    "eiffel_tower", 
    "pisa_tower"),
];
 ```

 That's the first /d/ and /t/ trial from the `perceptual_learning_stims.csv`, and I set it so that the dominoes trial will get a manipulated /d/ (I say `true` for the second parameter) but the tower trial gets a normal /t/ (manipulated is set to `false` for that one).

Similarly, here's our code for the categorization trials:

```js
var categorization_trials_unshuffled = [
  make_categorization_trial("samespeaker_VOT5"),
  make_categorization_trial("samespeaker_VOT10"),
  make_categorization_trial("samespeaker_VOT15"),
  make_categorization_trial("samespeaker_VOT20"),
  make_categorization_trial("samespeaker_VOT25"),
  make_categorization_trial("samespeaker_VOT30"),
  make_categorization_trial("samespeaker_VOT50"),
  make_categorization_trial("samespeaker_VOT80"),
];


var categorization_trials = jsPsych.randomization.shuffle(
  categorization_trials_unshuffled
);
```

I could just copy and paste some extra lines featuring `make_categorization_trial` in there (yawn), or I could use `jsPsych.randomization.repeat` to repeat that list a few times, to test people on each dean/teen decision a few times, e.g. 

```js
var categorization_trials = jsPsych.randomization.repeat(
  categorization_trials_unshuffled,
  2
);
```

Note that `jsPsych.randomization.repeat` repeats *and* shuffles, so that will give me 2 copies of all the categorization trials.

### There are 4 conditions in the experiment - all combinations of manipulated /d/ or manipulated /t/, same speaker or new speaker in the categorisation test. How would you build stimulus lists for these different conditions, i.e. what would you need to change in the code to change the condition a participant experiences? You don't have to do anything fancy here - ideally we'd like to have the code assign participants to a random condition every time the experiment starts, and we'll cover that soon, but at this point just figure out what bits of the stimulus list you need to manually edit to run these different conditions.

To do this manually is pretty simple. Remember that in the manipulated /d/ condition, all instances of /d/ in the picture selection trials are manipulated - that's actually what I have in the trial list above, you'll notice that whenever the trial involves a /d/ (dill, dominoes) the trial is set to `true` for the manipulated parameter (which mean that the `make_picture_selection_trial` function will add "_man" to the file name, to get the manipulated audio).

```js
var selection_trials_unshuffled = [
  make_picture_selection_trial(
    "fresh_dill", 
    true, 
    "fresh_dill", 
    "dry_dill"
  ),
  make_picture_selection_trial(
    "orange_telephone",
    false,
    "orange_telephone",
    "black_telephone"
  ),
  make_picture_selection_trial(
    "angel_wing",
    false,
    "angel_wing",
    "airplane_wing"
  ),
  make_picture_selection_trial(
    "animal_ear", 
    false, 
    "animal_ear", 
    "animal_nose"),
  make_picture_selection_trial(
    "falling_dominoes",
    true,
    "falling_dominoes",
    "standing_dominoes"
  ),
  make_picture_selection_trial(
    "eiffel_tower", 
    false, 
    "eiffel_tower", 
    "pisa_tower"),
];
```

To flip this to manipulated /t/ I just need to set manipulated to `false` for the /d/ trials and `true` for the /t/ trials: 
```js
var selection_trials_unshuffled = [
  make_picture_selection_trial(
    "fresh_dill", 
    false, 
    "fresh_dill", 
    "dry_dill"
  ),
  make_picture_selection_trial(
    "orange_telephone",
    true,
    "orange_telephone",
    "black_telephone"
  ),
  make_picture_selection_trial(
    "angel_wing",
    false,
    "angel_wing",
    "airplane_wing"
  ),
  make_picture_selection_trial(
    "animal_ear", 
    false, 
    "animal_ear", 
    "animal_nose"
  ),
  make_picture_selection_trial(
    "falling_dominoes",
    false,
    "falling_dominoes",
    "standing_dominoes"
  ),
  make_picture_selection_trial(
    "eiffel_tower", 
    true, 
    "eiffel_tower", 
    "pisa_tower"
),
];
```

How about switching from the same-speaker condition to the new speaker condition? Remember, the same- vs new-speaker manipulation affects the sound files you hear in the categorization test - thanks to the sensible and clear names of the sound files, I can just change the names of the sound files there to play the new (male) voice:

```js
var categorization_trials_unshuffled = [
  make_categorization_trial("newspeaker_VOT5"),
  make_categorization_trial("newspeaker_VOT10"),
  make_categorization_trial("newspeaker_VOT15"),
  make_categorization_trial("newspeaker_VOT20"),
  make_categorization_trial("newspeaker_VOT25"),
  make_categorization_trial("newspeaker_VOT30"),
  make_categorization_trial("newspeaker_VOT50"),
  make_categorization_trial("newspeaker_VOT80"),
];
```

### How would you modify this code so that the phoneme categorisation trials are all repeated several times? Note that there is a manual way to do this and a fast way, using some built-in jsPsych functions for repeating things that we have seen before!

I actually did this above, using `jsPsych.randomization.repeat`.

### At the moment the dean-teen buttons always appear in the same order. Can you randomise their left-right position and still keep track of which option the participant clicked?

This should be pretty easy, since we are doing this for the picture selection trials - so we can just use the same trick, randomising the `trial.choices` in `on_start`:

```js
function make_categorization_trial(sound) {
  //add the path and file extension
  var sound_file = "phoneme_categorization_sounds/" + sound + ".mp3";
  var trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file,
    choices: ["dean", "teen"],
    post_trial_gap: 500,
    on_start: function (trial) {
      var shuffled_choices = jsPsych.randomization.shuffle(trial.choices); //shuffle
      trial.choices = shuffled_choices; //set trial.choices to shuffled choices
      trial.data = {
        block: "phoneme_categorization",
        button_choices: trial.choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.button_choices[button_number];
      save_perceptual_learning_data_line(data);
    },
  };
  return trial;
}
```

### At the moment the audio we present using the `audio-button-response` plugin is interruptible - if you click part-way through the audio it will register your response and move to the next trial. Can you fix it to produce a non-interruptible audio, i.e. you can't click until the audio is done? Hint: the trick here is going to look at [the documentation](https://www.jspsych.org/7.3/plugins/audio-button-response/)) for the `audio-button-response` plugin.

jsPsych makes it pretty easy - we can just set the `response_ends_trial` parameter for `audio-button-response` trials to false. E.g. adding that to my `make_categorization_trial` function:

```js
function make_categorization_trial(sound) {
  //add the path and file extension
  var sound_file = "phoneme_categorization_sounds/" + sound + ".mp3";
  var trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file,
    choices: ["dean", "teen"],
    response_ends_trial: false,
    post_trial_gap: 500,
    on_start: function (trial) {
      var shuffled_choices = jsPsych.randomization.shuffle(trial.choices); //shuffle
      trial.choices = shuffled_choices; //set trial.choices to shuffled choices
      trial.data = {
        block: "phoneme_categorization",
        button_choices: trial.choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.button_choices[button_number];
      save_perceptual_learning_data_line(data);
    },
  };
  return trial;
}
```

### Following the guidance in the notes above on preloading, add code to automatically preload the images used as buttons in the picture selection phase. The easy way to do this is to manually specify a list of images (including their path names!) to preload - generating this list automatically is a harder question below!

All we are looking for at this point is a manual preload list - I can look through my trials (e.g. using the expanded list above), and note that I am using the following images: "fresh_dill", "dry_dill", "orange_telephone", "black_telephone", "angel_wing", "airplane_wing", "animal_ear", "animal_nose", "falling_dominoes", "standing_dominoes", "eiffel_tower", "pisa_tower". I need to put those in a list, but I also need to add the information on the path (they are all in `picture_selection_images/`) and the extension (they are all `.jpg`). So my preload image will look like this:

```js
var preload_image_list = 
[ 
  "picture_selection_images/fresh_dill.jpg", 
  "picture_selection_images/dry_dill.jpg", 
  "picture_selection_images/orange_telephone.jpg", 
  "picture_selection_images/black_telephone.jpg", 
  //etc
]
```

Then I can just use this in the preloading trial:

```js
var preload = {
  type: jsPsychPreload,
  auto_preload: true,
  images: preload_image_list
};
```

### [Harder, optional] The code doesn't currently save the social network questionnaire data. Can you add a new function, `save_questionnaire_data`, which runs at the end of the questionnaire trial and saves that data to a file on the server? You can just dump it into a file as an undigested string (i.e. with various curly brackets etc in there), or if you are feeling ambitious you can try to save some more nicely formatted data using the same tricks we use in `save_perceptual_learning_data`, in which case the first thing you are probably going to want to do is use `console.log` to get a look at the data generated by the questionnaire trial and take it from there. 

[You can already access our answers for the harder questions here](oels_practical_wk7_extended.md) - this covers this question and the next.

### [Harder, optional] Add code to automatically preload all the images used as buttons in the picture selection phase, without having to manually specify the image list. You could extract this automatically from `selection_trials`, e.g. using a for-loop to work through the trials in `selection_trials`, extract the image names from the `choices` of each trial, and add them to a preload list. 

[You can already access our answers for the harder questions here](oels_practical_wk7_extended.md).



## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
