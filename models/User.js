// user.js
const mongoose = require("mongoose");
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   password: {
//     type: String,
//     minlength: 6,
//     required: true,
//   },
//   // googleId: {
//   //   type: String,
//   //   secret: String
//   // },
//   role: {
//     type: String,
//     default: "Basic",
//   },
// })

const userSchema = new mongoose.Schema ({ //user Schema NOT blog
  username: String,
  password: String,
  googleId: String,
  secret: String,
  role: {
    type: String,
    default: "Basic", //default user registration is BASIC
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);
module.exports = User;

//module.exports = mongoose.model("User", userSchema);