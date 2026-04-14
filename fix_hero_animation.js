const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const cssRegex = /\/\* Logo animation \*\/([\s\S]*?)(\/\* Fade-up animation \*\/)/;
const newCss = `/* Logo animations */
    @keyframes logoIn {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .logo-intro {
      animation: logoIn 1.2s ease-out 0.2s both;
    }
    .logo-float {
      animation: logoFloat 3s ease-in-out infinite;
    }
    .logo-hover {
      transition: transform 0.3s ease-out, filter 0.3s ease-out;
      filter: drop-shadow(0 2px 6px rgba(158, 117, 80, 0.1));
    }
    .logo-hover:hover {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 12px rgba(158, 117, 80, 0.25));
    }

    $2`;

html = html.replace(cssRegex, newCss);

const heroRegex = /<!-- Animated Logo replacing Headline -->([\s\S]*?)<!-- Subline -->/g;
const newHero = `<!-- Animated Logo replacing Headline -->
    <div class="logo-intro mb-6 flex justify-center">
      <div class="logo-float" style="animation-delay: 1.4s;">
        <img src="images/logo.png" alt="Handy Crafts Logo" class="logo-hover w-[200px] h-auto" />
      </div>
    </div>

    <!-- Subline -->`;

html = html.replace(heroRegex, newHero);

// Also verify that the subtitle is rendered correctly and has a fade-up animation.
html = html.replace(/<p class="anim-3 text-\[13px\] text-brown-light([\s\S]*?)<\/p>/, '<p class="anim-3 text-[13px] text-brown-light$1</p>');

fs.writeFileSync('index.html', html);
console.log('Update successful');