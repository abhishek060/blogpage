const express        = require("express"),
      postController = require("../controllers/post"),
      router         = express.Router();

// INDEX ROUTE
router.get("/", postController.home);

// NEW ROUTE
router.get("/blogs/new", isLoggedInAsAdmin, postController.addNewPost);

// CREATE ROUTE
router.post("/blogs", isLoggedInAsAdmin, postController.createNewPost);

// SHOW ROUTE
router.get("/blogs/:id", postController.showPost);

// EDIT ROUTE
router.get("/blogs/:id/edit", isLoggedInAsAdmin, postController.editPost);

// UPDATE ROUTE
router.put("/blogs/:id", isLoggedInAsAdmin, postController.updatePost);

// DESTROY ROUTE
router.delete("/blogs/:id", isLoggedInAsAdmin, postController.deletePost);

function isLoggedInAsAdmin(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.username === "abhi@gmail.com"){
            return next();
        }
        else{
            res.send("Invalid Page");
        }
    }
    else{
        res.redirect("/login");
    }
};

module.exports = router;