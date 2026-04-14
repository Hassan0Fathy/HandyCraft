const fs = require('fs');

let html = fs.readFileSync('product-details.html', 'utf8');

// 1. CSS
if (!html.includes('/* Customization Builder Styles */')) {
    html = html.replace('</style>', `
    /* Customization Builder Styles */
    .custom-option { cursor: pointer; position: relative; border: 2px solid transparent; transition: all 0.3s ease; }
    .custom-option img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .custom-option:hover img { transform: scale(1.05); }
    .custom-option.selected { border-color: #9e7550; box-shadow: 0 4px 12px rgba(140, 107, 74, 0.2); transform: scale(1.02); }
    .pattern-card { height: 75px; border-radius: 12px; overflow: hidden; }
    .shape-card { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; }
    .remove-thumb { position: absolute; top: 4px; right: 4px; background: rgba(255,255,255,0.9); color: #8c6b4a; border-radius: 50%; width: 20px; height: 20px; font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer; }
    .remove-thumb:hover { background: #8c6b4a; color: white; }
  </style>`);
}

// 2. Customization state
if (!html.includes('let customization =')) {
    html = html.replace('let uploadedBase64Images = [];', 'let uploadedBase64Images = [];\n    let customization = { pattern: null, shapes: [] };');
}

// 3. Modifying Upload Image Label to support count
html = html.replace(/<label class="block text-\[11px\] font-medium text-\[#9e7550\] uppercase tracking-widest mb-2">Upload Reference Images <span class="text-red-400">\*<\/span><\/label>/g, 
`<div class="flex justify-between items-end mb-2">
                    <label class="block text-[11px] font-medium text-[#9e7550] uppercase tracking-widest">Upload Reference Images <span class="text-red-400">*</span></label>
                    \${product.id.startsWith('frame') ? \`<span id="upload-counter" class="text-[10px] text-[#c4a882] tracking-wider font-medium">0 / 6 uploaded</span>\` : ''}
                </div>`);

// 4. Inject visual block for Pattern & Shape (before Add to Cart)
if (!html.includes('id="frame-customization"')) {
    html = html.replace(/<button id="add-to-cart-btn"/g,
`           <!-- Frame Builder Insert -->
            \${product.id.startsWith('frame') ? \`
            <div id="frame-customization" class="bg-white rounded-2xl p-5 border border-[#ecdccc]/70 mb-8 shadow-sm">
                <h3 class="font-cormorant text-2xl italic text-[#6b4f35] mb-4">Customize Your Frame</h3>
                <div class="mb-5">
                    <div class="flex justify-between items-end mb-2">
                        <label class="block text-[11px] font-medium text-[#9e7550] uppercase tracking-widest">1. Select Pattern <span class="text-red-400">*</span></label>
                        <span id="pattern-status" class="text-[10px] text-[#c4a882] tracking-wider font-medium">Required</span>
                    </div>
                    <div class="grid grid-cols-3 gap-3" id="pattern-grid"></div>
                </div>
                <div class="mb-2">
                    <div class="flex justify-between items-end mb-2">
                        <label class="block text-[11px] font-medium text-[#9e7550] uppercase tracking-widest">2. Choose Shapes <span class="text-red-400">*</span></label>
                        <span id="shape-counter" class="text-[10px] text-[#c4a882] tracking-wider font-medium">0 / 6 selected</span>
                    </div>
                    <div class="flex flex-wrap gap-3" id="shape-grid"></div>
                </div>
            </div>
            \` : ''}
            <button id="add-to-cart-btn"`);
}

// 5. Script initialization call
if (!html.includes('initFrameCustomization()')) {
    html = html.replace(/if\(el\) el\.addEventListener\('input', validateForm\);\n    }\);/g,
    `if(el) el.addEventListener('input', validateForm);
      });
      if (product.id.startsWith('frame')) {
        initFrameCustomization();
      }`);
}

