import Product from "../modals/productSchema.js";

const getProductById = async (req, res) => {
  try {
    // Correct way to extract param
    const id  = req.params.id;
    console.log("id in backend ",id);
    

    // Fetch product by your custom foodId field
    const product = await Product.findOne({ _id: id })
      .populate("restaurantId", "restaurantsName address contact cuisine rating openingHours image");
console.log("product are ..",product);

    if (!product) {
      return res.status(404).json({
        msg: "Food item not found",
      });
    }

    res.status(200).json({
      msg: "Food item fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching food item:", err);
    res.status(500).json({
      msg: "Error occurred during fetching of food item",
      error: err.message,
    });
  }
};


export {getProductById}