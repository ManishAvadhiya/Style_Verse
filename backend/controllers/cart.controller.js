import Product from "../models/product.model.js";

export const addToCart = async (req,res) =>{
    try {
        const {productId} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem){
            existingItem.quantity += 1;
        }else{
            user.cartItems.push(productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({
            message: "Error in adding to cart",
            error: error.message,
        });
    }
}
export const removeAllFromCart = async (req,res) =>{
    try {
        const {productId} = req.body;
        const user = req.user;
        if(!productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter(item => item.id!== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({
            message: "Error in removing from cart",
            error: error.message,
        });
    }
}
export const updateQuantity = async (req,res) =>{
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem){
            if(quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id!== productId);
                await user.save();
                res.json(user.cartItems);
            }else{
                existingItem.quantity = quantity;
                await user.save();
                res.json(user.cartItems);
            }
        }else{
            res.status(404).json({ message: "Product not found in cart" });  
        }
    } catch (error) {
        res.status(500).json({
            message: "Error in updating quantity",
            error: error.message,
        });
    }
}
export const getCartProducts = async (req,res) =>{
    try {
        const product = await Product.find({_id:{$in:req.user.cartItems}})
        const cartItems = product.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity: item.quantity};
        })
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({
            message: "Error in getting cart products",
            error: error.message,
        });
    }
}