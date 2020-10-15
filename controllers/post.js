const User    = require("../models/user"),
      Post    = require("../models/post"),
      Comment = require("../models/comment");

exports.home = (req,res,next)=>{
    const perPage    = 4;
    const pageNumber = + req.query.page || 1;
    var   noMatch    = undefined;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Post.find({title: regex}).sort({created: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBlogs) {
            Post.countDocuments({title: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allBlogs.length < 1) {
                        noMatch = "No blogs match that query, please try again.";
                    }
                    res.render("index", {
                        blogs: allBlogs,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all blogs from DB
        Post.find().sort({created: -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBlogs) {
            Post.countDocuments().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("index", {
                        blogs: allBlogs,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
};

exports.addNewPost = (req,res,next)=>{
    res.render("new");
};

exports.createNewPost = (req,res,next)=>{
    var title = req.body.blog.title,
        image = req.body.blog.image,
        description = req.sanitize(req.body.blog.description),
        author = {
            id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname
        }
    Post.create({
        title: title,
        image: image,
        description: description,
        author: author
    })
    .then(post=>{
        User.findOne({username: req.user.username}).populate("posts").exec((err,foundUser)=>{
            if(err){
                console.log(err);
            }
            else{
                foundUser.posts.push(post);
                foundUser.save(()=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.redirect("/");
                    }
                });
            }
        })
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.showPost = (req,res,next)=>{
    Post.findOne({_id: req.params.id}).populate("comments")
    .then(result=>{
        res.render("show",{data: result});
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.editPost = (req,res,next)=>{
    Post.findOne({_id: req.params.id})
    .then(result=>{
        res.render("edit",{data: result});
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.updatePost = (req,res,next)=>{
    Post.findByIdAndUpdate(req.params.id, req.body.blog)
    .then(result=>{
        res.redirect("/"+ req.params.id);
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.deletePost = (req,res,next)=>{
    Post.findOne({_id: req.params.id})
    .then(result=>{
        var idsArray = result.comments;
        return Comment.deleteMany({_id: {$in: idsArray}});
    })
    .then(result=>{
        return Post.findByIdAndDelete(req.params.id);
    })
    .then(result=>{
        return User.findOne({username: req.user.username});
    })
    .then(user=>{
        var index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        user.save();
        res.redirect("/");
    })
    .catch(err=>{
        console.log(err);
    });
};

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};