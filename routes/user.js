const express        = require("express"),
      userController = require("../controllers/user"),
      {check}        = require("express-validator"),
      router         = express.Router();

// DISPLAY SIGNUP PAGE
router.get("/signup", isLoggedOut, userController.signup);

// ADDING NEW USER
router.post(
    "/signup",
    isLoggedOut,
    [
        check("firstname", "Firstname can't be empty.")
            .not()
            .isEmpty()
            .trim(),
        check("lastname", "Lastname can't be empty.")
            .not()
            .isEmpty()
            .trim(),
        check("username", "Please enter a valid Email.")
            .isEmail(),
        check("password", "Password should be alphanumeric and a minimum of 8 characters.")
            .isLength({min: 8})
            .isAlphanumeric(),
        check("confirmPassword").custom((value, {req})=>{
            if(value !== req.body.password){
                throw new Error("Passwords have to match!");
            }
            return true;
        })
    ], 
    userController.addNewUser
);

// DISPLAY LOGIN PAGE
router.get("/login", isLoggedOut, userController.login);

// LOGGING IN
router.post("/login", isLoggedOut, userController.verifyLogin);

// DISPLAY RESET PASSWORD PAGE 
router.get("/reset", isLoggedOut, userController.getReset);

// RESET PASSWORD
router.post("/reset", isLoggedOut, userController.postReset);

// DISPLAY UPDATE PASSWORD PAGE
router.get("/reset/:token", isLoggedOut, userController.getNewPassword);

// UPDATE PASSWORD
router.post("/new-password", isLoggedOut, userController.postNewPassword);

// LOGGING OUT
router.get("/logout", notLoggedIn, userController.logout);

// GOOGLE LOGIN
router.get('/google', isLoggedOut, userController.googleLogin);

router.get('/google/callback', isLoggedOut, userController.googleCallback);

// FACEBOOK LOGIN
router.get('/facebook', isLoggedOut, userController.facebookLogin);

router.get('/facebook/callback', isLoggedOut, userController.facebookCallback);

function isLoggedOut(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to logout first");
    res.redirect("/blogs");
};

function notLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to login first");
    res.redirect("/login");
};

module.exports = router;