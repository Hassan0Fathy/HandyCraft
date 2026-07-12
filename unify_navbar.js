const fs = require('fs');
const files = [
  'frontend/index.html', 
  'frontend/products.html', 
  'frontend/payment.html', 
  'frontend/cart.html', 
  'frontend/product-details.html', 
  'frontend/order.html', 
  'frontend/orders.html'
];

const navPlaceholder = `
  <!-- DYNAMIC NAVBAR INJECTION -->
  <div id="navbar-container"></div>
  <script>
    fetch("navbar.html")
      .then(r => r.text())
      .then(html => {
        document.getElementById("navbar-container").innerHTML = html;
        const scripts = document.getElementById("navbar-container").getElementsByTagName("script");
        for (let s of scripts) {
          const newScript = document.createElement("script");
          if (s.src) {
            newScript.src = s.src;
          } else {
            newScript.textContent = s.textContent;
          }
          document.body.appendChild(newScript);
        }
      });
  </script>
`;

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace <nav class="sticky top-0 z-50... till </nav> with navPlaceholder
    content = content.replace(/<!-- NAVBAR & DRAWER -->.*?<\/nav>/s, navPlaceholder);
    content = content.replace(/<nav class="sticky top-0 z-50.*?<\/nav>/s, navPlaceholder);
    
    // Remove the duplicated mobile drawer wrapper div
    content = content.replace(/<div id="mobile-drawer-wrapper".*?<\/div>\s*<\/div>\s*<\/div>/s, '');
    content = content.replace(/<div id="mobile-drawer-wrapper".*?<\/div>\s*<\/div>/s, '');
    
    // Remove duplicate window.openDrawer and other scripts
    content = content.replace(/<script>\s*window\.openDrawer.*?<\/script>/s, '');
    content = content.replace(/<script>\s*function openDrawer.*?<\/script>/s, '');
    
    fs.writeFileSync(f, content, 'utf8');
});
console.log('Unification setup completed via script successfully.');
