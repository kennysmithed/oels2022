/******************************************************************************/
/*** Infrastructure for recording audio ***************************************/
/******************************************************************************/

/*
Capturing audio in javascript is actually fairly straightforward thanks to the
getUserMedia and MediaRecorder functions. We want to create a single MediaRecorder
which we use throughout the experiment, so the participant doesn't have to grant
microphone access repeatedly.

NB. The code handling various bits of audio recording was developed with help from
Annie Holz and Alisdair Tullo.
*/

/*
Global variables needed for recording and saving audio
*/
var recorder; // MediaRecorder
var recording_counter = 0; //to keep track of recording index
var audio_chunks = []; //empty array for audio (blob) content
var next_audio_filename; //used to keep track of filename where audio should be saved

/*
error_quit throws error and displays message if experiment is run in browsers
that do not support MediaRecorder, or if microphone access is denied. This is done
outside the jsPsych framework for simplicity, using some straight html.

declined_audio_message and wrong_browser_message are standard error messages for
different problems.
*/

function error_quit(message) {
  var body = document.getElementsByTagName('body')[0];
  body.innerHTML = '<p style="color: #FF0000">'+message+'</p>'+body.innerHTML;//defines the style of error messages
  throw error;
};

var declined_audio_message = "You must allow audio recording to take part in the \
experiment. Please allow access to your microphone and reload the page to proceed.";

var wrong_browser_message = "Sorry, it's not possible to run the experiment on your \
web browser. Please try using Chrome or Firefox instead.";


/*
Attempts to access the user microphone. Either starts handlerFunction if access
to microphone is enabeled, or catches that it is blocked and calls error_quit function
*/
function request_mic_access() {
  navigator.mediaDevices.getUserMedia({audio:true})
  .then(stream => {handler_function(stream)})
  .catch(error => {error_quit(declined_audio_message)});
}

/*
handler_function catches incompatibility with MediaRecorder (e.g. in Safari), again
using error_quit to notify the user. Assuming the MediaRecorder object is created
safely, we create two functions which 1) handle incoming data to the recorder object
(i.e. new audio, which we add to audio_chunks) and 2) save the audio (as a .webm
file) when the recording is stopped - sata is saved using the save_audio function,
to the filename stored in next_audio_filename.
*/
function handler_function(stream) {
    try {
      recorder = new MediaRecorder(stream);
    } catch(error) {
       error_quit(wrong_browser_message);
       };

    recorder.ondataavailable = e => {
        audio_chunks.push(e.data);//pushes blob to "audio_chunks" variable above
    };

    recorder.onstop = e => { //handles the stop event, everything below happens when
                        //stop_recording() is called.
        let blob = new Blob(audio_chunks,{type:'audio/webm'});
        save_audio(next_audio_filename, blob);
    };
};

/******************************************************************************/
/*** Saving audio data  *******************************************************/
/******************************************************************************/

/*
save_audio handles the saving of audio data, using the save_audio.php script to save
the audio data blob to saved_audio_filename on the server.
*/
function save_audio(saved_audio_filename, audio_data) {
  var url = 'save_audio.php'; // external .php file that should be in same folder as your experiment
  form_data = new FormData();
  form_data.append("filename", saved_audio_filename);
  form_data.append("filedata", audio_data);
  fetch(url, {
      method: 'POST',
      body: form_data
  });
};


/******************************************************************************/
/*** Starting and stopping audio recording ************************************/
/******************************************************************************/

/*
These are simple functions that access the recorder object and associated variables
(audio_chunks, next_audio_filename) to initiate recordings, and increment
recording_counter after a recording is stopped.
*/

function start_recording(filename_prefix) {
      audio_chunks = []; //clears global audio_chunks of previous content, needed for recording multipe trials in seperate files
      next_audio_filename = filename_prefix + '_' + recording_counter; //name of audio file will be something like myaudio_0.webm
      recorder.start(); // starts audio recording
    }

function stop_recording() {
      recorder.stop(); // stops recording and triggers onstop event associated with the rec object
      recording_counter +=1; //increment the recording counter
  }
