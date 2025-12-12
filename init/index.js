if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
  console.log("Mongo URI:", process.env.ATLASDB_URL);
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data.js"); // your sampleListings file



const dbUrl = process.env.ATLASDB_URL;


mongoose.connect(dbUrl)
  .then(() => console.log("Connected to Atlas DB"))
  .catch((err) => console.log(err));

const initDB = async () => {
  try {
    await Listing.deleteMany({}); // clear old listings

    // Add owner & default geometry for each listing
    const listingsToInsert = initData.data.map(listing => ({
      ...listing,
      owner: '69066cd0ef26c7da046d4aab', // your owner ObjectId
     
    }));

    await Listing.insertMany(listingsToInsert);
    console.log("All listings added to Atlas DB!");
    process.exit();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initDB();
