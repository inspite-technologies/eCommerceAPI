import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  restaurantsName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  address: {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
      default: "India",
    },
  },
  contact: {
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  cuisine: [
    {
      type: String,
    },
  ], // e.g., ["Indian", "Chinese"]
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  openingHours: {
    open: {
      type: String,
      default: "09:00",
    },
    close: {
      type: String,
      default: "22:00",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
