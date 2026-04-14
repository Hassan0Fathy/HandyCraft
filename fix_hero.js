const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Insert new CSS animation
// Look for where anim-1 resides and prepend the logo animation
const cssRegex = /\.anim-1 \{/;
if(html.match(cssRegex)) {
  html = html.replace(cssRegex, `@keyframes logoIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }\n    .anim-logo { animation: logoIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }\n    .anim-1 {`);
}

// Replace headline with animated logo
const heroRegex = /<!-- Headline -->[\s\S]*?<\/h1>\s*<!-- Subline -->\s*<p class="anim-3((?:(?!<\/p>)[\s\S])*)<\/p>/;
html = html.replace(heroRegex, `<!-- Animated Logo replacing Headline -->
    <img src="images/logo.png" alt="Handy Crafts Logo" class="anim-logo mx-auto w-36 sm:w-44 h-auto mb-6 drop-shadow-[0_4px_12px_rgba(158,117,80,0.15)]" />

    <!-- Subline -->
    <p class="anim-3$1 font-light">
      Every piece is made just for you —<br class="hidden sm:block" />with care, detail, and love.
    </p>`);

fs.writeFileSync('index.html', html);
console.log('Update complete!');