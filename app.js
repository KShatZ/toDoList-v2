const express = require("express");
const mongoose = require("mongoose");
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

Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Default Insert succesful");
  }
});


app.get("/", function(req, res) {

  const day = date.getDate();
  res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
