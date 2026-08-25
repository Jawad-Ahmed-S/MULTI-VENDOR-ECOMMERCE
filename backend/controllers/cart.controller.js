import User from "../models/user.model.js";
import Product from "../models/product.model.js";



export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "cart.product",
      populate: { path: "store", select: "name" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({ message: "Added to cart", data: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await User.findById(req.user.id);

    const item = user.cart.find((item) => item.product.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await user.save();
    await user.populate("cart.product");

    res.status(200).json({ message: "Cart updated", data: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({ message: "Removed from cart", data: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Cart cleared", data: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};