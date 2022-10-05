---
title: Week 3 practical, notes
description: Some notes on answers to the practical questions
---

### How would you add extra judgment trials to this code, to ask people about the grammaticality of some additional sentences? Try adding a few new judgment trials.

This should be pretty easy and involves two steps: 
1. Copy and paste the existing example judgment trials, and then edit the `stimulus`.
2. Add the new trial to the timeline. 

So for example: the last judgment trial in the code you were given looks like this:

```js
//Filler sentence, ungrammatical
var judgment_trial_4 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Did where Blake buy the hat?",
  prompt:
    "<p><em>Could this sentence be spoken by a native speaker of English? Press y or n</em></p>",
  choices: ["y", "n"],
};
```

and the timeline looks like this (notice that our trial, `judgment_trial_4`, slots in at the end):

```js
var full_timeline = [
  consent_screen,
  instruction_screen_1,
  instruction_screen_2,
  judgment_trial_1,
  judgment_trial_2,
  judgment_trial_3,
  judgment_trial_4,
  final_screen,
];
```

We can create a new trial, which we could call `judgment_trial_5`, like this:

```js
//An extra trial
var judgment_trial_5 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Did where Jess buy the shoes?",
  prompt:
    "<p><em>Could this sentence be spoken by a native speaker of English? Press y or n</em></p>",
  choices: ["y", "n"],
};
```

and add it at the end of the timeline:

```js
var full_timeline = [
  consent_screen,
  instruction_screen_1,
  instruction_screen_2,
  judgment_trial_1,
  judgment_trial_2,
  judgment_trial_3,
  judgment_trial_4,
  judgment_trial_5, //added here
  final_screen,
];
```

### Have a look at the data that is displayed at the end of the experiment. This is in comma-separated format, so a series of columns separated by commas, the very first row of the data gives you the column names. Can you see where the stimulus and the response for each trial is recorded? Is there anything in the data you weren't expecting or don't understand? Tip: this can be a bit unwieldy to look at on the screen, so you might want to copy and paste it into a spreadsheet app (e.g. Excel) and look at it there. Copy the text on the screen, paste it into e.g. Excel then use the "Text to Columns" command (under the Data menu in Excel on my mac) to format it - the data is comma-separated, there is a comma between each column, so you want to select "Delimited" with comma as the delimiter. If you get that right you'll suddenly go from a big mess to a nice spreadsheet with columns, which will help you make sense of it.

Hopefully you were able to figure out that the stimulus appears in a column called "stimulus", and the response is in a column called "response". The response will be the keypress for our judgment trials, so you should see a sequence of "y" and "n" responses there, but you'll notice it also displays the stimulus and response for all our information screens, which involve button rather than key responses - we'll talk about interpreting response values for button-response trials later in the course.

### Can you change the information screens so that participants progress to the next screen by pressing any key on the keyboard? 

Our information screens currently use the `html-button-response` plugin, e.g.:

```js
var instruction_screen_1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Instructions</h3> \
    ...",
  choices: ["Click to proceed to the next page"],
};
```

But you also have examples of trials in this same experiment where we collect keyboard responses using the `html-keyboard-response` plugin - the judgment trials, see above for several examples. So the trick here is to switch our instruction trials to `html-keyboard-response`. We do that by changing the `type` parameter to `jsPsychHtmlKeyboardResponse` (again, look at how the type parameter is set in the judgment trials). But we also need to change the `choices` parameter. For an `html-button-response` trial the `choices` parameter gives the labels on the button(s) that people click on - but for an `html-keyboard-response` trial it is the keys you are allowed to press (e.g. for our judgment trials we specify `choices: ["y","n"]`, i.e. the y or n keys are allowed). So we also have to change the `choices` parameter. But how do we change it to allow *any* key to be pressed? 

