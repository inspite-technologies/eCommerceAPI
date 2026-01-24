import express from "express";
import {
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
  
} from "../controller/adminController.js";
import protect from "../middleWare/userMiddleWare.js";
const app = express.Router();

app.route("/").post(adminSignup);
app.route("/login").post(adminLogin);
app.route("/restaurants").post(addRestaurants).get(getRestaurants);
app.route("/restaurants/:id").put(updateRestaurants).delete(deleteRestaurants);
app.route("/food").post(addFoodItems).get(getFoodItems);
app.route("/food/:id").put(updateFoodItems).delete(deleteFoodItems);



export default app;