// 6. Definitions logic
if (!html.includes('function initFrameCustomization')) {
    html = html.replace(/function setMainImage/g,
    `function initFrameCustomization() {
        const availablePatterns = [
            { id: "pat1", name: "Classic Wood", img: "images/pattern1.jpg" },
            { id: "pat2", name: "Dark Walnut", img: "images/pattern2.jpg" },
            { id: "pat3", name: "White Oak", img: "images/pattern3.jpg" }
        ];
        const availableShapes = [
            { id: "shp1", img: "images/shape-circle.png" },
            { id: "shp2", img: "images/shape-square.png" },
            { id: "shp3", img: "images/shape-hex.png" },
            { id: "shp4", img: "images/shape-arch.png" },
            { id: "shp5", img: "images/shape-star.png" },
            { id: "shp6", img: "images/shape-heart.png" }
        ];

        const pGrid = document.getElementById('pattern-grid');
        availablePatterns.forEach(pat => {
            const el = document.createElement('div');
            el.className = 'custom-option pattern-card bg-[#faf5ef]';
            el.innerHTML = '<img src="' + pat.img + '" alt="' + pat.name + '" onerror="this.src=\\'https://via.placeholder.com/150x80\\'" />';
            el.addEventListener('click', () => {
                customization.pattern = pat.id;
                pGrid.querySelectorAll('.pattern-card').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                document.getElementById('pattern-status').innerText = pat.name;
                document.getElementById('pattern-status').className = 'text-[11px] text-[#6b4f35] font-bold';
                validateForm();
            });
            pGrid.appendChild(el);
        });

        const sGrid = document.getElementById('shape-grid');
        availableShapes.forEach(shp => {
            const el = document.createElement('div');
            el.className = 'custom-option shape-card bg-[#faf5ef] flex-shrink-0';
            el.innerHTML = '<img src="' + shp.img + '" onerror="this.src=\\'https://via.placeholder.com/60\\'"/>';
            el.addEventListener('click', () => {
                const idx = customization.shapes.indexOf(shp.id);
                if (idx > -1) {
                    customization.shapes.splice(idx, 1);
                    el.classList.remove('selected');
                } else {
                    if (customization.shapes.length >= 6) {
                        alert('You can only select up to 6 shapes.');
                        return;
                    }
                    customization.shapes.push(shp.id);
                    el.classList.add('selected');
                }
                const cnt = document.getElementById('shape-counter');
                cnt.innerText = customization.shapes.length + ' / 6 selected';
                if(customization.shapes.length > 0) cnt.className = 'text-[10px] text-[#6b4f35] font-bold';
                else cnt.className = 'text-[10px] text-[#c4a882] tracking-wider font-medium';
                validateForm();
            });
            sGrid.appendChild(el);
        });
    }

    function setMainImage`);
}

// 7. Max 6 limitation
if (html.includes('if (!files.length) return;') && !html.includes("alert('You can only upload up to 6 images.');")) {
    html = html.replace(/if \(\!files\.length\) return;\s*files\.forEach\(file => {/g,
    `if (!files.length) return;
        if (product.id.startsWith('frame')) {
            if (uploadedBase64Images.length + files.length > 6) {
                alert('You can only upload up to 6 images.');
                e.target.value = '';
                return;
            }
        }
        files.forEach(file => {`);
}

// 8. Update Counter Display (Wait, renderPreviews has this?)
if (html.includes('function renderPreviews() {') && !html.includes('upload-counter')) {
    html = html.replace(/function renderPreviews\(\) {\s*const container = document\.getElementById\('img-preview-container'\);/g,
    `function renderPreviews() {
        const counter = document.getElementById('upload-counter');
        if (counter) counter.innerText = uploadedBase64Images.length + ' / 6 uploaded';
        const container = document.getElementById('img-preview-container');`);
}

// 9. Extra Validation rules
if (html.includes('const isValid = loveInput.value.trim()') && !html.includes('isValid = isValid && customization.pattern')) {
    html = html.replace(/const isValid = loveInput\.value\.trim\(\) .*?&& uploadedBase64Images\.length > 0;/g,
    `let isValid = loveInput.value.trim() && storyInput.value.trim() && proudInput.value.trim() && songInput.value.trim() && uploadedBase64Images.length > 0;
        
        if (product.id.startsWith('frame')) {
            isValid = isValid && customization.pattern !== null && customization.shapes.length > 0;
        }`);
}

// 10. Save customization
if (html.includes('messages: {') && !html.includes('customization: product.id.startsWith')) {
    html = html.replace(/images: \[\.\.\.uploadedBase64Images\]/g,
    `customization: product.id.startsWith('frame') ? { ...customization } : undefined,
             images: [...uploadedBase64Images]`);
}

fs.writeFileSync('product-details.html', html, 'utf8');
console.log('Update file script OK');
