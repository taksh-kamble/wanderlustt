const express=require("express")
const router = express.Router({ mergeParams: true });

const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js");
const {isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/review.js");

const validateReview=(req,res,next)=>{
    if(!req.body.review){
      throw new ExpressError(400, "Review is missing!");
    }
    const { error } = reviewSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, msg);
    }
    next();
  };


router.post("/",validateReview,isLoggedIn,wrapAsync(reviewController.newReview));
  
  //delete reviews
  
  router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync (reviewController.deleteReview))

  module.exports=router;
  