const express                 = require("express"),
      bodyParser              = require("body-parser"),
      mongoose                = require("mongoose"),
      flash                   = require("connect-flash"),
      methodOverride          = require("method-override"),
      expressSanitizer        = require("express-sanitizer"),
      userRoute               = require("./routes/user"),
      postRoute               = require("./routes/post"),
      commentRoute            = require("./routes/comment"),
      User                    = require("./models/user"),
      passport                = require("passport"),
      passportLocal           = require("passport-local"),
      passportLocalMongoose   = require("passport-local-mongoose"),
      passportGoogle          = require("passport-google-oauth20").Strategy,
      passportFacebook        = require("passport-facebook").Strategy,
      expressSession          = require("express-session"),
      app                     = express();

app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
app.set("view engine","ejs");
app.locals.moment = require('moment');
// AUTHENTICATION
app.use(expressSession({
    secret: "I am Ironman",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// PASSPORT LOCAL
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser()); // Encoding data from session
passport.deserializeUser(User.deserializeUser()); // Decoding data from session
// PASSPORT GOOGLE
passport.use(new passportGoogle({
    clientID: process.env.GOOGLECLIENTID,
    clientSecret: process.env.GOOGLECLIENTSECRET,
    callbackURL: "https://abhi3000.herokuapp.com/google/callback"
},  function(accessToken, refreshToken, profile, done){
        //check user table for anyone with a google ID of profile.id
        User.findOne({
            "providerUserId": profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from google (all the profile. stuff)
            if (!user) {
                user = new User({
                    username: profile.emails[0].value,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    provider: "google",
                    providerUserId: profile.id,
                    picture: profile.photos[0].value,
                    //now in the future searching on User.findOne({'google.id': profile.id } will match because of this next line
                    google: profile._json
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });
    }
));
// PASSPORT FACEBOOK
// passport.use(new passportFacebook({
//     clientID: process.env.FBCLIENTID,
//     clientSecret: process.env.FBCLIENTSECRET,
//     callbackURL: "https://abhi3000.herokuapp.com/facebook/callback"
// },  function(accessToken, refreshToken, profile, done){
//     console.log(profile);
        //check user table for anyone with a facebook ID of profile.id
    //     User.findOne({
    //         "providerUserId": profile.id 
    //     }, function(err, user) {
    //         if (err) {
    //             return done(err);
    //         }
    //         //No user was found... so create a new user with values from google (all the profile. stuff)
    //         if (!user) {
    //             user = new User({
    //                 username: profile.emails[0].value,
    //                 firstname: profile.name.givenName,
    //                 lastname: profile.name.familyName,
    //                 provider: "google",
    //                 providerUserId: profile.id,
    //                 picture: profile.photos[0].value,
    //                 //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
    //                 google: profile._json
    //             });
    //             user.save(function(err) {
    //                 if (err) console.log(err);
    //                 return done(err, user);
    //             });
    //         } else {
    //             //found user. Return
    //             return done(err, user);
    //         }
    //     });
//     }
// ));

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.fail        = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
});

app.use(userRoute);
app.use(postRoute);
app.use(commentRoute);

// APP CONFIG MongoDB Atlas
mongoose.connect(process.env.DATABASEURL,{
    useNewUrlParser: true, 
	useUnifiedTopology: true, 
	useFindAndModify: false,
	useCreateIndex: true
}).then(result=>{
    app.listen(process.env.PORT || 3000);
	console.log("Connected to DB");
}).catch(err=>{
	console.log("Error:" + err.message);
});