const User = require("../models/User");
const Post = require("../models/Post");
const _ = require('lodash');

const authCtrl = {
  admin: async (req, res) => {

    User.find({})
          .exec(function(err, users) {  //BRING ALL USERS!! 
        if (err) throw err;
        res.render('admin.ejs', { 
          "users": users,
         
        });
    });

  },

  compose: async (req, res) => {
    const post = new Post({
       title: req.body.postTitle,
      //title: _.lowerCase(req.body.postTitle), LODASH LIBRARY
      content: req.body.postBody,
      author: req.body.postAuthor
      //author: _.lowerCase(req.body.postAuthor)
    });
  
    post.save(function(err) {
      if(!err) {
        console.log(req.body);
        res.redirect("/admin"); //send user back to home route
      }
  });
  
},

//brings all posts from blog mongodb
editpost: async (req, res) => {
  Post
  .find({})
  .exec(function (err, posts) {
    Post.count().exec(function(err, count) {
      if (err) return next(err)
    res.render("editpost", { posts: posts} );
    
  })

})
},


//Fine One specific post
editpostID: async (req, res) => {
  
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    //console.log(">>>>> "+post);

      res.render("editpostID", {
      id: post._id,
      title: post.title,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt
    });
  });

},

doeditpost: async (req, res) => {
  
  const requestedId = req.params.id;
	//console.log(req.body);
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



},

postdelete: async (req, res) => {
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


} //end authCtrl

module.exports = authCtrl;