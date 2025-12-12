const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const ExpressError = require('../utils/ExpressError');

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render('listings/listing.ejs', { listings });
};

module.exports.newListingForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.createListing = async (req, res) => {
  const { listing } = req.body;

  // Geocode location
  const geoResponse = await geocodingClient.forwardGeocode({
    query: listing.location,
    limit: 1,
  }).send();

  if (!geoResponse.body.features.length) {
    throw new ExpressError(400, 'Invalid location provided');
  }

  const coords = geoResponse.body.features[0].geometry.coordinates;

  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  newListing.geometry = {
    type: 'Point',
    coordinates: coords,
  };

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();

  req.flash('success', 'New listing created');
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.categoryIndex = async (req, res) => {
  const { category } = req.query;
  console.log("Filtering by category:", category);
  const listings = category ? await Listing.find({ category }) : await Listing.find({});
 
  console.log("Listings found:", listings.length);
  res.render('listings/listing.ejs', { listings,category });
};


module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const reqListing = await Listing.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('owner');

  if (!reqListing) {
    req.flash('error', 'Listing does not exist');
    return res.redirect('/listings');
  }

  res.render('listings/show.ejs', { reqListing });
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing does not exist');
    return res.redirect('/listings');
  }

  res.render('listings/edit.ejs', { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
    runValidators: true,
  });

  if (!updatedListing) {
    throw new ExpressError(404, 'Listing not found!');
  }

  if (req.file) {
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await updatedListing.save();

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  req.flash('success', 'Listing deleted');
  res.redirect('/listings');
};

// Search controller
module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.render('listings/searchResult', {
      listings: [],
      query: '',
      message: 'Type a location or country to search.',
    });
  }

  let listings = [];
  if (q.includes(',')) {
    const [city, country] = q.split(',').map(x => x.trim());
    listings = await Listing.find({
      location: { $regex: city, $options: 'i' },
      country: { $regex: country, $options: 'i' },
    });
  } else {
    listings = await Listing.find({
      $or: [
        { location: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
      ],
    });
  }

  res.render('listings/searchResult', { listings, query: q });
};

