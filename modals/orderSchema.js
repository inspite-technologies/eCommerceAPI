import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
  ],
  address: {
    type: String,
    required: true,
  },
   restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant' 
  },
  amount: { 
    type: Number,
    required: true,
  },
  razorpayOrderId: {  
    type: String,
    required: false,
  },
  razorpayPaymentId: {  
    type: String,
    required: false,
  },
  razorpaySignature: {  
    type: String,
    required: false,
  },
  status:{
    type:String,
    enum:["pending","preparing","Shipped","delivered","cancelled"],
    default:"pending"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;