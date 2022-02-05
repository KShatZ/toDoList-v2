const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");


// Application Middleware
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json([]));
app.use(express.static("public"));

// Database 
mongoose.connect("mongodb://localhost:27017/toDoListDB");

const itemsSchema = new mongoose.Schema ({
  name: {
    required: [true, "A to-do item is required"],
    type: String
  }
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema ({
  name: {
    required: true,
    type: String
  },
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);

// List Starter Items
const item1 = new Item({
  name: "Welcome to your To-Do List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  const day = date.getDate(); // Current Day

  Item.find({}, function(err,docs){ // Access DB and find all docs in Item model

    if (!err) {
      if (docs.length == 0){ // Database is empty so need to add default items
        
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else{
            console.log("Default items added succesfully");
          }
        });
        res.redirect("/");

      } else { // DB not empty: render list view

        List.find({}, "name", function(err, lists){

          if (!err){
            if (lists){ // Custom lists have been created
              res.render("list", {title: day, listItems: docs, lists: lists});
            }else { // No custom lists have been created yet
              res.render("list", {title: day, listItems: docs, lists: null});
            }
          }else {
            console.log(err);
          }
        });
      } 
    } else {
      console.log(err);
    }
  });
});

app.get("/list-:listTitle", function(req, res){

  const listTitle = _.capitalize(req.params.listTitle);
  console.log("Recieved request to access a list: " + listTitle);

  List.findOne({name: listTitle}, function (err, foundList){

    if (!err){

      if (!foundList){
        res.send(`<script>alert("The list '${listTitle}' does not exist. Create it first!"); window.location.href = "/"; </script>`);
      }
      else {
        // console.log("The list: " + listTitle + " exists...");
        List.find({}, "name", function(err, lists){
          if (!err){
            console.log("Serving list with name: " + listTitle);
            res.render("list", {title: foundList.name, listItems: foundList.items, lists: lists})
          } else {
            console.log(err);
          }
        });
      }
    } else {
      console.log(err);
    }
  });
  
}); 

app.get("/about", function(req, res){

  // List menu in navbar
  List.find({}, "name", function(err, lists){
    if (!err){
      res.render("about", {lists: lists, title: "/about"});
    } else {
      console.log(err);
    }
  });
  
});

/* POST REQUESTS */

// Adding new item to list
app.post("/", function(req, res){

  // POST Data
  const listItem = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name: listItem
  });

  // Default List
  if(listTitle == date.getDate()){

    item.save()
    res.redirect("/");

  } else { 

    // Find specific list in DB and Push to the items array
    List.findOne({name: listTitle}, function(err, foundList){

      if (!err){
        foundList.items.push(item);
        foundList.save()
        res.redirect("/list-" + listTitle);
      } else {
        console.log(err);
      }

    });
  }
});

// Creating new list
app.post("/newList", function(req,res){

  const listName = _.capitalize(req.body.newListName);
  // console.log("Recieved request to create new list: " + listName);

  if (listName.trim().length === 0) {
    // Error 400 - Bad Request: Cant have a blank list name
    res.status(400).end();
  }else {
    List.findOne({name: listName}, function(err, list){
      if(!err){
        if(list){
          // Error 406 - Unacceptable Input: list has been created already
          res.status(406).end(); 
        }else { 
          // console.log("No errors in new list request")
          const newList = new List({
            name: listName,
            items: defaultItems
          });
          newList.save();
          // console.log("Created new list called: " + listName);
          res.send(`/list-${listName}`);
        }
      } else{
        console.log(err);
      }
    }); 
  } 
});

// Deleting item or list
app.post("/delete", function(req, res){
  
  const currentLocation = req.body.currentLocation;
  const itemID = req.body.itemCheckbox;
  const listName = req.body.listName;
  
  // Delete item from list
  if (itemID){
    if (currentLocation == date.getDate()){ // Defualt List
      Item.findByIdAndDelete(itemID, function(err){
        if (!err){
          console.log("Succesfully deleted item with id: " + itemID);
          res.redirect("/");
        } else {
          console.log(err);
        }
      });
    }else { // Custom List
      List.findOneAndUpdate({name: currentLocation}, {$pull: {items: {_id: itemID}}}, function(err, foundList){

          if(!err){
            res.redirect("/list-" + currentLocation);
          } else {
            console.log(err);
          }
      });
    }
  }else { // Delete List
    List.deleteOne({name: listName}, function(err){

      if(!err){
        if (listName === currentLocation){ // Request occured from deleted list
          res.redirect("/");
        }else if (currentLocation === "/about") {
          res.redirect("/about");
        }else if (currentLocation === date.getDate()) {
          res.redirect("/");
        } else {
          res.redirect("/list-" + currentLocation);
        }
      }else {
        console.log(err);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
