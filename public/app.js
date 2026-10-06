// ==========================
// PRODUCTHUB API
// ==========================

const loadBtn = document.getElementById("loadBtn");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const viewFavoritesBtn =
    document.getElementById("viewFavoritesBtn") ||
    document.getElementById("favoritesBtn") ||
    Array.from(document.querySelectorAll("button")).find(button =>
        button.textContent.trim().toLowerCase() === "view favorites"
    );
const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");
const nameSearch = document.getElementById("nameSearch");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const productsDiv = document.getElementById("products");
const productCount = document.getElementById("productCount");
const statTotal = document.getElementById("statTotal");
const statCategories = document.getElementById("statCategories");
const statAveragePrice = document.getElementById("statAveragePrice");
const statFavorites = document.getElementById("statFavorites");
const loader = document.getElementById("loader");

const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const addProductBtn = document.getElementById("addProductBtn");
const productFormModal = document.getElementById("productFormModal");
const productForm = document.getElementById("productForm");
const closeProductFormBtn = document.getElementById("closeProductForm");
const toastContainer = document.getElementById("toastContainer");

let allProducts = [];
let filteredProducts = [];
let showingFavorites = false;
let editingProductId = null;

// ==========================
// PRODUCT STATISTICS
// ==========================

function updateProductStatistics() {

    const categoryCount = new Set(allProducts.map(product => product.category)).size;
    const totalPrice = allProducts.reduce((sum, product) => sum + Number(product.price || 0), 0);
    const averagePrice = allProducts.length ? totalPrice / allProducts.length : 0;
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const favoriteCount = allProducts.filter(product => savedFavorites.includes(product.id)).length;

    statTotal.textContent = allProducts.length.toLocaleString();
    statCategories.textContent = categoryCount.toLocaleString();
    statAveragePrice.textContent = `₹${averagePrice.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    statFavorites.textContent = favoriteCount.toLocaleString();

}

// ==========================
// TOAST NOTIFICATIONS
// ==========================

function showToast(message, type = "success") {

    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 250);
    }, 3200);

}

// ==========================
// DARK MODE
// ==========================

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
} else {
    themeToggle.textContent = "🌙 Dark Mode";
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";

    } else {

        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";

    }

});

// ==========================
// EVENT LISTENERS
// ==========================

loadBtn.addEventListener("click", () => loadProducts());
addProductBtn.addEventListener("click", () => openProductForm());
productForm.addEventListener("submit", saveProduct);
closeProductFormBtn.addEventListener("click", closeProductForm);

searchBtn.addEventListener("click", searchById);

clearBtn.addEventListener("click", clearFilters);

if (viewFavoritesBtn) {
    viewFavoritesBtn.addEventListener("click", toggleFavoritesView);
}

searchInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        searchById();
    }

});

nameSearch.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

sortSelect.addEventListener("change", sortProducts);

// ==========================
// LOAD PRODUCTS
// ==========================

async function loadProducts(showSuccessToast = true) {

    productsDiv.className = "";
    productsDiv.innerHTML = "";

    productCount.textContent = "";

    // Show Loader
    loader.style.display = "flex";

    try {

        // Temporary delay to see spinner
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch("/api/products");
        const result = await response.json();

        // Hide Loader
        loader.style.display = "none";

        if (!result.success) {

            productsDiv.innerHTML =
                "<h2 style='text-align:center;'>No Products Found</h2>";

            productCount.textContent = "Showing 0 Products";
            allProducts = [];
            filteredProducts = [];
            updateProductStatistics();
            showToast("No products were found.", "info");

            return;

        }

        allProducts = result.data;
        filteredProducts = [...allProducts];
        updateProductStatistics();

        if (showingFavorites) {
            filterProducts();
        } else {
            displayProducts(filteredProducts);
        }
        updateProductStatistics();
        if (showSuccessToast !== false) {
            showToast(`Loaded ${allProducts.length} product${allProducts.length === 1 ? "" : "s"}.`);
        }

    }

    catch (error) {

        // Hide Loader
        loader.style.display = "none";

        console.error(error);

        productsDiv.innerHTML =
            "<h2 style='text-align:center;color:red;'>Failed to load products.</h2>";

        productCount.textContent = "Showing 0 Products";
        allProducts = [];
        filteredProducts = [];
        updateProductStatistics();
        showToast("Could not load products. Please try again.", "error");

    }

}

// ==========================
// SEARCH BY ID
// ==========================

async function searchById() {

    const id = searchInput.value.trim();

    if (!id) {

        showToast("Please enter a product ID.", "error");
        return;

    }

    try {

        const response = await fetch(`/api/products/${id}`);
        const result = await response.json();

        if (!result.success) {

            productsDiv.className = "";

            productsDiv.innerHTML =
                "<h2 style='text-align:center;'>Product Not Found</h2>";

            productCount.textContent = "Showing 0 Products";
            showToast(`Product ${id} was not found.`, "error");

            return;

        }

        const product = result.data;

        productCount.textContent = "Showing 1 Product";

        productsDiv.className = "single-product";

        const favorites =
            JSON.parse(localStorage.getItem("favorites")) || [];

        const isFavorite = favorites.includes(product.id);

        showToast("Product found.");

        productsDiv.innerHTML = `

            <div class="card">

                <span
                    class="favorite-btn"
                    onclick="toggleFavorite(${product.id}, event)"
                >
                    ${isFavorite ? "❤️" : "🤍"}
                </span>

                <div onclick="openProductModal(${product.id})">

                    <h2>${product.name}</h2>

                    <p><strong>ID:</strong> ${product.id}</p>

                    <p><strong>Category:</strong> ${product.category}</p>

                    <p class="price">₹${product.price}</p>

                </div>

                <div class="crud-actions">
                    <button type="button" class="edit-product-btn" onclick="editProduct(${product.id}, event)">Edit</button>
                    <button type="button" class="delete-product-btn" onclick="deleteProduct(${product.id}, event)">Delete</button>
                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(error);

        productsDiv.innerHTML =
            "<h2 style='text-align:center;color:red;'>Something went wrong.</h2>";
        showToast("Search failed. Please try again.", "error");

    }

}
// ==========================
// FILTER PRODUCTS
// ==========================

