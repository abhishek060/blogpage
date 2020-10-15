const Comment = require("../models/comment"),
      Post    = require("../models/post");

exports.addComment = (req,res,next)=>{
    var text = req.body.text,
        author = {
            id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            picture: req.user.picture
        }
    Comment.create({
        text: text,
        author: author
    })
    .then(comment=>{
        Post.findOne({_id: req.params.id}).populate("comments").exec((err,foundPost)=>{
            if(err){
                console.log(err);
            }
            else{
                foundPost.comments.push(comment);
                foundPost.save(()=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        req.flash("success","Comment Added Successfully!");
                        res.redirect("/blogs/"+ req.params.id);
                    }
                });
            }
        })
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.updateComment = (req,res,next)=>{
    Comment.findByIdAndUpdate(req.params.cmnt_id, req.body.comment)
    .then(result=>{
        req.flash("success","Comment Edited Successfully!");
        res.redirect("/blogs/"+ req.params.id);
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.deleteComment = (req,res,next)=>{
    Comment.findByIdAndDelete({_id: req.params.cmnt_id})
    .then(result=>{
        return Post.findOne({_id: req.params.id});
    })
    .then(post=>{
        var index = post.comments.indexOf(req.params.cmnt_id);
        post.comments.splice(index,1);
        post.save();
        req.flash("success","Comment Deleted Successfully!");
        res.redirect("/blogs/"+ req.params.id);
    })
    .catch(err=>{
        console.log(err);
    });
};