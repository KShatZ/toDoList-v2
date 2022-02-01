const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");


// Application Middleware
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
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

  List.findOne({name: listTitle}, function (err, foundList){

    if (!err){

      if (!foundList){
        // Need to add alert functionality
        console.log("No such list exists... Create it first");
      }
      else {
        List.find({}, "name", function(err, lists){
          if (!err){
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
      res.render("about", {lists: lists})
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

  List.findOne({name: listName}, function(err, list){

    if(!err){

      if(list){
        //Will need to edit this later where alert is sent that exists instead of redirecting to form
        res.redirect("/list-" + listName);
      } else{
        
        const newList = new List({
          name: listName,
          items: defaultItems
        });
        newList.save();
        console.log("Created new list called: " + listName);

        res.redirect("/list-" + listName);
      }

    } else{
      console.log(err);
    }
  });
});

// Deleting item from list
app.post("/delete", function(req, res){
  
  const itemID = req.body.itemCheckbox;
  const listTitle = req.body.listTitle;

  // Default list
  if (listTitle == date.getDate()){
    Item.findByIdAndDelete(itemID, function(err){
      if (!err){
        console.log("Succesfully deleted item with id: " + itemID);
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {

      List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemID}}}, function(err, foundList){

          if(!err){
            res.redirect("/list-" + listTitle);
          } else {
            console.log(err);
          }
      });
  }

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
