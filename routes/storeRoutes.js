import express from "express";
import { storeSignup, storeLogin } from "../controller/storeController.js";
import {
    addProduct,
    getStoreProducts,
    updateProduct,
    toggleAvailability,
    deleteProduct,
    getAllPublicProducts,
    getPublicStoreProducts
} from "../controller/storeProductController.js";
import { protectStore } from "../middleWare/storeMiddleWare.js";
import upload from "../config/multer.js";

const router = express.Router();

// Auth routes
router.post("/signup", storeSignup);
router.post("/login", storeLogin);

// Public product routes
router.get("/all-products", getAllPublicProducts);
router.get("/public/products/:storeId", getPublicStoreProducts);

// Product management routes (Protected)
router.use(protectStore); // Apply protection to all routes below

router.route("/products")
    .get(getStoreProducts)
    .post(upload.array('images', 5), addProduct);

router.route("/products/:id")
    .put(upload.array('images', 5), updateProduct)
    .delete(deleteProduct);

router.patch("/products/:id/availability", toggleAvailability);

export default router;
