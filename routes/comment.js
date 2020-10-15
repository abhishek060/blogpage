const express           = require("express"),
      commentController = require("../controllers/comment"),
      Comment           = require("../models/comment"),
      router            = express.Router();

// CREATE ROUTE
router.post("/blogs/:id/comments", isLoggedIn, commentController.addComment);

// UPDATE ROUTE
router.put("/blogs/:id/comments/:cmnt_id", checkCommentOwnership, commentController.updateComment);

// DELETE ROUTE
router.delete("/blogs/:id/comments/:cmnt_id", checkCommentOwnership, commentController.deleteComment);

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to login first.");
    res.redirect("/login");
};

function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.cmnt_id)
        .then(foundComment=>{
            if(foundComment.author.id.equals(req.user._id)){
                next();
            }
            else{
                res.redirect("back");
            }
        })
        .catch(err=>{
            console.log(err);
        });
    };
};
      
module.exports = router;