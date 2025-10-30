const mongoose=require("mongoose")
const Schema= mongoose.Schema
const Review=require("./review.js");

const listingSchema=new Schema({
  title:{
    type:String,
    require:true
  },
  description:{
    type:String,
    require:true
  },
  image:{
    type:String,
    default:"https://media.istockphoto.com/id/2169998845/photo/scenic-view-of-sea-against-sky-during-sunset.jpg?s=2048x2048&w=is&k=20&c=UG5HSWIcUKvRoGBuY8YnCW3yf8V51Q14MexEwkDUOOs=",
    set:(v)=>v === ""?"https://media.istockphoto.com/id/2169998845/photo/scenic-view-of-sea-against-sky-during-sunset.webp?a=1&b=1&s=612x612&w=0&k=20&c=YdixnmsimLTKeA6kvagQah3O6IGMIEoRfqxnF6q0OcY=":v
  },
  price:Number,
  location:String,
  country:String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    }
  ]

});

  listingSchema.post("findOneAndDelete",async(listing)=>{

    if(listing){
      await Review.deleteMany({_id: {$in:listing.reviews}})
    }
    
  })

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;