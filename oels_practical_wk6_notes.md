---
title: Week 6 practical, notes
description: Some notes on answers to the practical questions
---

### Run the code on the server once and look at the `wordlearning_data.csv` file to make sure it makes sense to you. If you have already run the code several times that file might be quite messy, in which case you can delete it and run the code again to get a cleaner view. Run the code several times and look at the `wordlearning_data.csv` file - you might have to refresh it on cyberduck to see the latest data. Make sure you understand what happens to this data file every time you run the code. If you had multiple participants doing this experiment, what would you *like* to happen, and roughly how would you achieve that?

Hopefully you were able to figure out that every time the code runs it just appends new data to the end of the CSV file (including the header row). That's pretty messy, and not really what you want if you are collecting real data, for a couple of reasons. First, in our current set-up there's no way of telling which participant a given chunk of data comes from - minimally, we'd like to add another column with some kind of unique participant identifier. But even then, I don't like the idea of saving everyone's data to a single file - I am not confident what will happen if two participants complete at the same time (Will it write both sets of data? Neither?), plus imagine if that single file containing all my data got corrupted or deleted somehow! So what I usually do, and what we'll eventually show you how to do, is to create a separate CSV file for each participant (using a unique participant ID in the file name) - that's more robust, and clearer in that when you look in your `server_data` you can see how many participants you have.

### It's possible to *filter* the data before saving it, e.g. grabbing only the trials where we marked `{block: "observation"}` or `{block: "production"}` - this is explained in Section 06 of Alisdair's tutorial, or you can look at [the jsPsych documentation on aggregating and manipulating data](https://www.jspsych.org/7.3/overview/data/#aggregating-and-manipulating-jspsych-data). Can you figure out how to change the `on_finish` for `initJsPsych` so that it only saves the observation and production trial data to the server?

This involves changing the `on_finish` bit of `initJsPsych` (which is where the data-saving happens):

```js
var jsPsych = initJsPsych({
  on_finish: function () {
    //use data.get and filter to select the trials we want
      var relevant_data = jsPsych.data.get().filter([{block: 'observation'}, {block:'production'}]);
      var relevant_data_as_csv = relevant_data.csv(); //convert that to a csv file
      save_data("wordlearning_data.csv", relevant_data_as_csv); //save it
      jsPsych.data.displayData('csv'); //and also dump *all* the data to screen
  }
});
```

This is really close to the example Alisdair gives in his tutorial - the only difference is that we want to allow *either* observation or production data to be saved, so we can do that by providing a list of options in the `filter`.

### The code here is for the low-load linguistic version of the Ferdinand et al. (2019) experiment, with 1 object. How would you modify the code to do something with higher load, e.g. 2 or 3 objects, each with 2 labels? You could either do a blocked design (participants see several objects but the observation or production trials are organised such that all the trials for one object are together, then all the trials for the next object are together), or a fully-randomised presentation (i.e. you do all the observation trials, then all the production trials, but all the objects are interspersed randomly within each phase).

Currently we create observation trials for a single object and 2 labels like this:

```js
var observation_trial_object4_buv = make_observation_trial("object4", "buv");
var observation_trial_object4_cal = make_observation_trial("object4", "cal");

//... 

var observation_trials = jsPsych.randomization.repeat(
  [observation_trial_object4_buv, observation_trial_object4_cal],
  [3, 2]
);
```

So creating observation trials for a second object should be pretty easy and just involves doing more of the same, e.g. 

```js
var observation_trial_object4_buv = make_observation_trial("object4", "buv");
var observation_trial_object4_cal = make_observation_trial("object4", "cal");

//new object + labels
var observation_trial_object5_seb = make_observation_trial("object5", "seb");
var observation_trial_object5_nuk = make_observation_trial("object5", "nuk");

var observation_trials = jsPsych.randomization.repeat(
  [observation_trial_object4_buv, observation_trial_object4_cal,
  observation_trial_object5_seb, observation_trial_object5_nuk],
  [3, 2, 4, 1]
);
```

Notice that I can create the entire list of `observation_trials` with a single use of
`jsPsych.randomization.repeat` - here I am asking for 3 occurrences of object4+buv, 2 of object4+cal, 4 of object5+seb, 1 of object5+nuk.

We can do the same for the production trials. Previously we had:

```js
var production_trial_object4 = make_production_trial("object4", ["buv", "cal"]);
var production_trials = jsPsych.randomization.repeat(
  [production_trial_object4],
  5
);
```

So if we also want to test on object 5, we can extend this to:

```js
var production_trial_object4 = make_production_trial("object4", ["buv", "cal"]);
var production_trial_object5 = make_production_trial('object5',["seb","nuk"]);
var production_trials = jsPsych.randomization.repeat(
  [production_trial_object4, production_trial_object5],
  5
);
```

Notice that `jsPsych.randomization.repeat` can be used in two slightly different ways - if we give it a *list* of numbers for the number of repetitions, that allows us to have different numbers of repetitions for each thing in the trial list we are repeating; if we give it a *single* number then it repeats everything in the trial list that many times (which is what we do here - we want 5 repetitions of the production trials for both objects). 

If you want to do blocked presentation (e.g. all the presentations of object4 then all the presentations of object5), you can create separate sets of trials for each, then combine them in the order you want when you create the full timeline. E.g. for observation trials, if we want all the presentations of object4 then all the presentations of object5 we could create separate trial lists like this:

```js
var observation_trial_object4_buv = make_observation_trial("object4", "buv");
var observation_trial_object4_cal = make_observation_trial("object4", "cal");

var observation_trial_object5_seb = make_observation_trial("object5", "seb");
var observation_trial_object5_nuk = make_observation_trial("object5", "nuk");

var observation_trials_object4 = jsPsych.randomization.repeat(
  [observation_trial_object4_buv, observation_trial_object4_cal],
  [3, 2]
);

var observation_trials_object5 = jsPsych.randomization.repeat(
  [observation_trial_object5_seb, observation_trial_object5_nuk],
  [4, 1]
);
```

Then when we build the full timeline we can include these in the order we want:

```js
var full_timeline = [].concat(
  consent_screen,
  instruction_screen_observation,
  observation_trials_object4,
  observation_trials_object5,
  ...
);
```

### Ferdinand et al. (2019) also have a *non-linguistic* version of the same experiment, where rather than words labelling objects participants observed coloured marbles being drawn from a bag (there were no fancy animations, it was just a picture of a marble above a picture of a bag), then produced some more marble draws themselves by clicking on buttons labelled with images of coloured marbles. You don't have to implement it, but think about what sorts of changes would you need to make to the word learning code to implement this non-linguistic version? We'll see some of these tools in next week's practical.

The trickiest thing here will be having choices in a button-response trial that are images (of marbles) rather than just text buttons. We'll see how to do that next week.

### [Optional, hard] Can you figure out how to use the `jsPsych.randomization.shuffleNoRepeats` function [documented here](https://www.jspsych.org/7.3/reference/jspsych-randomization/#jspsychrandomizationshufflenorepeats) to do a version where observation and test trials for multiple objects are interspersed, but you never see the same object twice in a row? NB this will only work if you have 3+ different objects in the experiment - it's too hard for the code to find randomisations with no repeats if you have a small number of objects, and impossible if you only have one object, so the code will hang while  endlessly searching! 

[We already provided a detailed model answer for this](oels_practical_wk6_norepeat.md).


## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
