require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//db stuff start
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://humanoid:test123@cluster0.d3l1p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

let shortener_db
let shortener_schema = new mongoose.Schema({ //Let's keep this the same schema as the fcc demo
  original_url: String,
  short_url: Number,
})
//db stuff end

shortener_db = mongoose.model('shortener_db', shortener_schema)

//middleware stuff start
const bodyparser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded())

// parse application/json
app.use(bodyparser.json())

const urlparser = require('url');
const dns = require('dns');

//middleware stuff end
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (error, address) =>{
    if(!address){
      res.json({error: 'invalid url'});
      return;
    }
    let count = await shortener_db.count();
    const json_to_send = {original_url: url, short_url: count};
    let new_user = new shortener_db(json_to_send);
    new_user.save();
    res.json(json_to_send);
  })
});

app.get('/api/shorturl/:shortener', async(req, res) => {
  try{
  let document_to_send = await shortener_db.findOne({short_url: req.params.shortener});
  if(!document_to_send){
    res.json({error: "No short URL found for the given input"})
    return
  }
  res.redirect(document_to_send.original_url)
  } catch (error) {
    res.json("Unable to fetch")
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
