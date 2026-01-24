import Cart from "../modals/cartSchema.js";
import Order from "../modals/orderSchema.js";

// NEW: Sync localStorage cart with database after login
const syncCart = async (req, res) => {
  const userId = req.user._id;
  const { foodIds } = req.body;

  if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0) {
    return res.status(200).json({
      msg: "No items to sync",
      data: [],
    });
  }

  try {
    // Get existing cart items from DB for this user
    const existingCartItems = await Cart.find({ userId }).lean();
    const existingFoodIds = new Set(
      existingCartItems.map((item) => item.foodId.toString())
    );

    // Filter out food items that already exist in the cart
    const newFoodIds = foodIds.filter((foodId) => !existingFoodIds.has(foodId));
    const cartPromises = newFoodIds.map((foodId) =>
      Cart.create({
        userId,
        foodId,
        quantity: 1,
      })
    );

    await Promise.all(cartPromises);

    // Return the complete updated cart
    const updatedCart = await Cart.find({ userId })
      .populate({
        path: "foodId",
        select: "name price image restaurantId",
        populate: {
          path: "restaurantId",
          select: "restaurantsName",
        },
      })
      .lean();

    res.status(200).json({
      msg: "Cart synced successfully",
      data: updatedCart,
      syncedCount: newFoodIds.length,
    });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(400).json({
      msg: "Failed to sync cart",
      error: err.message,
    });
  }
};

const addToCart = async (req, res) => {
  const userId = req.user._id;
  const foodId = req.params.id;
  if (!foodId) {
    return res.status(400).json({ msg: "foodId is required" });
  }

  try {
    const existingItems = await Cart.find({ userId, foodId });
    console.log("Existing items:", existingItems);

    if (existingItems.length > 0) {
      const cartIds = existingItems.map(item => item._id);

      const ordered = await Order.find({
        cartIds: { $in: cartIds },
      }).select("cartIds");

      const orderedCartIds = ordered.flatMap(order => order.cartIds.map(id => id.toString()));

      const unOrderedItems = existingItems.filter(
        item => !orderedCartIds.includes(item._id.toString())
      );

      if (unOrderedItems.length > 0) {
        const itemToUpdate = unOrderedItems[0];
        itemToUpdate.quantity += 1;
        await itemToUpdate.save();

        return res.status(200).json({
          status: true,
          msg: "Item quantity updated in cart",
          data: itemToUpdate,
        });
      } else {
        const newCartItem = await Cart.create({
          userId,
          foodId,
          quantity: 1,
        });

        return res.status(201).json({
          status: true,
          msg: "Item added to cart again after being ordered previously",
          data: newCartItem,
        });
      }
    }
    console.log("No existing item found. Creating a new cart item.");
    const cartItem = await Cart.create({
      userId,
      foodId,
      quantity: 1,
    });

    return res.status(201).json({
      status: true,
      msg: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json({
      status: false,
      msg: "Server error",
      error: err.message,
    });
  }
};



const removeFromCart = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteCartItem = await Cart.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Item removed from cart successfully",
      data: deleteCartItem,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getCartItems = async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch all orders of the user
    const orders = await Order.find({ userId }).select("cartIds").lean();
    const orderedCartIds = new Set(
      orders.flatMap(order => order.cartIds.map(id => id.toString()))
    );

    // Fetch all cart items
    const cartItems = await Cart.find({ userId })
      .populate({
        path: "foodId",
        select: "name price image restaurantId",
        populate: {
          path: "restaurantId",
          select: "restaurantsName",
        },
      })
      .lean();

    // Only keep items not part of any order
    const activeCartItems = cartItems.filter(
      item => !orderedCartIds.has(item._id.toString())
    );

    // Add totalPrice to each item
    const cartItemsWithTotal = activeCartItems.map(item => ({
      ...item,
      totalPrice: item.quantity * (item.foodId?.price || 0),
    }));

    // Calculate total cart price
    const cartTotalPrice = cartItemsWithTotal.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      msg: "Cart items fetched successfully",
      data: cartItemsWithTotal,
      cartTotalPrice,
    });
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch cart items",
      error: err.message,
    });
  }
};

// In your cart controller file

// In your cart controller file

const updateCartItem = async (req, res) => {
  try {
    const cartId = req.params.id; 
    const { quantity } = req.body;

    if (quantity <= 0) {
      const deletedItem = await Cart.findByIdAndDelete(cartId);
      
      if (!deletedItem) {
        return res.status(404).json({ msg: "Cart item not found to delete" });
      }

      return res.status(200).json({
        msg: "Cart item removed successfully",
        data: deletedItem,
      });

    } else {
      const updatedCartItem = await Cart.findByIdAndUpdate(
        cartId,
        { quantity: quantity },
        { new: true } 
      );

      if (!updatedCartItem) {
        return res.status(404).json({ msg: "Cart item not found to update" });
      }

      return res.status(200).json({
        msg: "Cart item updated successfully",
        data: updatedCartItem,
      });
    }

  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export { addToCart, removeFromCart, getCartItems, updateCartItem, syncCart };
