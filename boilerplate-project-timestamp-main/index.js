// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:input_date?", (req, res) => {
  let timestamp

  if(req.params.input_date){
    let to_be_timestamped = req.params.input_date;
      if(!to_be_timestamped.includes("-") && !to_be_timestamped.includes(" ")){ //if date formatting
        to_be_timestamped = parseInt(to_be_timestamped)
      }
    timestamp = new Date(to_be_timestamped);
  }else{
    timestamp = new Date(Date.now())
  }

  if(timestamp.toUTCString() === "Invalid Date"){
    res.json({error: timestamp.toUTCString()})
    return
  }
  res.json({unix: timestamp.getTime(), utc: timestamp.toUTCString()});
})

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
