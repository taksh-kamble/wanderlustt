const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); 
const passport = require("passport");
const {saveRedirectUrl}=require("../middleware.js");
const userController=require("../controllers/user.js");
// Signup form
router.get("/signup", userController.signupForm);

// Handle signup
router.post("/signup", userController.handleSignup);

router.get("/login",userController.login)

router.post(
    "/login",saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res) => {
      req.flash("success", "Welcome back!");
      res.redirect(res.locals.redirectUrl || "/listings");
    }
  );

  router.get("/logout",saveRedirectUrl,(req,res)=>{
    req.logOut((err)=>{
      if(err){
        return next (err);
      }
      req.flash("success","You are logged out");
      res.redirect(res.locals.redirectUrl || "/listings");
    })
  })

module.exports = router;
