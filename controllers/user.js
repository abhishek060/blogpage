const User               = require("../models/user"),
      passport           = require("passport"),
      crypto             = require("crypto"),
      nodemailer         = require("nodemailer"),
      sendgridTransport  = require("nodemailer-sendgrid-transport"),
      transporter        = nodemailer.createTransport(sendgridTransport({
        auth: {
            api_key: "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"
        }
      })),
      {validationResult} = require("express-validator");

// DISPLAY SIGNUP PAGE
exports.signup = (req,res,next)=>{
    res.render("signup");
};

// ADDING NEW USER
exports.addNewUser = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/signup");
    }
    var newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", "This Email Id is already registered.");
            return res.redirect("/login");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Signup successful");
            res.redirect("/blogs"); 
        });
    });
};

// DISPLAY LOGIN PAGE
exports.login = (req,res,next)=>{
    res.render("login");
};

// LOGGING IN
exports.verifyLogin = passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
});

// DISPLAY RESET PASSWORD PAGE 
exports.getReset = (req,res,next)=>{
    res.render("reset");
};

// RESET PASSWORD
exports.postReset = (req,res,next)=>{
    crypto.randomBytes(32, (err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString('hex');
        User.findOne({username: req.body.username})
        .then(user=>{
            if(!user){
                req.flash("error","No account with that email found.");
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            return user.save();
        })
        .then(result=>{
            req.flash("success","An email has been sent to your Email Id for verification.");
            res.redirect("/blogs");
            transporter.sendMail({
                to: req.body.username,
                from: "abhishek.singh.1601@gmail.com",
                subject: "Reset Password",
                html: `<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set new password.</p>`
            });
        })
        .catch(err=>{
            console.log(err);
        });
    });
};

// DISPLAY NEW PASSWORD PAGE
exports.getNewPassword = (req,res,next)=>{
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {$gt: Date.now()}
    })
    .then(user=>{
        if(!user){
            req.flash("error","Password rest token is invalid or has expired.");
            return res.redirect("/blogs");
        }
        res.render("new-password", {
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err=>{
        console.log(err);
    });
};

// UPDATE PASSWORD
exports.postNewPassword = (req,res,next)=>{
    const newPassword   = req.body.password,
          userId        = req.body.userId,
          passwordToken = req.body.passwordToken;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
    .then(user=>{
        if(!user){
            req.flash("error","Password rest token is invalid or has expired.");
            return res.redirect("/blogs");
        }
        user.setPassword(newPassword, function(err){
            if(err){
                req.flash("error","Password not updated.");
                return res.redirect("/blogs");
            }
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            return user.save(); 
        });
    })
    .then(user=>{
        req.flash("success", "Your password has been changed.");
        res.redirect("/login");
    })
    .catch(err=>{
        console.log(err);
    });
}

// LOGGING OUT
exports.logout = (req,res,next)=>{
    req.logout();
    req.flash("success","Logged out!");
    res.redirect("/blogs");
};

// GOOGLE LOGIN
exports.googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// GOOGLE CALLBACK
exports.googleCallback = passport.authenticate('google', { 
    successRedirect: "/blogs",
    failureRedirect: "/login"
});

// FACEBOOK LOGIN
exports.facebookLogin = passport.authenticate('facebook', {
    scope: ['profile', 'email']
});

// FACEBOOK CALLBACK
exports.facebookCallback = passport.authenticate('facebook', { 
    successRedirect: "/blogs",
    failureRedirect: "/login"
});