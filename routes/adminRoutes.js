import express from "express";
import {
  adminSignup,
  adminLogin,
  addStores,
  getStores,
  updateStores,
  deleteStores,
  addFoodItems,
  getFoodItems,
  updateFoodItems,
  deleteFoodItems,

} from "../controller/adminController.js";
import upload from "../config/multer.js";

const app = express.Router();

app.route("/").post(adminSignup);
app.route("/login").post(adminLogin);
app.route("/stores").post(upload.single('image'), addStores).get(getStores);
app.route("/stores/:id").put(upload.single('image'), updateStores).delete(deleteStores);
app.route("/food").post(upload.single('image'), addFoodItems).get(getFoodItems);
app.route("/food/:id").put(upload.single('image'), updateFoodItems).delete(deleteFoodItems);

export default app;
