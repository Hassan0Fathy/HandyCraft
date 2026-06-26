const API_BASE_URL = (window.RUNTIME_CONFIG?.API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, '');
let allProducts = [];
let productList = [];
let categories = [];
let subcategories = [];

async function fetchData() {
  try {
    const [prodRes, catRes, subRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/categories`),
      fetch(`${API_BASE_URL}/subcategories`)
    ]);
    
    const [prodData, catData, subData] = await Promise.all([
      prodRes.json(),
      catRes.json(),
      subRes.json()
    ]);
    
    allProducts = Array.isArray(prodData) ? prodData : (prodData.data || []);
    categories = (catData.data || []).filter(c => c.isActive).sort((a, b) => a.order - b.order);
    subcategories = (subData.data || []).filter(s => s.isActive);
    
    renderCategoryFilters();
    renderProducts();
  } catch (error) {
    console.error('Data fetch error:', error);
  }
}

function renderCategoryFilters() {
  const container = document.querySelector('.overflow-x-auto .flex.gap-2');
  if (!container) return;
  
  container.innerHTML = `
    <button onclick="filterCat('all')" id="tab-all" class="filter-tab tab-active shrink-0 px-5 py-2.5 rounded-full text-[10px] tracking-[0.2em] uppercase border transition-all duration-200">All</button>
    ${categories.map(cat => `
      <button onclick="filterCat('${cat.name}')" id="tab-${cat.slug}" class="filter-tab shrink-0 px-5 py-2.5 rounded-full text-[10px] tracking-[0.2em] uppercase border border-[#ecdccc] text-[#c4a882] hover:border-[#9e7550] hover:text-[#9e7550] transition-all duration-200">
        ${cat.name}
      </button>
    `).join('')}
  `;
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  allProducts.forEach((product) => {
    let mainImage = 'images/placeholder.png';
    let hoverImage = null;
    
    if (Array.isArray(product.images) && product.images.length > 0) {
      if (product.images[0]) mainImage = product.images[0];
      if (product.images[1]) hoverImage = product.images[1];
    }

    const catObj = categories.find(c => c.name === product.category);
    const catSlug = catObj ? catObj.slug : 'uncategorized';
    const subcat = String(product.subcategory || '').toLowerCase();
    const productId = product._id;

    const card = document.createElement('div');
    card.className = 'prod-card group bg-white rounded-lg overflow-hidden ring-1 ring-[#ecdccc]/50 hover:ring-[#9e7550]/70 hover:shadow-xl transition-all duration-300 cursor-pointer';
    card.dataset.cat = product.category;
    card.dataset.subcat = subcat;
    card.onclick = () => window.location.href = `product-details.html?id=${encodeURIComponent(productId)}`;

    card.innerHTML = `
      <div class="aspect-square overflow-hidden bg-[#f5ede3]">
        <div class="prod-image-container relative">
          <img src="${mainImage}" alt="${product.name}" class="prod-image-main" onerror="this.src='images/placeholder.png'" />
          ${hoverImage ? `<img src="${hoverImage}" alt="${product.name}" class="prod-image-hover absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />` : ''}
        </div>
      </div>
      <div class="p-4 md:p-5 flex flex-col h-[140px]">
        <h3 class="text-sm md:text-base font-medium text-[#6b4f35] mb-1 line-clamp-2">${product.name}</h3>
        <p class="text-xs md:text-sm text-[#9e7550] mb-3 line-clamp-1 flex-grow">${product.description || 'Handmade item'}</p>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-sm md:text-base font-medium text-[#6b4f35]">${product.price} EGP</span>
          <button class="px-3 md:px-4 py-2 bg-[#9e7550] text-white text-xs md:text-sm rounded-full hover:bg-[#6b4f35] transition-colors duration-200 font-medium">View</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterCat(catName) {
  // UI update logic... (similar to existing, just dynamic)
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('tab-active'));
  const activeTab = catName === 'all' ? document.getElementById('tab-all') : document.getElementById(`tab-${categories.find(c => c.name === catName).slug}`);
  if(activeTab) activeTab.classList.add('tab-active');
  
  document.querySelectorAll('#product-grid .prod-card').forEach(card => {
    card.style.display = (catName === 'all' || card.dataset.cat === catName) ? '' : 'none';
  });
}
