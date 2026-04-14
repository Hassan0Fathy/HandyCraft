const products = [
  {
    id: 'frame-1',
    name: 'Custom Photo Frame',
    description: 'Personalized & handmade photo frame. Display your lovely memories with style.',
    price: 350,
    images: ['images/frames.png']
  },
  {
    id: 'frame-2',
    name: 'Memory Frame',
    description: 'Rustic & warm design.',
    price: 380,
    images: ['images/frames.png']
  },
  {
    id: 'book-1',
    name: 'Custom Journal',
    description: 'Handcrafted & unique journal.',
    price: 450,
    images: ['images/books.png']
  },
  {
    id: 'book-2',
    name: 'Scrapbook',
    description: 'Your memories, bound.',
    price: 400,
    images: ['images/books.png']
  },
  {
    id: 'birth-1',
    name: 'Birthday Gift Box',
    description: 'Curated with love.',
    price: 200,
    images: ['images/birthday.png']
  },
  {
    id: 'birth-2',
    name: 'Custom Wrap Set',
    description: 'Kraft & dried flowers.',
    price: 220,
    images: ['images/birthday.png']
  },
  {
    id: 'baby-1',
    name: 'Baby Gift Set',
    description: 'Gentle & sweet.',
    price: 250,
    images: ['images/baby.png']
  },
  {
    id: 'baby-2',
    name: 'Name Tag Gift',
    description: 'Personalized keepsake.',
    price: 150,
    images: ['images/baby.png']
  }
];

function addToCart(e, productId) {
    if (e) e.preventDefault();
    e.stopPropagation();
    let product = products.find(p => p.id === productId);
    
    // fallback for the category.html (which passes cat string like 'frames')
    if(!product) {
       const prices = {frames: 350, books: 450, birthday: 200, baby: 250};
       const names = {frames: 'Custom Photo Frame', books: 'Custom Journal', birthday: 'Birthday Gift Box', baby: 'Baby Gift Set'};
       product = { id: productId, name: names[productId] || productId, price: prices[productId] || 250, images: ['images/'+productId+'.png']};
    }
    
    let cart = JSON.parse(localStorage.getItem('hc_cart') || '[]');
    let existing = cart.find(it => it.id === product.id);
    if(existing) { 
      existing.qty = (existing.qty || existing.quantity || 1) + 1; existing.quantity = existing.qty;
    } else { 
      cart.push({
         id: product.id, 
         name: product.name, 
         price: product.price, 
         qty: 1, quantity: 1, 
         img: product.images[0]
      }); 
    }
    localStorage.setItem('hc_cart', JSON.stringify(cart));
    
    if(typeof updateCartBadge !== 'undefined') updateCartBadge();
    
    if (e && e.target) {
        const btn = e.target; 
        const ogText = btn.innerText;
        btn.innerText = 'Added ✔'; 
        btn.style.backgroundColor = '#7a5c3e'; 
        btn.style.color = '#fff';
        setTimeout(() => {
           btn.innerText = ogText; 
           btn.style.backgroundColor = '';
           btn.style.color = '';
        }, 2000);
    }
}
