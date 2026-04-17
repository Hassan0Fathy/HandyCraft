const products = [
  {
    id: 'frame-1',
    name: 'Custom Photo Frame',
    description: 'Personalized & handmade photo frame. Display your lovely memories with style.',
    price: 350,
    images: [
      'images/Frames_(1).jpg',
      'images/Frames_(2).jpg'
    ]
  },
  {
    id: 'frame-2',
    name: 'Memory Frame',
    description: 'Rustic & warm design. Perfect for treasured moments.',
    price: 380,
    images: [
      'images/MemoryCards_(1).jpg',
      'images/MemoryCards_(2).jpg'
    ]
  },
  {
    id: 'book-1',
    name: 'Custom Journal',
    description: 'Handcrafted & unique journal. Capture your thoughts beautifully.',
    price: 450,
    images: [
      'images/ValentineBook_(1).jpg',
      'images/ValentineBook_(2).jpg',
      'images/ValentineBook_(3).jpg',
      'images/ValentineBook_(4).jpg'
    ]
  },
  {
    id: 'book-2',
    name: 'Scrapbook',
    description: 'Your memories, bound. A timeless keepsake of special moments.',
    price: 400,
    images: [
      'images/GradutionCap_(1).jpg',
      'images/GradutionCap_(2).jpg',
      'images/GradutionCap_(3).jpg'
    ]
  },
  {
    id: 'birth-1',
    name: 'Birthday Gift Box',
    description: 'Curated with love. Premium handmade gift packaging.',
    price: 200,
    images: [
      'images/GradutionCap_(4).jpg',
      'images/GradutionCap_(5).jpg'
    ]
  },
  {
    id: 'birth-2',
    name: 'Custom Wrap Set',
    description: 'Kraft & dried flowers. Eco-friendly gift wrapping.',
    price: 220,
    images: [
      'images/GradutionCap_(6).jpg',
      'images/GradutionCap_(7).jpg'
    ]
  },
  {
    id: 'baby-1',
    name: 'Baby Gift Set',
    description: 'Gentle & sweet. Perfect for new arrivals and celebrations.',
    price: 250,
    images: [
      'images/MemoryCards_(1).jpg',
      'images/MemoryCards_(2).jpg'
    ]
  },
  {
    id: 'baby-2',
    name: 'Name Tag Gift',
    description: 'Personalized keepsake. A special memento for little ones.',
    price: 150,
    images: [
      'images/ValentineBook_(3).jpg',
      'images/ValentineBook_(4).jpg'
    ]
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
