import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}); // get all products
    res.json({products});
  } catch (error) {
    res.status(500).json({
      message: "Error in get all product route ",
      error: error.message,
    });
  }
};
export const getFeaturedProducts = async (req, res, next) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      featuredProducts = JSON.parse(featuredProducts);
     return  res.json(featuredProducts);
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // get all featured products
    if (!featuredProducts) {
     return res.status(404).json({ message: "No featured products found" });
    } 
    await redis.set("featured_products", JSON.stringify(featuredProducts));
 
    res.json(featuredProducts);
  } catch (error) { 
    res.status(500).json({
      message: "Error in getting featured products",
      error: error.message,
    });
  }
};
export const createProduct = async (req, res, next) => {
  try {
    let { name, description, price, category, image } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      image = cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "";
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: " Error in creating the product ",
      error: error.message,
    });
  }
};
export const deleteProduct = async (req, res, next) => { 
  try { 
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
  } catch (error) {
    res.status(500).json({
      message: " Error in deleting the product ",
      error: error.message,
    });
  }
};
export const getRecommendedProducts = async (req, res, next) => {
    try {
        const products = await Product.aggregate([
            {
                $sample:{size:3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    price:1,
                    image:1
                }
            }
        ])
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: " Error in recommended products ",
            error: error.message,
          });
    }
}
export const getProductsByCategory = async (req, res, next) => {
    try {
        const products = await Product.find({ category: req.params.category });
        if (!products) {
            return res.status(404).json({ message: "Products not found in this category" });
        }
        res.json({products});
    } catch (error) {
        res.status(500).json({
            message: "Error in getting products by category",
            error: error.message,
        });
    }
}
export const toggleFeaturedProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if(product){
            product.isFeatured =!product.isFeatured;
            await product.save();
            await updatedFeaturedProductsCache();
            res.json(product);
        }else{
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error in toggleFeaturedProduct",
            error: error.message,
        });
    }
}
async function updatedFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in update cache function")
    }
}