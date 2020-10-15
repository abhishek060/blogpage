const express        = require("express"),
      postController = require("../controllers/post"),
      router         = express.Router();

// INDEX ROUTE
router.get("/", postController.home);

// NEW ROUTE
router.get("/new", isLoggedInAsAdmin, postController.addNewPost);

// CREATE ROUTE
router.post("/", isLoggedInAsAdmin, postController.createNewPost);

// SHOW ROUTE
router.get("/:id", postController.showPost);

// EDIT ROUTE
router.get("/:id/edit", isLoggedInAsAdmin, postController.editPost);

// UPDATE ROUTE
router.put("/:id", isLoggedInAsAdmin, postController.updatePost);

// DESTROY ROUTE
router.delete("/:id", isLoggedInAsAdmin, postController.deletePost);

function isLoggedInAsAdmin(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.username === process.env.ADMIN){
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