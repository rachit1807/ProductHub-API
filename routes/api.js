const express = require("express");
const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// API Home
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ProductHub API is running 🚀"
    });
});

// GET All Products
router.get("/products", getProducts);

// GET Single Product
router.get("/products/:id", getProductById);

// CREATE Product
router.post("/products", createProduct);

// UPDATE Product
router.put("/products/:id", updateProduct);

// DELETE Product
router.delete("/products/:id", deleteProduct);

module.exports = router;