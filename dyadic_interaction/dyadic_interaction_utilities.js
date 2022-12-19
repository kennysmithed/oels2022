//create a global websocket variable that we can access everywhere
var ws;

/*
interaction_loop() handles the interaction with the server: clients sit here while waiting
for input from the server, and then take actions based on the instructions they
receive from the server.

ws is a websocket that connects to one of the servers at Edinburgh, jspsychlearning.
For development purposes you might want to connect to a server running on localhost,
in which case your line to create the websocket would look something like:
ws = new WebSocket("ws://localhost:9011")
if you are running your server on port 9011.

The websocket code we are using for the server comes from
https://github.com/Pithikos/python-websocket-server, they have a simple example
client and server if you want to start from something simpler!

Sockets just send strings of characters back and forth - we use JSON.stringify
to encode javascript objects into a format that can be interpreted into python
dictionaries at the other end, and JSON.parse to convert the strings from the server
into javascript objects that we can work with here.

I am using a couple of conventions to simplify processing of the messages received
by the server and the client.

Every message the client sends the server is an object including a key
called response_type - the server looks at the response_type value to decide what
to do with that client response.

Every message the server sends the client is an object including a key called
command_type - the client looks at the command type to figure out what the server
is asking it to do.
*/

function interaction_loop() {
  //pause the timeline to stop us progressing past this point - incoming commands
  //from the server will unpause us
  jsPsych.pauseExperiment();
  ws = new WebSocket("wss://jspsychlearning.ppls.ed.ac.uk" + my_port_number);
  //ws = new WebSocket("ws://localhost:9011")
  //when establishing connection for first time, send over some info - in this case,
  //the server needs to know participant_id, which is a unique identifier for this
  //participant
  ws.onopen = function () {
    console.log("opening websocket");
    details = JSON.stringify({
      response_type: "CLIENT_INFO",
      client_info: participant_id,
    });
    ws.send(details); //send the encoded string to the server via the socket
  };

  //on receiving a message from the server...
  ws.onmessage = function (e) {
    // e.data contains received string.
    console.log("received message: " + e.data); //display in the console (for debugging!)
    var cmd = JSON.parse(e.data); //parse into a js object
    var cmd_code = cmd.command_type; //consult the command_type key
    handle_server_command(cmd_code, cmd); //handle the command
  };

  //when the server tells you to close the connection, simply log this in the
  //console and close
  ws.onclose = function () {
    console.log("closing websocket");
    ws.close();
  };

  //when there is an error from the socket (e.g. because the server crashes or is
  //down), calls partner_dropout(), which is a function showing a screen telling the
  //participant that something has gone wrong, which allows them to exit the experiment
  //cleanly.
  ws.onerror = function (e) {
    console.log(e);
    partner_dropout();
  };
}

/*
handle_server_command calls the appropriate function depending on the command
the server sent - the different command types are given by command_code (which
was included in the info the server sent), some of the commands require additional
info so we also pass in the full command (a javascript dictionary)

command_code can be many different things:
    PartnerDropout: your partner has dropped out
    EndExperiment: quit, you have finished the experiment
    WaitingRoom: puts client in waiting room
    Instructions: Show instructions
    Director: Director trial
    WaitForPartner: Waiting screen
    Matcher: Matcher trial
    Feedback: Feedback (for both Director and Matcher)

For the Instructions, Director, Matcher and Feedback trial types, the client will
send a response back to the server, indicating the client has completed that trial
and (for Director and Matcher trials) providing information on the director or
matcher's response. This response will trigger actions by the server to 
progress with the experiment.
*/

function handle_server_command(command_code, command) {
  //just for safety I like to check that the command code is one of the legal ones,
  //might give minimal protection against malicious connections
  var possible_commands = [
    "PartnerDropout",
    "EndExperiment",
    "WaitingRoom",
    "Instructions",
    "Director",
    "WaitForPartner",
    "Matcher",
    "Feedback",
  ];
  if (possible_commands.indexOf(command_code) == -1) {
    //this fires is the command is *not* in the list
    console.log("Received invalid code");
  }
  //if the received code is valid, use switch to select action based on command_code
  else {
    switch (command_code) {
      case "PartnerDropout": //PartnerDropout: your partner has dropped out
        partner_dropout(); //direct client to a screen allowing them to exit the experiment cleanly
        break;
      case "EndExperiment": //EndExperiment: you have finished the experiment
        end_experiment(); //direct client to the final screen of the experiment
        break;
      case "WaitingRoom": //WaitingRoom: puts client in waiting room
        waiting_room(); //direct client to the waiting_room() function
        break;
      case "Instructions": //Instructions: Show instructions
        //server passes over an instruction in command.instruction_type,
        //so could potentially use this for different kinds of instructions screens -
        //but in this experiment the only instruction screen handled via the server
        //is the interaction instructions, so no need to do anything fancy
        show_interaction_instructions(); //direct client to the appropriate instruction screen
        //when show_interaction_instructions completes it will send a message back to the server,
        //JSON.stringify({response_type:"INTERACTION_INSTRUCTIONS_COMPLETE"})
        break;
      case "WaitForPartner": //WaitForPartner: infinite waiting
        waiting_for_partner(); //direct client to waiting screen
        break;
      case "Director": //Direct: director trial
        //to run a director trial we need some extra information, included in
        //the command dictionary (target_object and partner_id) - retrieves these
        //and runs director_trial(...) to get the director's response
        director_trial(command.target_object, command.partner_id);
        //when the director enters their label, director_trial sends a response back to the server,
        //which contains quite a lot of information on the trial:
        //JSON.stringify({response_type:'RESPONSE',
        //								participant:unique_participant_id,
        //								partner:unique_partner_id,
        //							  role:role (director in this case),
        //						    target_object:target_object,response:director's label})
        break;
      case "Matcher": //Matcher: matcher trial
        //Matcher selects an object based on command.director_label and sends back a similar
        //response string to director_trial
        matcher_trial(command.director_label, command.partner_id);
        break;
      case "Feedback": //Feedback: feedback for director or matcher
        //The server actually passes across quite detailed info (command.target_object,
        //command.label,command.guess show the full details of the interaction),
        //but here we give simple success/failure feedback so only use command.score.
        display_feedback(command.score);
        //when completed, display_feedback sends a response to the server,
        //JSON.stringify({response_type:'FINISHED_FEEDBACK'})
        break;
      default: //this only fires if none of the above fires, which shouldn't happen!
        console.log("oops, default fired");
        break;
    }
  }
}

/*
Note that we check the connection isopen before sending, and use JSON.stringify
to convert the message object to a JSON string - our python server can convert back
from json to a python dictionary.
*/
function send_to_server(message_object) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message_object));
  }
}

function close_socket() {
  ws.onclose();
}
