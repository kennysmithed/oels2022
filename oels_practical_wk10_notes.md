---
title: Week 10 practical, notes
description: Some notes on answers to the practical questions
---

### Run the experiment and look at the CSV data files it creates (one per participant). Check that the contents of the data files make sense and how they relate to what you see as a participant.

Not too much to say here - the format of the data files should be fairly transparent. The only possibly slightly confusing thing is that the stimulus and button_selected columns do double duty - so for example there is a text label under stimulus on matcher trials, but it's an image name on director trials.

### How would you increase the number of training trials in the observation phase of the experiment?

The key part of the code looks like this:

```js
var observation_trials = jsPsych.randomization.repeat(
  [
    observation_trial_obj4_long,
    observation_trial_obj4_short,
    observation_trial_obj5_long,
    observation_trial_obj5_short,
  ],
  [6, 6, 2, 2]
);
```
We have previously created 4 observation trials, featuring our two objects each with their short and long label; here we repeat and randomise them, such that we get 6 occurrences of object 4 and its long label, 6 occurrences of object 4 and its short label, etc. So if you wanted to change those numbers, e.g. to double the amount of exposure, you could simply change this to:

```js
var observation_trials = jsPsych.randomization.repeat(
  [
    observation_trial_obj4_long,
    observation_trial_obj4_short,
    observation_trial_obj5_long,
    observation_trial_obj5_short,
  ],
  [12, 12, 4, 4]
);
```

### It's also possible to change the number of interaction trials, but this will involve editing the python server code and running your own private python server with your edited version. The relevant line is line 61 of `dyadic_interaction_server.py`, which looks like this: ... This creates a variable, `target_list`, which consists of 6 occurrences of `object4` and 2 of `object5`. Even if you have never seen python before, hopefully you can guess how to edit this list to change the relative proportions of the two objects or the total number of trials.

The relevant line is:

```py
target_list = ['object4','object4','object4','object5']*2
```

That's a list of targets - `object4` 3 times, `object5` once - that is then doubled (giving 6 occurrences of `object4` and 2 of `object5`). So if you want to change the overall number you could change the `*2` bit to e.g. `*1` or `*4`. If you want to change the proportion you have to change the list - e.g. to change it to 2 occurrences of `object5` to every 3 of `object4`, you could do:

```py
target_list = ['object4','object4','object4','object5','object5']*2
```

### In the Accuracy condition of Kanwal et al., participants interacted in dyads but there was no additional production effort associated with producing longer labels. How would you edit the jsPsych code to replicate the Accuracy condition? (Hint: you need to be looking at the `director_trial` function in `dyadic_interaction.js`, which creates the three sub-trials that make up a director trial, and change the value assigned to `n_clicks_required`).

At the moment we specify the number of clicks required in the `on_finish` of the 2nd sub-trial of the director trials, where the participants select a label (line 541 of `dyadic_interaction.js`). 

```js
n_clicks_required = label_selected.length; //this determines how many times we click in the loop
```

So at the moment, longer labels require more clicks. You could change that by just setting `n_clicks_required` to 1, so that short and long labels can both be produced with a single click:

```js
n_clicks_required = 1;
```

In that case it might make sense to remove the looping trial that handles the repeated-clicking step, and just have participants select a label to send, but that is more work for you.

### How could you manipulate production effort in the other direction, making long labels even more effortful to produce?

I think the key thing here is the *relative* effort of short and long labels - at the moment it is 3 clicks vs 7 clicks, so we want the difference to be even bigger. E.g. we could keep the 3-character labels as 3 clicks, but make the 7-character labels require 10 clicks:

```js
if (label_selected.length==3) {
  n_clicks_required = 3;
}
else {
  n_clicks_required = 10;
}
```

That's just an if-statement setting the pre-created `n_clicks_required` variable to the value we want, depending on the length of the selected label. There are other more creative things you could do here!

### [Hard, optional] Can you create a version of the experiment where participants deal with more than 2 objects, e.g. 4 objects, organised in two pairs with a short ambiguous label shared across the two objects in each pair, or maybe 4 objects with unique labels and a single shared short label? This will involve changing the trial lists in the observation and interaction phases, but also some parts of the client code that make assumptions about which objects and labels participants will encounter during interaction.

I am going to go for the first option, two pairs of objects, each pair shares a short label. First, I am going to run the server for this extended version on a different port, so I can have the basic and extended versions both running (the server code is slightly different). I will use "ws2" for the extended one, so I have to change the `my_port_number` variable so my clients connect to the correct server.

```js
var my_port_number = "/ws2/";
```

Next I have to change my lists of labels and objects (excuse my lack of inspiration for the new labels): 

```js

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
```

Next we have to provide observation trials for the new objects - we can just extend the code that generates the existing observation trials:

```js
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
```

The only other change on the javscript side (apart from some tiny rewordings in the instructions) is to extend the if-else statements at the start of `director_trial` so that it knows where to find the labels to present the director when the target is `object1` or `object2`.

```js
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
  ...
```

And that's it on the client side - the code was already pretty general. The final thing to do is to make two small changes to the server, so that it runs on port 9002 (which matches up with ws2 that the clients connect on) and so it has interaction trials for all the objects:

```py
# Extended target list here
target_list = ['object4','object4','object4','object5','object1','object1','object1','object2']*2

#much much later...

PORT=9002 #this will run on port 9002
```

That's it. If you want to see this in action you can download my code through the following three links:
- <a href="code/dyadic_interaction_extended/dyadic_interaction_extended.html" download> Download dyadic_interaction_extended.html</a>
- <a href="code/dyadic_interaction_extended/dyadic_interaction_extended.js" download> Download dyadic_interaction_extended.js</a>
- <a href="code/dyadic_interaction_extended/dyadic_interaction_server_extended.py" download> Download dyadic_interaction_server_extended.py</a>

Drop these into your `dyadic_interaction` folder alongside the original version and they will be able to access the stimuli etc folders that are already there; I am already running the modified server but if you want to run your own copy, put `dyadic_interaction_server_extended.py` in `dyadic_interaction/server`.

## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
