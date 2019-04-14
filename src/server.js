var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var aWss = expressWs.getWss('/')
var userCount = 0;
var voteTrue = 0;
var voteFalse = 0;
var voteFinal = "";
var jsonParse = "";

app.use(function (req, res, next) {
  //console.log('middleware');
  req.testing = 'testing';
  console.log("connected");
  userCount ++;
  //return next();
});
 
app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  //res.end();
});

app.ws('/', function(ws, req) {

  ws.on('message', function(msg) {
    console.log(userCount);
    console.log(msg);
    console.log(JSON.stringify(msg));
    
    aWss.clients.forEach(function (client) {
        client.send(JSON.stringify({command: "userCount", message: userCount}));
    });

    console.log(userCount);

    ws.send(JSON.stringify({command: "userCount", message: userCount}));

    console.log(jsonParse);
    if(jsonParse.choice === "askQuestion"){
        aWss.clients.forEach(function (client) {
            if (client !== ws) client.send(JSON.stringify({command: "beginVote", message: "beginVote"}));
        });  
        console.log("Question Asked!");
    }
    if(jsonParse.choice === "votingEnd"){
        if(voteTrue > voteFalse){
            voteFinal = true;
        }else if(voteFalse > voteTrue){
            voteFinal = false;
        }else{
            voteFinal = "draw";
        }
        aWss.clients.forEach(function (client) {
            client.send(JSON.stringify({command: "voteCount", message: voteFinal}));
            console.log("VOTING ENDS");
        });         
    }

    if(jsonParse.choice === true){
        voteTrue++;
        console.log("TRUE VOTE");
        //ws.send(JSON.stringify({command: "reset", message: "true was chosen"}));
    }
    if(jsonParse.choice === false){
        voteFalse++;
        console.log("FALSE VOTE");
        //ws.send(JSON.stringify({command: "reset", message: "false was chosen"}));
    }
    else{
        ws.send(JSON.stringify({command: false, message: "Connected"}));
    }
  });

  ws.on('close', function(){
    userCount --;
    aWss.clients.forEach(function (client) {
        client.send(JSON.stringify({command: "userCount", message: userCount}));
    });    
  })
});

app.listen(3001);