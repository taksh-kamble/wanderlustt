const express=require("express")
const router = express.Router({ mergeParams: true });

const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

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


router.post("/",validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id)
    let newReview=new Review(req.body.review)
  
    listing.reviews.push(newReview)
  
    await newReview.save()
    await listing.save();
    res.redirect(`/listings/${listing._id}`)
  }));
  
  //delete reviews
  
  router.delete("/:reviewId",wrapAsync (async(req,res)=>{
    let {id,reviewId}=req.params;
  
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    
    res.redirect(`/listings/${id}`)
  
  }))

  module.exports=router;
  