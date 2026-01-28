import Product from "../modals/productSchema.js";

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { productName, category, description, price, quantity } = req.body;
        const storeId = req.store._id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: "Please upload at least one product image" });
        }

        const imagePaths = req.files.map(file => file.path);

        const newProduct = new Product({
            storeId,
            productName,
            category,
            description,
            price,
            quantity,
            images: imagePaths,
        });

        await newProduct.save();
        res.status(201).json({ msg: "Product added successfully", data: newProduct });
    } catch (err) {
        console.error("Error adding product:", err.message);
        res.status(400).json({ msg: "Failed to add product", error: err.message });
    }
};

// Get all products for the logged-in store
export const getStoreProducts = async (req, res) => {
    try {
        const storeId = req.store._id;
        const products = await Product.find({ storeId });
        res.status(200).json({ data: products });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch products", error: err.message });
    }
};

// Update product details
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        // Check if product belongs to this store
        const product = await Product.findOne({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
        }

        // Update with images if provided
        let updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ msg: "Product updated successfully", data: updatedProduct });
    } catch (err) {
        res.status(400).json({ msg: "Failed to update product", error: err.message });
    }
};

// Toggle product availability
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        const product = await Product.findOne({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
        }

        product.isAvailable = !product.isAvailable;
        await product.save();

        res.status(200).json({
            msg: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
            data: product
        });
    } catch (err) {
        res.status(400).json({ msg: "Failed to toggle availability", error: err.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        const product = await Product.findOneAndDelete({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
        }

        res.status(200).json({ msg: "Product deleted successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to delete product", error: err.message });
    }
};

// Public: Get all products for all stores
export const getAllPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true })
            .populate("storeId", "storeName address image description")
            .populate("restaurantId", "restaurantsName address image description")
            .lean();

        // Normalize fields for frontend compatibility
        const normalizedProducts = products.map(product => {
            const normalized = {
                ...product,
                name: product.name || product.productName,
                image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null)
            };

            // Alias restaurantId to storeId if it exists
            if (product.restaurantId && !product.storeId) {
                normalized.storeId = {
                    ...product.restaurantId.toObject ? product.restaurantId.toObject() : product.restaurantId,
                    storeName: product.restaurantId.restaurantsName || product.restaurantId.storeName
                };
            }

            return normalized;
        });

        res.status(200).json({ data: normalizedProducts });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch all products", error: err.message });
    }
};

// Public: Get all products for a specific store
export const getPublicStoreProducts = async (req, res) => {
    try {
        const { storeId } = req.params;
        const products = await Product.find({ storeId, isAvailable: true }).lean();

        // Normalize fields
        const normalizedProducts = products.map(product => {
            const normalized = {
                ...product,
                name: product.name || product.productName,
                image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null)
            };

            // Alias restaurantId to storeId if it exists
            if (product.restaurantId && !product.storeId) {
                normalized.storeId = {
                    ...product.restaurantId.toObject ? product.restaurantId.toObject() : product.restaurantId,
                    storeName: product.restaurantId.restaurantsName || product.restaurantId.storeName
                };
            }

            return normalized;
        });

        res.status(200).json({ data: normalizedProducts });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch store products", error: err.message });
    }
};
