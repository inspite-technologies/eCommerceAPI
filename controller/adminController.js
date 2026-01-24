import Admin from "../modals/adminSchema.js";
import Restaurant from "../modals/restaurantSchema.js";
import Product from "../modals/productSchema.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import User from "../modals/userSchema.js";



const adminSignup = async (req, res) => {
  const { userName } = req.body;
  try {
    const existAdmin = await Admin.findOne({ userName });
    if (existAdmin) {
      return res.status(400).json({
        msg: "Admin already exist",
      });
    } else {
      const adminDetails = await Admin.create(req.body);
      res.status(201).json({
        msg: "Admin detailes added succesfully",
        adminDetails,
      });
    }
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};


const adminLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const existAdmin = await Admin.findOne({ userName });

    if (!existAdmin) {
      return res.status(400).json({ msg: "Admin not found" });
    }

    // Compare entered password with hashed one
    const isMatch = await bcrypt.compare(password, existAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    res.status(200).json({
      msg: "Login success",
      token: generateToken(existAdmin._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const addRestaurants = async (req, res) => {
  const { restaurantsName } = req.body;
  try {
    const existRestaurant = await Restaurant.findOne({ restaurantsName });
    if (existRestaurant) {
      return res.status(400).json({
        msg: "Restaurant already exist",
      });
    }
    const restaurantDetails = await Restaurant.create(req.body);
    res.status(201).json({
      msg: "Restaurant details addded successfully",
      restaurantDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};

const getRestaurants = async (req, res) => {
  const { id } = req.query;
  let filter = {};

  if (id) filter._id = id;
  try {
    const restaurantDetails = await Restaurant.find(filter);
    console.log("restaurant details",restaurantDetails)
    res.status(200).json({
      msg: "Restaurant details fetched successfully",
      data: restaurantDetails,
    });
  } catch (error) {
    console.error("error during fetching Restaurants:", error);
  }
};

const updateRestaurants = async (req, res) => {
  try {
    let id = req.params.id;
    const updateRestaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "Restaurant details updated successfully",
      data: updateRestaurant,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteRestaurants = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteRestaurant = await Restaurant.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Restaurant details deleted successfully",
      data: deleteRestaurant,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const addFoodItems = async (req, res) => {
  try {
    const foodDetails = await Product.create(req.body);
    res.status(201).json({
      msg: "Food item added successfully",
      data: foodDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};


const getFoodItems = async (req, res) => {
  try {
    // 1. Get all food items
    // .lean() makes the query faster as it returns plain JS objects
    const allFoods = await Product.find({}).populate("restaurantId", "restaurantsName").lean();

    // 2. Check if a user is logged in (from your 'protect' middleware)
    const userId = req.user?._id;

    if (userId) {
      // 3. Get all of this user's likes in a single query
      const userLikes = await Likes.find({ userId }).select('foodId').lean();
      
      // 4. Create a Set for fast lookup (O(1) complexity)
      const likedFoodIds = new Set(userLikes.map(like => like.foodId.toString()));

      // 5. Add the 'isLiked' field to each food item
      allFoods.forEach(food => {
        food.isLiked = likedFoodIds.has(food._id.toString());
      });
    } else {
        // If no user is logged in, all items are not liked by default
        allFoods.forEach(food => {
            food.isLiked = false;
        });
    }

    res.status(200).json({
      msg: "Food items fetched successfully",
      data: allFoods,
    });
  } catch (err) {
    console.error("Error fetching all food items:", err);
    res.status(500).json({ msg: "Server error", error: err });
  }
};
const updateFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const updateFood = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "Food item updated successfully",
      data: updateFood,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteFood = await Product.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Food item deleted successfully",
      data: deleteFood,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    const userDetails = await User.find();
    res.status(200).json({
      msg: "User details fetched successfully",
      data: userDetails,
    });
  }
  catch (err) {
    res.status(400).json(err);
  }
};

const getRestaurantsDetails = async (req,res) =>{
  try{
    const resDetails = await Product.find().populate("restaurantId","restaurantsName address description image")
    res.status(200).json({
      msg:"restaurant detailes fetched successfully",
      data:resDetails
    })
  } catch(err){
    res.status(400).json(err)
  }
}



export {
  adminSignup,
  adminLogin,
  addRestaurants,
  getRestaurants,
  updateRestaurants,
  deleteRestaurants,
  addFoodItems,
  getFoodItems,
  updateFoodItems,
  deleteFoodItems,
  getAllUserDetails,
  getRestaurantsDetails
};
