const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

// =============================
// VALIDATION MIDDLEWARE
// =============================
const validateSchema = (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Listing data is missing!");
  }
  const { error } = listingSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

// =============================
// ROUTES
// =============================

// Show all listings

router.get(
    "/",
    wrapAsync(async (req, res) => {
      const listings = await Listing.find();
      res.render("listings/listing.ejs", { listings });
    })
  );
// router.get(
//   "/listings",
//   wrapAsync(async (req, res) => {
//     const listings = await Listing.find();
//     res.render("listings/listing.ejs", { listings });
//   })
// );

// New listing form
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create new listing
router.post(
  "/",
  validateSchema,
  wrapAsync(async (req, res) => {
    await Listing.create(req.body.listing);
    req.flash("success","New listing created")
    res.redirect("/listings");
  })
);

// Show specific listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const reqListing = await Listing.findById(id).populate("reviews");
    if(!reqListing){
      req.flash("error","listing does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { reqListing });
  })
);

// Edit form
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","listing does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// Update listing
router.patch(
  "/:id",
  (req, res, next) => {
    console.log("RAW body before validation:", req.body); // Debug
    next();
  },
  validateSchema,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
      new: true,
      runValidators: true,
    });
    if (!updatedListing) throw new ExpressError(404, "Listing not found!");
    req.flash("success","listing updated")
    res.redirect(`/listings/${updatedListing._id}`);
  })
);

// Delete listing
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted")
    res.redirect("/listings");
  })
);

module.exports = router;
