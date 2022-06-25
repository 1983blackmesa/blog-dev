if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
//require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var logger = require('morgan');
const ejs = require("ejs");
const _ = require('lodash');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const methodOverride = require("method-override");

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

const homeStartingContent = "Blogs: ";

const aboutContent = "About";
const contactContent = "Contact";
const blogsContent = "Blogs";

var app = express();


// Connect to mongodb
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
    //useCreateIndex: true,
    //useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log("Connected to mongodb");
});

//require('./config/passport');
//mongoose.set("useCreateIndex", true);

//EJS
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

app.use(bodyParser.urlencoded({extended: true}));

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
//app.use(methodOverride("_method")); // override for put and delete requests from forms IF I PUT THIS BACK LOGOUT WONT WORK



app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));



const userSchema = new mongoose.Schema ({ //user Schema NOT blog
    username: String,
    password: String,
    googleId: String,
    secret: String
  });
  
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  
  const User = new mongoose.model("User", userSchema);
  

  
  passport.use(User.createStrategy());
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  passport.use(new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://www.pushtoprod.dev/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
  
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));



//blog schema
const postSchema = {
    title: String,
    content: String,
    author: String,
    createdAt: {
      type: Date,
      default: new Date()
    }
  };
  


  const Post = mongoose.model("Post", postSchema); //Blog Model
  

app.get("/", function(req, res) {

  var perPage = 4;
    var page = req.params.page || 1;
 
    Post
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, posts) {
          Post.count().exec(function(err, count) {
                if (err) return next(err);
                res.render('home', {
                    startingContent: homeStartingContent,
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });
        });
   });
   
     app.get("/page/:page", function(req, res, next) {

        var perPage = 4;
          var page = req.params.page || 1;
       
          Post
              .find({})
              .skip((perPage * page) - perPage)
              .limit(perPage)
              .exec(function(err, posts) {
                Post.count().exec(function(err, count) {
                      if (err) return next(err);
                      res.render('home', {
                          startingContent: homeStartingContent,
                          posts: posts,
                          current: page,
                          pages: Math.ceil(count / perPage)
                      });
                  });
              });
         });

      app.get("/auth/google",
      passport.authenticate('google', { scope: ["profile"] })
    );
    
    app.get("/auth/google/secrets",
      passport.authenticate('google', { failureRedirect: "/login" }),
      function(req, res) {
        // Successful authentication, redirect to admin page.
        res.redirect("/admin");
      });
    
    
     


      app.get("/admin", function(req, res){
        //res.set('Cache-Control', 'no-store'); //not needed
        if (req.isAuthenticated()){
          res.render("admin"); //submit before
        } else {
          res.redirect("/login");
        }
      });

      

app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


  app
    .route('/logout')
    .get((req, res) => {
          req.logout(function(err) {
               if (err) { return next(err); }
           res.redirect('/');
      });
  });

 
  
  app.get("/about", function(req, res) {
    res.render("about", { abContent: aboutContent}); //render home page, pass KEY which is startingContent in home.ejs  (KEY VALUE)
  });
  
  app.get("/contact", function(req, res) {
    res.render("contact", { conContent: contactContent}); //render contact page
  });
  
  app.get("/compose", function(req, res) { //make compose page
    if (req.isAuthenticated()){
        res.render("compose");
      } else {
        res.redirect("/login");
      }
  });
  
  app.post("/compose", function(req, res) {
    //create JS object
    const post = new Post({
        
      title: _.lowerCase(req.body.postTitle),
      content: req.body.postBody,
      author: _.lowerCase(req.body.postAuthor)
    });
  
    post.save(function(err) {
      if(!err) {
    res.redirect("/admin"); //send user back to home route
      }
  });
  });
  
//This works, brings all posts from blog
app.get("/editpost", function(req, res) {
  if (req.isAuthenticated()){
    Post
    .find({})
    .exec(function (err, posts) {
      Post.count().exec(function(err, count) {
        if (err) return next(err)
      res.render("editpost", { posts: posts} );
    })

  })

  } //end if authenticated

  else {
    res.redirect("/login");
  }
});


app.get("/editpostID/:postId", function(req, res) { //dynamic site, edit specific post id
  
  if (req.isAuthenticated()){
  const requestedPostId = req.params.postId;
  
  Post.findOne({_id: requestedPostId}, function(err, post){
      
      res.render("editpostID", {
      title: post.title,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt
    });
  });
  
} //end if authenticated

else {
  res.redirect("/login");
}
 
});

//save specfic post id after new change
app.post("/do-edit-post/:id", function (req, res) {
  if (req.isAuthenticated()){
	const requestedId = req.params.id;
	console.log(req.body);
	const newTitle = req.body.postTitle;
  const newAuthor = req.body.postAuthor;
	const newContent = req.body.postBody;
	

	const query = { _id: requestedId };
	Post.findOneAndUpdate(
		{
			_id: requestedId,
		},
		{
			$set: {
				title: newTitle, // Fields which we need to update
				author: newAuthor,
        content: newContent,
			},
		},
		{
			new: true, // option part ( new: true will provide you updated data in response ) new returns new data
		},
		(err, post) => {
			if (!err) {
				res.render("editpost", {
					title: post.title,
          author: post.author,
					content: post.content,
				});
			}
		}
	);
	res.redirect("/editpost");

} //end if authenticated

else {
  res.redirect("/login");
}

});

//delete post by specific id
app.post("/postdelete/:id", async (req, res) => {
    if (req.isAuthenticated()){
    const requestedId = req.params.id; 
    Post.findByIdAndDelete(
      {
        _id: requestedId,
      },
      (err, post) => {
        if (!err) {
          res.redirect("/editpost");
        }
      }
    );
    
  }
  else {
    res.redirect("/login");
  }
});

/*
app.get("/register", function(req, res) {
  res.render("register");
});
*/

  
  app.get("/login", function(req, res){
    res.render("login");
  });
  
  
  app.get("/blogs", function(req, res) {

  var perPage = 4;
    var page = req.params.page || 1;
 
    Post
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, posts) {
          Post.count().exec(function(err, count) {
                if (err) return next(err);
                res.render("blogs", {
                    myblogs: blogsContent,
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });
        });
   });

/*
  app.post("/register", function(req, res) {
    const {username, password, password2} = req.body;

    //check if match
if(password !== password2) {
  console.log("Passwords don't match");
}

//check if password is more than 6 characters
if(password.length < 6 ) {
  console.log("Passwords must be at least 6 characters");
}

    User.register({username: username}, password, function(err, user) {
      if(err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function() {
            res.redirect("/admin");
        });
      }
    });
   });
*/

 app.post("/login", function(req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err) {
      if(err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function() {
          //res.render('admin',{
            //user: req.user
            
            //});
            //res.render('admin.ejs', { user: req.user })
          res.redirect("/admin");
      });
      }
    });
 });

  app.get("/posts/:postId", function(req, res) { //dynamic site with Node and Express
    
    const requestedPostId = req.params.postId;
    
    Post.findOne({_id: requestedPostId}, function(err, post){
        
        res.render("post", {
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt
      });
    }); 
   
  });
//app.use('/index', indexRouter);
//app.use('/users', usersRouter);

//module.exports = app;


app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
 
