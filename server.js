// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require('morgan');
const _ = require('lodash');
const session = require('express-session');
const passport = require("passport");
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const { checkAuthenticated } = require('./middleware/auth');

var app = express();

app.use(express.json())

//const PORT = 5000;

app.set('view engine', 'ejs');



//just added this
app.use(bodyParser.urlencoded({
        limit: '50mb',
        parameterLimit: 100000,
        extended: true
}));

//Just added this
app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    session: false //added to not store cookie
  }));

  
  app.use(passport.initialize()); //This stays in app.js
  app.use(passport.session()); //This stays in app.js

app.use(logger('dev'));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


  passport.use(User.createStrategy());
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  // passport.use(new GoogleStrategy({
  //     clientID: process.env.CLIENT_ID,
  //     clientSecret: process.env.CLIENT_SECRET,
  //     callbackURL: "https://www.pushtoprod.dev/auth/google/secrets",
  //     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  //   },
  //   function(accessToken, refreshToken, profile, cb) {
  //     console.log(profile);
  
  //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //       return cb(err, user);
  //     });
  //   }
  // ));

 // Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
}); 

// Routes
app.use('/', require('./routes/userRouter'));
//app.use("/auth", checkAuthenticated, require("./middleware/auth")); //access middleware

  app.get("/home", (req, res) => res.render("home")); //NO AUTH REQUIRED
  app.get("/register", (req, res) => res.render("register"));
  app.get("/login", (req, res) => res.render("login"));
  app.get("/page/:page", (req, res) => res.render("home"));
  app.get("/posts/:postId", (req, res) => res.render("post"));
  app.get("/blogs", (req, res) => res.render("blogs"));
  app.get("/about", (req, res) => res.render("about"));
  app.get("/contact", (req, res) => res.render("contact"));
  
  app.get("/admin", checkAuthenticated, (req, res) => res.render("admin"));
  app.get("/userprofile", checkAuthenticated, (req, res) => res.render("userprofile", {
    user: req.user
  }))
  app.get("/compose", checkAuthenticated, (req, res) => res.render("compose"));
  
    //   app.get("/auth/google",
    //   passport.authenticate('google', { scope: ["profile"] })
    // );
    
    // app.get("/auth/google/secrets",
    //   passport.authenticate('google', { failureRedirect: "/login" }),
    //   function(req, res) {
    //     // Successful authentication, redirect to admin page.
    //     res.redirect("/userprofile");
    //   });
     

// Connect to mongodb
const URI = process.env.MONGODB_URL
mongoose.set('strictQuery', true);
mongoose.connect(URI, {
    //useCreateIndex: true,
    //useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log("Connected to mongodb")
})



const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('Server is running on port', PORT)
})
// app.listen(PORT, () => {
//     console.log('Server is running on port', PORT)
// })