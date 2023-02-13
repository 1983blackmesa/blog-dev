const User = require('../models/User');
const Post = require("../models/Post");
const passport = require("passport");

const homeStartingContent = "Blogs: ";
const blogsContent = "Blogs";
const aboutContent = "About";
const contactContent = "Contact";

const userCtrl = {

home: async (req, res) => {

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

},

about: async(req, res) => {
  res.render("about", { abContent: aboutContent}); //render home page, pass KEY which is startingContent in home.ejs  (KEY VALUE)
},

contact: async(req, res) => {
  res.render("contact", { conContent: contactContent}); //render contact page
},

posts: async(req, res) => {
  const requestedPostId = req.params.postId;
    
    Post.findOne({_id: requestedPostId}, function(err, post){
        
        res.render("post", {
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt
      });
    }); 
},

page: async(req, res) => {
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
},

blogs: async(req, res) => {
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
},

  register: async (req, res) => { 
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
          res.redirect("/userprofile");
      });
    }
  });
 },

 login: async (req, res) => {
// app.post("/login", function(req, res) {
//const { username, password } = req.body;  
//const user = User.findOne({ username })
const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if(err) {
      console.log(err);
    } else {
        passport.authenticate("local")(req, res, function() {
          console.log(user);
          
        if(req.user.role === 'Basic') {
          res.redirect("/userprofile");
        }
        if(req.user.role === 'Admin') {
          res.redirect("/admin");
        }
 
    });
    }
  });
},

logout: async (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    res.redirect('/login');
  });
},

searchBlog: async (req, res) => {
  try {

    const searchTerm = req.body.searchTerm;
    const blog = await Post.find( { $text: { $search: searchTerm, $diacriticSensitive: true }} )
    res.render('search', { title: 'Blog - Search', blog } );

  } catch (err) {
    res.satus(500).send({message: err.message || "Error" });
  }
}


}

module.exports = userCtrl;