You might be tempted to just include a list of all the keys, like `choices: ["q","u","e","r","t","y",...]` etc, but that would be really inefficient. A quick look at [the documentation for html-keyboard-response](https://www.jspsych.org/7.3/plugins/html-keyboard-response/) gives the solution: the default for `choices` is `"ALL_KEYS"` which means that any key press is accepted. So we can either just omit the `choices` parameter entirely and rely on this default:

```js
var instruction_screen_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h3>Instructions</h3> \
    ..."
    //not specifying choices, so it defaults to "ALL_KEYS"
};
```

Or we can explicitly specify we will accept `"ALL_KEYS"` in the `choices` parameter:

```js
var instruction_screen_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h3>Instructions</h3> \
    ...",
  choices: "ALL_KEYS",
};
```

### Can you change the judgment trials so participants can provide a single-digit numerical response, e.g. any number between 1 and 9, rather than simply allowing y or n as valid responses? That numerical response could indicate a more continuous scale of grammaticality, a bit more like Sprouse's magnitude estimation task.

Following on from the previous couple of questions here: the trick is to change the `choices` parameter of our judgment trials, so that rather than only allowing "y" or "n" as choices we allow "1", "2", etc:

```js
//Filler sentence, ungrammatical
var judgment_trial_4 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Did where Blake buy the hat?",
  prompt:
    "<p><em>Could this sentence be spoken by a native speaker of English? Press 1 to 9</em></p>",
  choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};
```

As far as I can tell there isn't a shortcut for this that avoids enumerating all the number keys (i.e. there's no equivalent to `"ALL_KEYS"` that accepts only numbers).

### Can you change the judgment trials so the participants provide their responses by clicking yes/no buttons, rather than using the keyboard? (Hint: look at how I did the button on the consent screen)

This is essentially the reverse of the earlier question where we asked you to convert the instruction screens from `html-button-response` to `html-keyboard-response` - now we want to go in the opposite direction. This involves changing the `type` parameter, but also deciding what the `choices` will be - remember, for button-response trials the choices give the labels on the buttons. So we were looking for something like this:

```js
//Filler sentence, ungrammatical
var judgment_trial_4 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "Did where Blake buy the hat?",
  prompt:
    "<p><em>Could this sentence be spoken by a native speaker of English?</em></p>",
  choices: ["yes", "no"],
};
```

### How would you use buttons to provide a wider range of responses (e.g. "completely fine", "a little strange", "very strange", ...)?

Again, this is just messing with the `choices` parameter.

```js
//Filler sentence, ungrammatical
var judgment_trial_4 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "Did where Blake buy the hat?",
  prompt:
    "<p><em>Could this sentence be spoken by a native speaker of English?</em></p>",
  choices: ["completely fine", "a little strange", "very strange"],
};
```


### [More challenging] Sprouse (2011) actually uses a rather different layout and type of response: he has participants enter a numerical value for each sentence, has multiple judgments presented on a single page, and provides a reference sentence (e.g. an example sentence which should receive a score of 100) at the top of each page. Can you replace our simple yes/no judgment trials with something more like what Sprouse did, using the jsPsych [survey-text plugin](https://www.jspsych.org/7.3/plugins/survey-text/)?

The place to start here is with the documentation for that plugin. In particular, I note that it's got a `preamble` parameter for displaying text at the top (which we could use to display our reference sentence), and then we can provide a list of questions (which will be our judgments). The documentation on the format of those questions is a bit cryptic, but the examples further down the page are very helpful. Copying, pasting and then tweaking one of those examples I end up with:

```js
var survey_text_judgment_trial = {
  type: jsPsychSurveyText,
  preamble:
    "<p style='text-align:left'>Give each sentence a numerical value.\
    This example sentence would receive a score of 100:</p>\
  <p><em>Who said my brother was kept tabs on by the FBI?</em></p>\
  <p style='text-align:left'>Now provide ratings for the sentences below.</p>",
  questions: [
    { prompt: "Where did Blake buy the hat?" },
    { prompt: "What did you claim that Blake bought?" },
    { prompt: "What did you make the claim that Blake bought?" },
    { prompt: "Did where Blake buy the hat?" },
  ],
};
```

A couple of things to note: 
- The `preamble` parameter is an html-formatted string, so I use some of the tricks you have seen elsewhere (paragraph tags, emphasis tags) to make it look how I want.
- The `questions` parameter is a list of questions, where each one is of the form `{ prompt: ...}`. 
- There are various shortcomings with this little bit of code - it allows non-numeric responses, it allows non-responses - but it's just intended to be a basic example of how you can achieve different effects by using different plugins!

To use this bit of code we also have to load the appropriate plugin in our HTML file, and slot `survey_text_judgment_trial` into our timeline. For a full working example download these two files and stick them in your `grammaticality_judgments` folder:
- <a href="code/grammaticality_judgments/grammaticality_judgments_surveytext.html" download> Download grammaticality_judgments_surveytext.html</a>
- <a href="code/grammaticality_judgments/grammaticality_judgments_surveytext.js" download> Download grammaticality_judgments_surveytext.js</a>


## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
