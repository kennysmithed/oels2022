---
title: Week 9 practical, notes
description: Some notes on answers to the practical questions
---

### **After setting up the various folders in `server_data`**, run the experiment and use cyberduck to watch the CSV files appearing and moving around in `server_data/il` - remember you will need to click refresh in cyberduck regularly to see what's happening. Experiment with abandoning the experiment part-way through (i.e. closing the browser window) and see what happens. Look at the CSV data files that get created in various places, and check that the contents of the data files make sense and how they relate to what you see as a participant. Try to run a few generations of at least one chain and check that the iteration process works as you expect.

No model answer here - hopefully you can see the language files shuttling about between `ready_to_iterate`, `undergoing_iteration` and `completed_iteration`. 

### How would you increase the number of training trials in the observation phase of the experiment to provide e.g. 6 passes through the training set? How would you increase or decrease the size of the transmission bottleneck?

The number of passes through the training set is specified in lines 592-595 of iterated_learning.js, when we use `build_training_timeline` to construct the training timeline. I have set it up just to present a single block of training:

```js
var training_timeline = build_training_timeline(
      training_object_label_pairs,
      1 //this produces 1 block of training
);
```    

So if you want multiple passes through the training set, set this number to e.g. 6 and see what happens.

The size of the transmission bottleneck (how many meaning-signal pairs our participants see in each block of training) is set just above there, on lines 589-491:

```js
var training_object_label_pairs =
      jsPsych.randomization.sampleWithoutReplacement(input_language, 14);
```

So there we are selecting 14 - change that to e.g. 5 or 20 and see what happens.

### How would you randomise the order of the syllables on production trials separately for every production trial? Do you think that is better or worse? How about if you don't randomise them at all? Have a think about the possible consequences of these various randomisation choices.

In the base version of the code we randomise the syllables once, when the experiment loads, on lines 235 onwards:

```js
var available_syllables = jsPsych.randomization.shuffle([
  "ti",
  "ta",
  ...
]);
```

As I explain in the code walk-through, I think this is a sensible way to do it because it means the structure of the syllable space is less obvious (the participants don;t see the syllables enumerated in a really clear way), but it's not as annoying as randomising the label order on *every* trial. But you can play around with these other possibilities. First, to get no randomisation, just get rid of the shuffling entirely and see what you think of that:

```js
var available_syllables = [
  "ti",
  "ta",
  ...
];
```

To shuffle every production trial independently is a little more work - I have to edit my `make_production_trial` function:

```js
function make_production_trial(object_filename) {
  //shuffle the syllables
  var shuffled_syllables = jsPsych.randomization.shuffle(available_syllables) 
  //add the DELETE and DONE buttons to the shuffled syllables syllables
  var buttons = shuffled_syllables.concat(["DELETE", "DONE"]);
  //...
  //define what a single production trial looks like - this will loop
  var single_production_trial = {
    type: jsPsychImageButtonResponsePromptAboveButtons,
    stimulus: object_filename,
    stimulus_height: 150,
    choices: buttons, //now I am using my shuffled buttons
    //...
  //then the rest as before
```

This should ensure that I shuffle the buttons once, when I construct the production trial, and then every time we loop this trial the order will be the same, but each separate production trial will have its own randomisation.

### [Harder, optional] How could you insert a small number of test trials after each block of training trials, to keep the participant focussed on the task? 

[We already provided thoughts on how this could be done](oels_practical_wk9_extended.md) (which also covers the other harder questions). 

### [Harder, optional] Can you add a maximum generation number, so no chain goes beyond e.g. 10 generations? 

[We already provided thoughts on how this could be done](oels_practical_wk9_extended.md).

### - [Very hard, very optional] Can you implement a deduplication filter like that used by Beckner et al., to avoid presenting participants with ambiguous duplicate labels (where two distinct pictures map to the same label)? 

This really was quite hard, [check out the model answer if you are curious](oels_practical_wk9_extended.md).

## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
