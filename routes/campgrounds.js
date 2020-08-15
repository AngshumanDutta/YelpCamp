var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX Route - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from the DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
});

// CREATE Route - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){  // "/campgrounds" same as the GET request, because it is a convention
    // get data from form and add to campgrounds array
    var name   = req.body.name;
    var price  = req.body.price;
    var image  = req.body.image;
    var desc   = req.body.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    // Save newly created campground to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            // redirect back to campgrounds page
            res.redirect("/campgrounds"); // the default redirect is a GET request
        }
    })
})

// NEW Route - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});


// SHOW Route - shows more info about campground
router.get("/:id", function(req, res){
    // find the campgrounds with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
             console.log(err);
        }else{
            // render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
          req.flash("error", "Campground not found");
      }
      res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, {$set: req.body}, function(err, updatedCampground){
    if(err){
      res.redirect("/campgrounds");
    }else{
        // redirect somewhere(show page)
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
})

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/campgrounds");
    }else{
        res.redirect("/campgrounds");
    }
  })
});

module.exports = router;
