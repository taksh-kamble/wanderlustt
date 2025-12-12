const Listing=require("../models/listing")
const User=require("../models/user")

module.exports.signupForm=(req, res) => {
    res.render("users/signup.ejs");
  }

module.exports.handleSignup=async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ email, username });
  
      const registeredUser = await User.register(user, password); 
  
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  }
  module.exports.login=(req,res)=>{
    res.render("users/login.ejs");
}