function filterProducts() {

    const keyword = nameSearch.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const productsToFilter = showingFavorites
        ? allProducts.filter(product => favorites.includes(product.id))
        : allProducts;

    filteredProducts = productsToFilter.filter(product => {

        const matchName = product.name
            .toLowerCase()
            .includes(keyword);

        const matchCategory =
            category === "all" ||
            product.category === category;

        return matchName && matchCategory;

    });

    sortProducts(false);
    displayProducts(filteredProducts);

}

// ==========================
// SORT PRODUCTS
// ==========================

function sortProducts(render = true) {

    const option = sortSelect.value;

    switch (option) {

        case "priceLow":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;

        case "priceHigh":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;

        case "nameAZ":
            filteredProducts.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "nameZA":
            filteredProducts.sort((a, b) =>
                b.name.localeCompare(a.name)
            );
            break;

    }

    if (render) {
        displayProducts(filteredProducts);
    }

}

// ==========================
// DISPLAY PRODUCTS
// ==========================

function displayProducts(products) {

    productsDiv.className = "";
    productsDiv.innerHTML = "";

    productCount.textContent =
        `Showing ${products.length} Product${products.length !== 1 ? "s" : ""}`;

    if (products.length === 0) {

        productsDiv.innerHTML =
            "<h2 style='text-align:center;'>No Products Found</h2>";

        return;

    }

    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    products.forEach(product => {

        const isFavorite = favorites.includes(product.id);

        productsDiv.innerHTML += `

            <div class="card">

                <span
                    class="favorite-btn"
                    onclick="toggleFavorite(${product.id}, event)"
                >
                    ${isFavorite ? "❤️" : "🤍"}
                </span>

                <div onclick="openProductModal(${product.id})">

                    <h2>${product.name}</h2>

                    <p><strong>ID:</strong> ${product.id}</p>

                    <p><strong>Category:</strong> ${product.category}</p>

                    <p class="price">₹${product.price}</p>

                </div>

                <div class="crud-actions">
                    <button type="button" class="edit-product-btn" onclick="editProduct(${product.id}, event)">Edit</button>
                    <button type="button" class="delete-product-btn" onclick="deleteProduct(${product.id}, event)">Delete</button>
                </div>

            </div>

        `;

    });

}
// ==========================
// CLEAR FILTERS
// ==========================

