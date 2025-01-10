const API_URL = "https://dummyjson.com/products";
let allProducts = [];
let filteredProducts = [];

// Fetch products
const fetchProducts = async (limit = 500) => {
  let products = [];
  let skip = 0;

  while (products.length < limit) {
    const response = await fetch(`${API_URL}?limit=100&skip=${skip}`);
    const data = await response.json();
    products = [...products, ...data.products];
    skip += 100;

    if (data.products.length === 0) break;
  }

  allProducts = products.slice(0, limit); // Store all products
  filteredProducts = [...allProducts]; // Set initial filter to all products
  displayProducts(filteredProducts); // Display all products initially

  // Populate categories in filter dropdown
  const categories = [
    ...new Set(allProducts.map((product) => product.category)),
  ];
  const categorySelect = document.getElementById("category-filter");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    categorySelect.appendChild(option);
  });
};

// Display products
const displayProducts = (products) => {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = ""; // Clear current products

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card col-12 col-sm-6 col-md-4 col-lg-3";
    productCard.innerHTML = `
  <div class="product-image">
    <img src="${product.thumbnail}" alt="${product.title}">
  </div>
  <div class="product-details">
    <h3 class="product-title">${product.title}</h3>
    <p class="product-category"><strong>Category:</strong> ${
      product.category
    }</p>
    <p class="product-rating"><strong>Rating:</strong> ${product.rating}</p>
    <p class="product-price"><strong>Price:</strong> $${product.price}</p>
    <button class="buy-now-button" data-product='${JSON.stringify(
      product
    )}' data-bs-toggle="modal" data-bs-target="#productModal">Buy Now</button>
  </div>
`;
    productContainer.appendChild(productCard);

    const img = productCard.querySelector("img");
    img.onload = () => {
      img.style.display = "block"; // Show image once it is loaded
    };
    img.onerror = () => {
      img.style.display = "none"; // Hide image if there is an error
    };
  });

  // Add event listeners for Buy Now buttons
  const buyNowButtons = document.querySelectorAll(".buy-now-button");
  buyNowButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const product = JSON.parse(e.target.getAttribute("data-product"));
      showModal(product);
    });
  });
};
// Show modal with product details
const showModal = (product) => {
  document.getElementById("modal-product-image").src = product.thumbnail;
  document.getElementById("modal-product-title").innerText = product.title;
  document.getElementById("modal-product-description").innerText =
    product.description || "No description available.";
  document.getElementById(
    "modal-product-price"
  ).innerText = `$${product.price}`;
  document.getElementById("modal-product-discount").innerText =
    product.discountPercentage
      ? ` (Discounted Price: $${(
          product.price *
          (1 - product.discountPercentage / 100)
        ).toFixed(2)})`
      : "";
  document.getElementById(
    "modal-product-rating"
  ).innerText = `${product.rating} ⭐`;

  // Add event listeners for Buy Now and Add to Cart buttons
  document.getElementById("buy-now-button").onclick = () => {
    alert("Proceeding to checkout for " + product.title);
    // Here you can add your checkout logic
  };

  document.getElementById("add-to-cart-button").onclick = () => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems.push(product);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    alert(product.title + " has been added to your cart!");
  };

  // Populate reviews (if available)
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = ""; // Clear previous reviews
  if (product.reviews && product.reviews.length > 0) {
    product.reviews.forEach((review) => {
      const reviewElement = document.createElement("div");
      reviewElement.className = "review";
      reviewElement.innerHTML = `
        <p><strong>${review.user}</strong>: ${review.comment} <span class="text-muted">(${review.rating} ⭐)</span></p>
      `;
      reviewsContainer.appendChild(reviewElement);
    });
  } else {
    reviewsContainer.innerHTML = "<p>No reviews available.</p>";
  }
};
// ... existing code ...

// Filter products
const filterProducts = () => {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const priceRange = document.getElementById("price-range").value;
  const ratingFilter = document.getElementById("rating-filter").value;
  const categoryFilter = document.getElementById("category-filter").value;

  filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchInput);
    const matchesPrice = product.price <= priceRange;
    const matchesRating = product.rating >= ratingFilter;
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;

    return matchesSearch && matchesPrice && matchesRating && matchesCategory;
  });

  displayProducts(filteredProducts);
};

// Sort products
const sortProducts = (criteria) => {
  const sorted = [...filteredProducts].sort((a, b) => {
    if (criteria === "price") return a.price - b.price;
    if (criteria === "rating") return b.rating - a.rating;
    return 0;
  });

  displayProducts(sorted);
};

// Handle search input with autocomplete
const handleSearchInput = () => {
  const searchQuery = document
    .getElementById("search-input")
    .value.toLowerCase();
  const suggestions = document.getElementById("autocomplete-suggestions");
  const clearButton = document.getElementById("clear-search");
  suggestions.innerHTML = "";

  // Show/hide clear button
  if (searchQuery.length > 0) {
    clearButton.style.display = "inline-block";

    const filteredSuggestions = allProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery)
    );

    filteredSuggestions.forEach((product) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "autocomplete-item";
      suggestionItem.innerText = product.title;
      suggestionItem.onclick = () => {
        document.getElementById("search-input").value = product.title;
        suggestions.style.display = "none"; // Hide suggestions
        clearButton.style.display = "none"; // Hide clear button
        filterProducts();
      };
      suggestions.appendChild(suggestionItem);
    });

    suggestions.style.display = "block"; // Show suggestions
  } else {
    suggestions.style.display = "none"; // Hide suggestions if input is empty
    clearButton.style.display = "none"; // Hide clear button
  }
};

// Clear search input
const clearSearch = () => {
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("autocomplete-suggestions");
  const clearButton = document.getElementById("clear-search");

  searchInput.value = ""; // Clear the input field
  suggestions.style.display = "none"; // Hide suggestions
  clearButton.style.display = "none"; // Hide clear button
  filterProducts(); // Reset the products to initial state
};

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
  const suggestions = document.getElementById("autocomplete-suggestions");
  const searchInput = document.getElementById("search-input");

  if (!suggestions.contains(e.target) && e.target !== searchInput) {
    suggestions.style.display = "none"; // Hide suggestions
  }
});

// Event listener for search input
document
  .getElementById("search-input")
  .addEventListener("input", handleSearchInput);

// Event listener for clear button
document.getElementById("clear-search").addEventListener("click", clearSearch);

fetchProducts();
