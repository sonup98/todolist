//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_sonu:sonu2398@cluster0.2sber.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemsSchema ={
  name : String,
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "web development"
});


const item2 = new Item({
  name: "flutter"
});


const item3 = new Item({
  name: "xd"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  item:[itemsSchema]
}
 const List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("suceesful");
        }
      });

      res.redirect("/");

    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  


  });

  

});



app.get("/:customListName",function(req, res){
  const paramData =_.capitalize(req.params.customListName);
  List.findOne({name:paramData},function(err,foundlist){
    if(!err){
      if(!foundlist){
        //create  new list
        const list = new List({
          name:paramData,
          item:defaultItems
        })
         list.save()
         res.redirect("/"+paramData);
      }else{
        //show existing list
        res.render("list", {listTitle:foundlist.name, newListItems: foundlist.item});
      }
    }
  })

  
});


app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  
  const newItem = new Item({
    name:item
  });
     
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err, foundlist){
      foundlist.item.push(newItem);
      foundlist.save();
      res.redirect("/"+listName);
    });
  }


  

});

app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        res.redirect("/")
      }
    });

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItemId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    });


  }




  

});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
