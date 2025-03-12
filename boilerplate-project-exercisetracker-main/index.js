const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose'); //we need to use an old version on mongoose (mongoose@^5.11.15) apparently, since the newest one doesn't work for god knows what reason (error 80, it's not IP not being whitelisted, trust me. I checked)
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//db stuff start
mongoose.connect("mongodb+srv://humanoid:test123@cluster0.d3l1p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

let user_schema = new mongoose.Schema({
  username: String,
});

let exercise_schema = new mongoose.Schema({
  linked_id: String,
  date:	Date,
  duration: Number,
  description: String,
});

let user_db = mongoose.model('username', user_schema);
let exercise_db = mongoose.model('exercise', exercise_schema);
//db stuff end

//middleware stuff start
const bodyparser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded())

// parse application/json
app.use(bodyparser.json())
//middleware stuff end

app.post('/api/users', function(req, res) {
  //if this was a real app. put validation here, and/that or frontend
  let new_user = new user_db({username: req.body.username});
  new_user.save();
  res.json({username: new_user.username, _id: new_user._id});
})

app.get('/api/users', function(req, res) {
  user_db.find().lean().exec(function (err, users) {
    if(err){
      return console.log(`Error: ${err}`);
    }
    return res.json(users);
});
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  //if this was a real app. put validation here, that and/or frontend
  try{
    const user = await user_db.findById(req.body[":_id"])
    if(!user){
      return res.send("No User found!")
    }

    let timestamp = new Date(req.body.date);
    if(isNaN(timestamp)){
      timestamp = new Date(Date.now());
    }

    let save_to_db = new exercise_db({linked_id: req.body[":_id"], date: timestamp, duration: Number(req.body.duration), description: req.body.description});
    save_to_db.save();
    
    res.json({
      username: user.username,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: timestamp.toDateString(),
      _id: user._id,

    });
      
  } catch(err){
    res.send(`Error: ${err}`);
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const user = await user_db.findById(req.params._id)
  let date = {}
  let filter = {
    linked_id: req.params._id
  }
  if(req.query.from){
    date["$gte"] = new Date(req.query.from)
  }
  if(req.query.to){
    date["$lte"] = new Date(req.query.to)
  }
  if(req.query.from || req.query.to){
    filter.date = date
  }

  const exercises_record = await exercise_db.find(filter).limit(+req.query.limit ?? 1000)
  const logs = exercises_record.map(i => ({
    description: i.description,
    duration: i.duration,
    date: i.date.toDateString()
  }))

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs
  })
})

app.get('api/users/:_id/logs?[from][&to][&limit]', function(req, res){

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
