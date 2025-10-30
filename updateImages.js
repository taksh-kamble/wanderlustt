const mongoose = require('mongoose');
const Listing = require('./models/listing.js'); // adjust path if needed

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
  .then(async () => {
    console.log("Connected to DB");

    const listings = await Listing.find();

    for (let l of listings) {
      if (l.image && typeof l.image === 'object' && l.image.url) {
        l.image = l.image.url; // convert object to string
        await l.save();
        console.log(`Updated listing ${l._id}`);
      }
    }

    console.log("All old listings updated!");
    mongoose.connection.close();
  })
  .catch(err => console.log(err));
