const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace CSS
const cssRegex = /\/\* Logo animations \*\/[\s\S]*?\/\* Fade-up animation \*\//;
const newCss = `/* Logo animations (Combined & Enhanced) */
    @keyframes logoIn {
      0% { opacity: 0; scale: 0.8; }
      100% { opacity: 1; scale: 1; }
    }
    @keyframes logoFloat {
      0%, 100% { translate: 0 0; }
      50% { translate: 0 -5px; }
    }
    
    .logo-hero {
      /* Base state ensures the image reverts to scale 1 / opacity 1 naturally after logoIn */
      opacity: 1;
      scale: 1;
      translate: 0 0;
      
      /* Play intro backwards to hold start state during delay, then infinite float */
      animation: 
        logoIn 1.2s ease-out 0.2s backwards, 
        logoFloat 3s ease-in-out 1.4s infinite;
        
      /* Smooth transitions for hover effects, independent of translate/opacity animations */
      transition: scale 0.3s ease-out, filter 0.3s ease-out;
      filter: drop-shadow(0 2px 6px rgba(158, 117, 80, 0.1));
    }
    
    .logo-hero:hover {
      scale: 1.05;
      filter: drop-shadow(0 4px 12px rgba(158, 117, 80, 0.25));
    }

    /* Fade-up animation */`;
html = html.replace(cssRegex, newCss);


// Replace HTML structure
const heroRegex = /<!-- Animated Logo replacing Headline -->[\s\S]*?<!-- Subline -->/;
const newHero = `<!-- Animated Logo replacing Headline -->
    <img src="images/logo.png" 
         alt="Handy Crafts Logo" 
         class="logo-hero mx-auto w-[200px] h-auto mb-6" />

    <!-- Subline -->`;
html = html.replace(heroRegex, newHero);


fs.writeFileSync('index.html', html);
console.log('Update complete.');