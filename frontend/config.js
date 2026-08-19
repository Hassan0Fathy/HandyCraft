window.RUNTIME_CONFIG = {
  API_BASE_URL: "https://handycraft.runasp.net/api"
};

window.getCloudinaryImageUrl = function(url, options = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  
  const uploadIndex = url.indexOf('/image/upload/');
  if (uploadIndex === -1) return url;
  
  const transformations = [];
  if (options.f) transformations.push(`f_${options.f}`);
  else transformations.push('f_auto');
  
  if (options.q) transformations.push(`q_${options.q}`);
  else transformations.push('q_auto');
  
  if (options.w) transformations.push(`w_${options.w}`);
  if (options.h) transformations.push(`h_${options.h}`);
  if (options.c) transformations.push(`c_${options.c}`);
  
  const transformStr = transformations.join(',');
  if (!transformStr) return url;

  const basePath = url.substring(0, uploadIndex + 14);
  const restOfPath = url.substring(uploadIndex + 14);
  
  return `${basePath}${transformStr}/${restOfPath}`;
};

// Back to Top Button Injection
(function() {
  const initBackToTop = () => {
    if (document.getElementById('back-to-top')) return;
    
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to top');
    
    const style = document.createElement('style');
    style.textContent = `
      #back-to-top {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 42px;
        height: 42px;
        background-color: #9e7550;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(158, 117, 80, 0.3);
        transform: translateY(10px);
      }
      #back-to-top.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      #back-to-top:hover {
        background-color: #6b4f35;
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 6px 16px rgba(107, 79, 53, 0.4);
      }
      #back-to-top:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(btn);
    
    btn.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  } else {
    initBackToTop();
  }
})();
