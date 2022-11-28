---
title: Co-speech gesture
description: Videos with button-press or text box responses
---

This is a simple experiment where participants give a response to a single video presentation of someone (Bodo Winter) speaking and gesturing. We'll look at two versions of this experiment, which differ in whether participants give their response by clicking on a button on-screen, or by entering a text response in a text box. I wrote it for a workshop I ran for Bodo's group at Birmingham in May 2022, this was the first practical they did but I have stripped out some of the more basic instructions here.

## A co-speech gesture experiment

As a result we are going to need a bunch of files - code for two versions of the experiment, plus some video files (the actual videos from Experiment 1 of Winter & Duffy 2020, which I got from [https://github.com/bodowinter/wednesday_question](https://github.com/bodowinter/wednesday_question)). To get all this stuff, download the following zip file and uncompress it:
- <a href="code/cospeech_gesture.zip" download> Download cospeech_gesture.zip</a> 

If you look at the contents, you'll see there are two html files (one for the button response version of the experiment, one for the text response version), two corresponding javascript (`.js`) files, and then a folder containing another folder containing the videos. I have also included a copy of jsPsych in the zip, so this zip file includes everything you need for this experiment. 

We'll start by looking at the button response version of the experiment. This code should run on your local computer - just open the `cospeech_gesture_buttons.html` file in your browser. Or you can upload it to the jspsychlearning server and play with it there.

First, get the code and run through it so you can check it runs, and you can see what it does. Then take a look at the HTML and js files in your code editor.

You will see that `cospeech_gesture_buttons.html` doesn't have much in it - all that does is use the `<script>...</script>` tag to load a couple of plugins plus the file `cospeech_gesture_buttons.js`.

The bulk of the code is in `cospeech_gesture_buttons.js`. `cospeech_gesture_buttons.js` is probably one of the simplest types of experiments you could build. It has a single experimental trial, where participants watch a charming video then provide a response by clicking on one of two on-screen buttons. Note that is slightly different from what Winter & Duffy (2020) did - they got people to type text in a box on a second screen, we'll come to that later.

There is also a little bit of wrapper around that single trial - a consent screen where participants click a button to give consent and proceed to the experiment, an information screen before the experimental trial, and then a final screen where you can display debrief information, completion codes etc to participants.

The code starts by laying out the single video trial. The experimental trial involves showing the participant a video and getting a single  response from them, which we can achieve using the `video-button-response` plugin from jsPsych. Details of the options for that plugin are in the [jsPsych documentation](https://www.jspsych.org/7.3/plugins/video-button-response/). We are using the `stimulus` parameter to hold the video the participant sees. We need to tell the code where exactly to look for the video file - in the `videos` folder, then within there in the `experiment1` folder, then we give the full name of the video file we want, which is `E1_A_FG_BL.mp4` (I am guessing that means Experiment 1, video A, Forward Gesture, Backward Language). So the full path to the video is `"videos/experiment1/E1_A_FG_BL.mp4"`.

`choices` is an array giving the labels on the buttons they will see - there are two buttons, so there are two items in that array. 

If that was all we did, participants would be able to respond before the video had completed playing, which we don't want, so the `video-button-response` plugin also allows us to specify whether or not participants can respond while the video is playing - I set that option to `false` (it defaults to `true`, so if it's not specified participants will be able to interrupt). 

The plugin also allows you to specify various other things, like a text prompt to tell people what to do, or stuff about the size of the video or the playback speed, but we won't mess with that. So our single trial looks like this:  

```js
var video_trial = {
  type: jsPsychVideoButtonResponse,
  stimulus: ["videos/experiment1/E1_A_FG_BL.mp4"],
  choices: ["Monday", "Friday"],
  response_allowed_while_playing: false,
};
```

That's basically the only interesting part of the code! But we also need some preamble for the participants. Most experiments start with a consent screen, where participants read study information and then consent to participate. I include a placeholder for this consent screen using the `html-button-response` plugin - you see the consent information and then click a button to indicate that you consent. The code for that looks as follows:

```js
var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3>\
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant\
  what they will be doing, how their data will be used, and how they will be remunerated.</p>\
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed\
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};
```

I also define an instruction trial with instructions on what to do on the experimental trial - this is also a `html-button-response` trial, just like the consent screen. 

There are several other options for instruction screens - `html-keyboard-response` would be OK (where participants press a keyboard key rather than an on-screen button - we'll see that plugin soon), although I find it's a bit too easy to advance through lots of those by mashing the keyboard; jsPsych provides [an instructions plugin](https://www.jspsych.org/7.3/plugins/instructions/) which allows you to specify multiple pages in a single trial and gives participants the ability to scroll forwards and backwards through those pages. 

Once all the various trials are defined, we can stick them together in a timeline for the experiment. The timeline is very simple and is just a list of all the trials we have created up to this point:
```js
var full_timeline = [
  consent_screen,
  instruction_screen,
  video_trial,
  final_screen,
];
```

Then to run the experiment we call `jsPsych.run` with this `full_timeline` variable we have created. 


## Exercises with the co-speech gesture experiment code

Attempt these problems.

- If you ran the code on the server, did you notice anything odd/bad when the video trial first loaded? If not, try loading the experiment again in an incognito/private browser window (because those don'd cache videos and images). You should notice that there is a short delay before the video displays - the slower your network, the more noticeable the delay. jsPsych provides tools to avoid this by *preloading* stimuli, we'll cover those later.
- Have a look at the data that is displayed at the end of the experiment. This is in comma-separated format, so a series of columns separated by commas, the very first row of the data gives you the column names. Can you see where the stimulus and the response for the experimental trial is recorded? Is there anything in the data you weren't expecting or don't understand? Tip: this can be a bit unwieldy to look at on the screen, so you might want to copy and paste it into a spreadsheet app (e.g. Excel) and look at it there. Copy the text on the screen, paste it into e.g. Excel then use the "Text to Columns" command (under the Data menu in Excel on my mac) to format it - the data is comma-separated, there is a comma between each column, so you want to select "Delimited" with comma as the delimiter. If you get that right you'll suddenly go from a big mess to a nice spreadsheet, which will help you make sense of it.
- How would you change the video that participants see on the experimental trial? Try plugging in a different video to see if you got it right.
- How would you add an extra experimental trial to this code, to ask people for judgments on multiple videos, one after another? Try adding second experimental trial with a different video.
- Can you change the experimental trial so participants have more than two options?


## Optional: a version of the code with text responses

Rather than getting a 2-alternative forced choice response, as implemented above, Winter & Duffy (2020) actually asked participants for a text response on a separate screen from the video. That's also easy to do in jsPsych, and is implemented for you in `cospeech_gesture_text.html` and `cospeech_gesture_text.js` - you can run those in the same way as the buttons version, either opening the html file locally or on the server.

As you will see if you look in the code, the differences in the html file are minimal - we load an extra plugin, `survey-text`, and we point to our `cospeech_gesture_text.js` file rather than `cospeech_gesture_buttons.js`. 

There are two main differences in the `.js` file. The first set of changes are in the video presentation trial. We need to change that trial to remove the buttons we previously used to gather responses - this is easy, we just set the `choices` parameter to an empty array, `[]`, so there are no on-screen buttons. Because the participant can't respond given the absence of buttons, we can also get rid of the `response_allowed_while_playing` parameter - it wouldn't do any harm to leave it, but it's unnecessary so probably simpler to strip it out. However, we still need a way for the trial to end - by default response trials in jsPsych last until participants provide a response, and here we have removed all the response options, so unless we add something we'll have created an infinite-duration trial! In this case we want the trial to last until the video has finished, and conveniently the `video-button-response` has a parameter to do this, `trial_ends_after_video`, which we set to `true`. So the modified video trial looks like this:

```js
var video_trial = {
  type: jsPsychVideoButtonResponse,
  stimulus: ["videos/experiment1/E1_A_FG_BL.mp4"],
  choices: [], //no choices = no buttons
  trial_ends_after_video: true
};
```

In order to collect our text response, we need to add an additional trial to the timeline. We are going to use the [`survey-text` plugin](https://www.jspsych.org/7.3/plugins/survey-text/) to do this - it's really designed for presenting multiple text-response questions on a single screen, but we can use it for a single question. Here's what the code for that trial looks like:

```js
var text_response_trial = {
  type: jsPsychSurveyText,
  questions: [
    { prompt: "What day has the meeting been rescheduled to?", required: true },
  ],
};
```

You'll see that the `type` parameter specifies that it's a `jsPsychSurveyText` trial, and all the action is in the `questions` parameter. `questions` is an array - so it could include many questions, but here there's only one item in the array, which means one on-screen question. Each question is a javascript object (enclosed in curly brackets), for which we can specify various parameters. Here I am setting the `prompt`, which is the on-screen text that appears above the question, and the fact that a response is `required` (by default responses aren't required). If you want to see what else can be specified for questins in the `survey-text` plugin, check out [the plugin documentation](https://www.jspsych.org/7.3/plugins/survey-text/). There are also other survey plugins provided by jsPsych - this one is designed for text response surveys, we'll see a more flexible one later in the course that allows you to mix different response types in a single survey page.

Finally, we need to adjust the experiment timeline to include this additional trial - the new timeline looks like this:

```js
var full_timeline = [
  consent_screen,
  instruction_screen,
  video_trial,
  text_response_trial,
  final_screen,
];
```

## Exercises with the co-speech gesture experiment code

- Once again, have a look at the data that is displayed at the end of the experiment, and see if you can pinpoint where and how the participant's text response is recorded.
- Can you change the experimental trial so participants have to provide two text responses (e.g. name the day and one of the follow-up questions Winter & Duffy asked, e.g. "Any observations, thoughts, ideas you want to share with us about the person you just saw or the question you were being asked?"? You could try adding this as a second question on the same screen or as a stand-alone question on an additional trial.

## References

- [Winter, B., & Duffy, S. E. (2020). Can Co-Speech Gestures Alone Carry the Mental Time Line?
*Journal of Experimental Psychology: Learning, Memory, and Cognition, 46,* 1768-1781.](http://pure-oai.bham.ac.uk/ws/portalfiles/portal/96040354/winter_duffy_gesture_timeline_revisions_complete.pdf)
## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
