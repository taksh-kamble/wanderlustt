const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema } = require('../schema');
const { isLoggedIn, isOwner } = require('../middleware');
const listingController = require('../controllers/listing');
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

// Validation middleware
const validateSchema = (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, 'Listing data is missing!');
  }
  const { error } = listingSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(400, msg);
  }
  next();
};

// Root: list + create
router.route('/')
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateSchema,
    wrapAsync(listingController.createListing)
  );

// New listing form
router.get('/new', isLoggedIn, listingController.newListingForm);

// Search by city/country (renders search results)
router.get('/search', wrapAsync(listingController.searchListings));

// Filter by category (renders index)
router.get('/listings', wrapAsync(listingController.categoryIndex));

// Show
router.get('/:id', wrapAsync(listingController.showListing));

// Edit
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Update
router.patch(
  '/:id',
  isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateSchema,
  wrapAsync(listingController.updateListing)
);

// Delete
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
