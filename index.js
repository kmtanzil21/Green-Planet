let plantCollection = [];
let treeCategories = [];
let shoppingCart = {};
let activeCategory = 0; // Default to "All Trees" category

function showSpinner() {
  const plantGrid = document.getElementById("tree-list");
  plantGrid.innerHTML = `
    <div id="loading-spinner" class="col-span-full flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-green-600"></span>
    </div>
  `;
}

function hideSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.classList.add("hidden");
  }
}

function fetchCategories() {
  fetch("https://openapi.programming-hero.com/api/categories")
    .then(res => res.json())
    .then(data => {
      treeCategories = data.categories;
      renderCategoryButtons(treeCategories);
    })
    .catch(() => {
      document.getElementById("categories").innerHTML =
        '<p class="text-red-600 text-sm md:text-base">Failed to load categories.</p>';
    });
}

function renderCategoryButtons(categories) {
  const container = document.getElementById("categories");
  container.innerHTML = "";
  categories.slice(1).forEach(cat => {
    const categoryBtn = document.createElement("button");
    categoryBtn.className =
      "category-btn block w-full text-left px-3 py-1 md:px-4 md:py-2 rounded font-normal text-gray-900 bg-transparent hover:bg-green-600 hover:text-white transition-colors cursor-pointer text-sm md:text-base";
    categoryBtn.textContent = cat.category_name;
    categoryBtn.setAttribute("data-id", cat.id);
    categoryBtn.onclick = () => onCategorySelect(cat.id);
    container.appendChild(categoryBtn);
  });
  
  // Highlight the currently active category
  highlightActiveCategory();
}

function onCategorySelect(categoryId) {
  activeCategory = categoryId;
  
  // Update button active class
  highlightActiveCategory();
  
  if (categoryId === 0) {
    renderPlants(plantCollection);
    return;
  }
  
  // Show loading spinner during category filtering
  showSpinner();
  
  setTimeout(() => {
    const categoryName = treeCategories.find(c => +c.id === +categoryId)?.category_name.replace(/s$/, "") ?? "";
    const filteredPlants = plantCollection.filter(p => p.category.toLowerCase().includes(categoryName.toLowerCase()));
    renderPlants(filteredPlants);
  }, 300); // Delay to show spinner
}

function highlightActiveCategory() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.classList.remove('bg-green-600', 'text-white');
    btn.classList.add('bg-transparent', 'text-gray-900');
  });
  
  if (activeCategory === 0) {
    document.getElementById('category-all').classList.add('bg-green-600', 'text-white');
    document.getElementById('category-all').classList.remove('bg-transparent', 'text-gray-900');
  } else {
    const activeBtn = document.querySelector(`[data-id="${activeCategory}"]`);
    if (activeBtn) {
      activeBtn.classList.add('bg-green-600', 'text-white');
      activeBtn.classList.remove('bg-transparent', 'text-gray-900');
    }
  }
}

function loadAllPlants() {
  showSpinner();

  fetch("https://openapi.programming-hero.com/api/plants")
    .then(res => res.json())
    .then(data => {
      plantCollection = data.plants;
      renderPlants(plantCollection);
    })
    .catch(() => {
      document.getElementById("tree-list").innerHTML =
        '<p class="col-span-full text-center text-red-600 text-sm md:text-base">Failed to load trees.</p>';
    });
}

function renderPlants(plants) {
  const plantGrid = document.getElementById("tree-list");
  plantGrid.innerHTML = "";
  
  if (!plants.length) {
    plantGrid.innerHTML = '<p class="col-span-full text-center text-red-600 text-sm md:text-base">No trees found.</p>';
    return;
  }
  
  const showAll = activeCategory === 0;
  
  plants.forEach(plant => {
    const plantCard = createPlantCard(plant);
    if (!showAll) {
      plantCard.classList.add("mb-4", "md:mb-6");
    }
    plantGrid.appendChild(plantCard);
  });
}

function createPlantCard(plant) {
  const card = document.createElement("div");
  card.className = "bg-white rounded-xl p-3 md:p-4 shadow flex flex-col w-full max-w-xs mx-auto h-[350px] md:h-[400px]";

  card.innerHTML = `
    <img src="${plant.image}" alt="${plant.name}" class="w-full h-28 md:h-32 object-cover rounded mb-2 md:mb-3 bg-gray-100" />
    <div class="font-semibold text-sm md:text-base mb-1">${plant.name}</div>
    <div class="text-gray-700 text-xs md:text-sm mb-2 overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${plant.description}</div>
    <div class="flex items-center justify-between mb-2 md:mb-3">
      <span class="bg-green-100 text-green-700 text-xs px-2 py-1 md:px-3 md:py-1 rounded-full font-medium">${plant.category}</span>
      <span class="font-semibold text-sm md:text-base text-gray-800">৳${plant.price}</span>
    </div>
    <button class="mt-auto w-full bg-green-600 text-white font-semibold py-1 md:py-2 rounded-full hover:bg-green-700 transition text-sm md:text-base" data-id="${plant.id}">
      Add to Cart
    </button>
  `;

  card.querySelector("button").onclick = () => addToCart(plant);

  return card;
}

function addToCart(plant) {
  if (shoppingCart[plant.id]) shoppingCart[plant.id].qty += 1;
  else shoppingCart[plant.id] = { plant, qty: 1 };
  updateShoppingCart();
}

function removeFromCart(plantId) {
  delete shoppingCart[plantId];
  updateShoppingCart();
}

function updateShoppingCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalAmount = document.getElementById("cart-total");
  const emptyCartMessage = document.getElementById("empty-cart");

  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;
  const cartSize = Object.keys(shoppingCart).length;

  if (cartSize === 0) {
    emptyCartMessage.classList.remove("hidden");
  } else {
    emptyCartMessage.classList.add("hidden");
  }

  Object.values(shoppingCart).forEach(({ plant, qty }) => {
    totalPrice += plant.price * qty;

    const cartItem = document.createElement("div");
    cartItem.className = "flex items-start justify-between gap-2 bg-green-100 px-2 py-1 md:px-3 md:py-2 rounded mb-1 text-sm md:text-base";

    cartItem.innerHTML = `
      <div class="flex-grow">
        <div class="font-medium text-green-800">${plant.name}</div>
        <div class="text-xs md:text-sm text-gray-700">৳${plant.price} × ${qty}</div>
      </div>
      <button class="text-black text-base rounded hover:text-red-700 focus:outline-none" title="Remove from Cart">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    cartItem.querySelector("button").onclick = () => removeFromCart(plant.id);

    cartItemsContainer.appendChild(cartItem);
  });

  totalAmount.textContent = `৳${totalPrice}`;
}

window.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  loadAllPlants();
  updateShoppingCart();
});
