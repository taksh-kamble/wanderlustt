if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const port = 8000;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js")
const users=require("./routes/user.js");
const session=require("express-session")
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User=require("./models/user.js")
// ----------------- Basic setup -----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl=process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET_TOKEN,
  },
  touchAfter: 24 * 3600 // in seconds
});

store.on('error', (err) => {
  console.log('Session store error:', err);
});

const sessionOptions={
  store,
  secret: process.env.SECRET_TOKEN,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
})

app.get("/demoUser",async (req,res)=>{
  let demoUser=new User({
    email:"hello@gmail.com",
    username:"hello"
  });

  const registeredUser=await User.register(demoUser,"helloworld");
  console.log(registeredUser);

})


// ----------------- Database connection -----------------
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// ----------------- Middleware --------------

// ----------------- Routes -----------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews)
app.use("/",users);

// ----------------- Error handling -----------------
app.get("/flash-test", (req, res) => {
  req.flash("success", "Flash message test successful!");
  res.redirect("/listings");
});

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Generic error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

// ----------------- Server start -----------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
