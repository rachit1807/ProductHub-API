const products = require("../data/products");

const sendValidationError = (res, message) => res.status(400).json({
    success: false,
    message
});

const parseProductFields = (body, { partial = false } = {}) => {
    const fields = {};

    if (!partial || body.name !== undefined) {
        if (typeof body.name !== "string" || !body.name.trim()) {
            return { error: "Product name is required." };
        }
        fields.name = body.name.trim();
    }

    if (!partial || body.category !== undefined) {
        if (typeof body.category !== "string" || !body.category.trim()) {
            return { error: "Product category is required." };
        }
        fields.category = body.category.trim();
    }

    if (!partial || body.price !== undefined) {
        const price = Number(body.price);
        if (body.price === "" || !Number.isFinite(price) || price < 0) {
            return { error: "Price must be a valid non-negative number." };
        }
        fields.price = price;
    }

    if (!partial || body.description !== undefined) {
        if (body.description !== undefined && typeof body.description !== "string") {
            return { error: "Description must be text." };
        }
        fields.description = (body.description || "").trim();
    }

    return { fields };
};

// GET All Products
const getProducts = (req, res) => {
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
};

// GET Product by ID
const getProductById = (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    res.status(200).json({ success: true, data: product });
};

// ADD Product
const createProduct = (req, res) => {
    const parsed = parseProductFields(req.body || {});
    if (parsed.error) return sendValidationError(res, parsed.error);

    const nextId = products.reduce((maxId, product) => Math.max(maxId, Number(product.id) || 0), 0) + 1;
    const newProduct = { id: nextId, ...parsed.fields };
    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: "Product added successfully.",
        data: newProduct
    });
};

// UPDATE Product
const updateProduct = (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    const parsed = parseProductFields(req.body || {}, { partial: true });
    if (parsed.error) return sendValidationError(res, parsed.error);
    if (Object.keys(parsed.fields).length === 0) {
        return sendValidationError(res, "Provide at least one product field to update.");
    }

    Object.assign(product, parsed.fields);

    res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: product
    });
};

// DELETE Product
const deleteProduct = (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    const [deletedProduct] = products.splice(index, 1);

    res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
        data: deletedProduct
    });
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
