
////////////////////////////////
///////  road to hire      ////
//////   take notes!      ////
/////////////////////////////

require('dotenv').config()
const express = require("express");
const MongoClient = require("mongodb").MongoClient
const ObjectId = require('mongodb').ObjectId;
const logger = require("morgan");
const path = require("path");

const app = express();

// note with heroku deployment you must source port from env
const port = process.env.PORT || 3000;

// register middleware component
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Serve up static assets (heroku)
// Connect to Atlas in production
if (process.env.NODE_ENV === "production") {
  uri = process.env.ATLAS_URI;
} else {  
  // localhost
  uri = process.env.LOCAL_URI  
}

// database connection ppol
let db = ""
let dbName = "notetaker"
MongoClient.connect(uri, { useNewUrlParser: true,                            
                           useUnifiedTopology: true }, 
    (err, client) => 
      {
        if (err) {    
          console.log(err) 
          return
        }        
      console.log("Connected successfully to server") 
      db = client.db(dbName)   
});


////////////////////////
///   api end points //
//////////////////////

// serve the hpme page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./public/index.html"));
});

// post a new note
app.post("/submit", (req, res) => { 
  const collection = db.collection('notes')
  collection.insertOne(req.body, (error, data) => {   
    if (error) {
      res.send(error);
    } else {
      res.send(data.ops[0]);
    }
  });
});

// retrieve every document in the collection
// note the .toArray() function to unpack the objects
app.get("/all", (req, res) => {
  const collection = db.collection('notes')
  collection.find({}).toArray((error, data) => {    
    if (error) {
      res.send(error);
    } else {
      res.json(data);
    }
  })
})

// get a specific document based on objectid
app.get("/find/:id", (req, res) => {
  const collection = db.collection('notes')  
  collection.findOne(
    {
      _id: ObjectId(req.params.id)
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

//update a specific document identified by objectid
app.post("/update/:id", (req, res) => {
  const collection = db.collection('notes')
  collection.updateOne(
    {
      _id: ObjectId(req.params.id)
    },
    {
      $set: {
        title: req.body.title,
        note: req.body.note,
        modified: Date.now()
      }
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

// delete one document identified by objectid
app.delete("/delete/:id", (req, res) => {
  const collection = db.collection('notes')
  collection.deleteOne(
    {
      _id: ObjectId(req.params.id)
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

// remove all documents from the collection
app.delete("/clearall", (req, res) => {
  const collection = db.collection('notes')
  collection.deleteMany({}, (error, response) => {
    if (error) {
      res.send(error);
    } else {
      res.send(response);
    }
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}!`);
});
