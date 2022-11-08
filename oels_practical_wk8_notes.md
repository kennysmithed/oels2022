---
title: Week 8 practical, notes
description: Some notes on answers to the practical questions
---

### Run the basic `conferedate_priming.html` experiment and look at the CSV and audio data files it creates. Check you can access the audio, and that you can see how the audio and the trial list link up.

You should find a data file called something like cp_a3fjy6ahr3.csv (where a3fjy6ahr3 is the random ID - yours will be different!), plus a bunch of audio files in the `audio` folder called a3fjy6ahr3_0.webm, a3fjy6ahr3_1.webm etc, one per recording you made when running through the experiment. The numbers in the recording names (0, 1 etc) correspond to the information in the recording_counter column in the CSV data file.

### Run it again and see where the data from the second run is stored - you may need to refresh your cyberduck window with the refresh button.

Every time you run it you are assigned a different random ID, so you get a separate data file and a separate set of recordings.

### The short trial list I built in `conferedate_priming.js` is for an overspecific confederate. How would you modify that trial list to simulate a minimally-specific confederate?

You need to change the names of the sound files. In particular, our confederate in the base code produces a single overspecific description, which we create with the following command:

```js
var interaction_trials = [
  ...
  //critical trial (confederate describes red sock using adjective)
  make_picture_selection_trial("g4_c1_1", "g4_c1", "g2_c3"),
  ...
];
```

That's an overdescription because the two choices are a red sock ("g4_c1") and a green glove ("g2_c3"), so just saying "the sock" would be enough, and yet the confederate says "the red sock" (that's what the sound file "g4_c1_1" contains). So if we just change the sound file to one where she says "the sock", that will produce a minimally descriptive confederate. It turns out there are two suitable sound files, "g4_1" and "g4_2" (look in the `sounds` folder) so either of those will do. E.g. we can change that one line in constructiong `interaction_trials` to

```js
var interaction_trials = [
  ...
  //critical trial (confederate describes red sock using adjective)
  make_picture_selection_trial("g4_1", "g4_c1", "g2_c3"),
  ...
];
```

### Now try running the `conferedate_priming_readfromcsv.html` experiment - you don't have to work through the whole experiment, just a few trials! Again, check you can see your data on the server.

Nothing tricky here!

### For this version of the experiment, how do you switch from an overspecific to minimally-specific confederate? (Hint: this involves changing the name of the file used by the `read_trials_and_prepare_timeline` function in the very last line of the code).

Hopefully at this point in the practical you figured out that the `read_trials_and_prepare_timeline` function at the end of the code takes a filename, either `overspecific_confederate.csv` or `minimal_confederate.csv`, and if you use a different filename you get a different kind of confederate. So at the moment the code loads the file for the overspecific confederate:

```js
read_trials_and_prepare_timeline("overspecific_confederate.csv");
```

And if we just change the file name it loads, we'll get the minimally specific confederate:

```js
read_trials_and_prepare_timeline("minimal_confederate.csv");
```

Note that this confederate *still uses colour adjectives when they are required*, which in this randomisation of the trial list happens in the first couple of trials - but they don;t use them when they are not required, hence they are minimally specific and not underspecific.


### Building on the previous question: how would you randomly allocate a participant to one of these two conditions, overspecific or minimally specific? 

[We already provided thoughts on how this could be done](oels_practical_wk8_extended.md) (which also covers the harder question later on). 

### For either of these experiments, figure out how to disable image preloading for the button images and re-run the experiment. Can you see the difference? If it works smoothly, try running the experiment in Chrome in Incognito mode, which prevents your browser saving images etc for you. Can you see the difference now?

Our preloading is done by creating a preload trial and adding it to the timeline, so if you just delete the `preload` trial from the timeline that will disable preloading. E.g. in the basic `confederate_priming.js` code:

```js
var full_timeline = [].concat(
  consent_screen,
  audio_permission_instructions1,
  audio_permission_instructions2,
  preload, //delete or comment out this line to disable preloading!
  write_headers,
  pre_interaction_instructions,
  interaction_trials,
  final_screen
);
```

If you delete the preloading you should see that you get a slight delay before the images appear, particularly if you are on a slow internet connection (e.g. tethering via your phone).

### [Harder, optional] Can you change the `random_wait` function so it generates longer waits early in the experiment and shorter waits later on? 

[We already provided thoughts on how this could be done](oels_practical_wk8_extended.md) 

## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
