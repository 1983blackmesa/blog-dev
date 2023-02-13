const express = require('express'); 
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');
const authCtrl = require('../controllers/authCtrl');
const { checkAuthenticated } = require("../middleware/auth"); 

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/', userCtrl.home);
router.get('/posts/:postId', userCtrl.posts);
router.get('/page/:page', userCtrl.page);
router.get('/blogs', userCtrl.blogs);
router.get('/about', userCtrl.about);
router.get('/contact', userCtrl.contact);
router.post('/search', userCtrl.searchBlog);

router.get('/admin', checkAuthenticated, authCtrl.admin);
router.post('/compose', checkAuthenticated, authCtrl.compose);
router.get('/editpost', checkAuthenticated, authCtrl.editpost);
router.get('/editpostID/:postId', checkAuthenticated, authCtrl.editpostID);
router.post('/doeditpost/:id', checkAuthenticated, authCtrl.doeditpost);
router.post('/postdelete/:id', checkAuthenticated, authCtrl.postdelete);

module.exports = router;
