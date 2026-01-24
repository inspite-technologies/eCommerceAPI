import express from "express";
import { getProductById } from "../controller/productController.js";

const app = express.Router();

app.route("/:id").get(getProductById)

export default app;