function clearFilters() {

    showingFavorites = false;
    updateFavoritesButtonLabel();
    searchInput.value = "";
    nameSearch.value = "";
    categoryFilter.value = "all";
    sortSelect.value = "";

    productsDiv.className = "";

    filteredProducts = [...allProducts];

    displayProducts(filteredProducts);

}

// ==========================
// FAVORITES
// ==========================

function toggleFavoritesView() {

    showingFavorites = !showingFavorites;
    updateFavoritesButtonLabel();
    filterProducts();

    if (showingFavorites && filteredProducts.length === 0) {
        showToast("You have no saved favorites yet.", "info");
    }

}

function updateFavoritesButtonLabel() {

    if (viewFavoritesBtn) {
        viewFavoritesBtn.textContent = showingFavorites
            ? "View All Products"
            : "View Favorites";
    }

}

function toggleFavorite(id, event) {

    event.stopPropagation();

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const removingFavorite = favorites.includes(id);

    if (removingFavorite) {

        favorites = favorites.filter(item => item !== id);

    } else {

        favorites.push(id);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
    updateProductStatistics();
    showToast(removingFavorite ? "Removed from favorites." : "Added to favorites.");

    if (showingFavorites) {
        filterProducts();
    } else {
        displayProducts(filteredProducts);
    }

}
// ==========================
// PRODUCT DETAILS MODAL
// ==========================

function openProductForm(product = null) {

    editingProductId = product ? product.id : null;
    document.getElementById("productFormTitle").textContent = product ? "Edit Product" : "Add Product";
    document.getElementById("saveProductBtn").textContent = product ? "Save Changes" : "Add Product";
    document.getElementById("productName").value = product ? product.name : "";
    document.getElementById("productCategory").value = product ? product.category : "";
    document.getElementById("productPrice").value = product ? product.price : "";
    document.getElementById("productDescription").value = product ? (product.description || "") : "";
    productFormModal.style.display = "flex";
    document.getElementById("productName").focus();

}

function closeProductForm() {
    productFormModal.style.display = "none";
    productForm.reset();
    editingProductId = null;
}

async function editProduct(id, event) {
    event.stopPropagation();
    let product = allProducts.find(item => item.id === id);

    if (!product) {
        try {
            const response = await fetch(`/api/products/${id}`);
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Product not found.");
            }
            product = result.data;
        } catch (error) {
            showToast(error.message || "Could not load the product.", "error");
            return;
        }
    }

    openProductForm(product);
}

async function saveProduct(event) {

    event.preventDefault();
    const productData = {
        name: document.getElementById("productName").value.trim(),
        category: document.getElementById("productCategory").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        description: document.getElementById("productDescription").value.trim()
    };

    const isEditing = editingProductId !== null;
    const url = isEditing ? `/api/products/${editingProductId}` : "/api/products";

    try {
        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not save the product.");
        }

        closeProductForm();
        showToast(result.message || (isEditing ? "Product updated." : "Product added."));
        await loadProducts(false);
    } catch (error) {
        showToast(error.message || "Could not save the product.", "error");
    }

}

async function deleteProduct(id, event) {

    event.stopPropagation();
    const product = allProducts.find(item => item.id === id);
    if (!window.confirm(`Delete ${product ? `\"${product.name}\"` : "this product"}? This cannot be undone.`)) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not delete the product.");
        }

        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        localStorage.setItem("favorites", JSON.stringify(favorites.filter(item => item !== id)));
        showToast(result.message || "Product deleted.");
        await loadProducts(false);
    } catch (error) {
        showToast(error.message || "Could not delete the product.", "error");
    }

}

function openProductModal(id) {

    const product = allProducts.find(item => item.id === id);

    if (!product) return;

    document.getElementById("modalTitle").textContent = product.name;

    document.getElementById("modalId").textContent = product.id;

    document.getElementById("modalCategory").textContent = product.category;

    document.getElementById("modalPrice").textContent = product.price;

    document.getElementById("modalDescription").textContent =
        product.description ||
        "This is a high-quality product available in ProductHub.";

    productModal.style.display = "flex";

}

// ==========================
// CLOSE MODAL
// ==========================

closeModal.addEventListener("click", () => {

    productModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === productModal) {
        productModal.style.display = "none";
    }
    if (e.target === productFormModal) {
        closeProductForm();
    }

});

// ==========================
// ESC KEY CLOSE
// ==========================

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        productModal.style.display = "none";
        closeProductForm();

    }

});

// ==========================
// END OF FILE
// ==========================