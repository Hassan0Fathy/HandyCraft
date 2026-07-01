// Reusable Image Manager Component for HandyCraft Admin
// Requirements: Multiple upload, preview, drag & drop, remove, replace, reorder.

class ImageManager {
    constructor(containerId, initialImages = [], onChange) {
        this.container = document.getElementById(containerId);
        this.images = [...initialImages];
        this.onChange = onChange;
        this.init();
    }

    init() {
        this.render();
    }

    setImages(images) {
        this.images = [...images];
        this.render();
    }

    getImages() {
        return this.images;
    }

    async uploadFiles(files) {
        const adminToken = localStorage.getItem('adminToken');
        const API_BASE_URL = (window.RUNTIME_CONFIG?.API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, '');
        
        const btn = document.querySelector('button[type="submit"]') || document.getElementById('save-product-btn');
        const originalText = btn ? btn.textContent : 'Saving';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Uploading...';
        }

        console.time("TotalUploadTime");
        const uploadPromises = Array.from(files).map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);

            console.time(`NetworkLatency_${index}`);
            try {
                const res = await fetch(`${API_BASE_URL}/upload/image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${adminToken}` },
                    body: formData
                });
                console.timeEnd(`NetworkLatency_${index}`);
                
                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.statusText}`);
                }
                const data = await res.json();
                return data.url;
            } catch (e) {
                console.error('Image upload failed', e);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        console.timeEnd("TotalUploadTime");

        const successfulUrls = urls.filter(url => url !== null);
        
        console.time("RenderTime");
        this.images.push(...successfulUrls);
        this.render();
        console.timeEnd("RenderTime");
        
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }

        if (this.onChange) this.onChange(this.images);
    }

    async replaceImage(index, file) {
        const adminToken = localStorage.getItem('adminToken');
        const API_BASE_URL = (window.RUNTIME_CONFIG?.API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, '');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminToken}` },
                body: formData
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Replacement failed with status', res.status, 'Body:', errorText);
                throw new Error(`Upload failed: ${res.statusText}`);
            }
            const data = await res.json();
            this.images[index] = data.url;
            this.render();
            if (this.onChange) this.onChange(this.images);
        } catch (e) {
            console.error('Image replacement failed', e);
            alert(`Image replacement failed for ${file.name}: ${e.message}`);
        }
    }

    removeImage(index) {
        this.images.splice(index, 1);
        this.render();
        if (this.onChange) this.onChange(this.images);
    }

    render() {
        const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
        const cardClass = "relative aspect-square rounded-xl overflow-hidden border border-brown-pale group bg-white shadow-sm";
        const btnClass = "p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition";
        const replaceBtnClass = "p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer";
        
        let html = `<div class="${gridClass}">`;

        // Render images
        this.images.forEach((img, idx) => {
            html += `
                <div class="${cardClass}" draggable="true" ondragstart="imageManager.handleDragStart(event, ${idx})" ondragover="imageManager.handleDragOver(event)" ondrop="imageManager.handleDrop(event, ${idx})">
                    <img src="${img}" class="w-full h-full object-cover" onerror="this.src='images/placeholder.png'">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onclick="imageManager.removeImage(${idx})" class="${btnClass}" title="Remove">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <label class="${replaceBtnClass}" title="Replace">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 113.23 3.23L19.513 7.1C21.388 8.156 22.5 9.83 22.5 11.652v6.348a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.348C4.5 9.83 5.612 8.156 7.487 7.1l-1.687-1.688a1.875 1.875 0 113.23-3.23L8.138 4.487z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12l2-2m0 0l2 2m-2-2v6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <input type="file" class="hidden" accept="image/*" onchange="imageManager.replaceImage(${idx}, event.target.files[0])">
                        </label>
                    </div>
                </div>
            `;
        });

        // Render upload card
        html += `
            <label class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-brown-pale rounded-xl p-4 hover:border-brown-mid transition cursor-pointer bg-beige-soft">
                <svg class="w-6 h-6 text-brown-mid mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                <span class="text-brown-mid text-[10px] uppercase tracking-widest font-bold">Upload</span>
                <input type="file" multiple accept="image/*" class="hidden" onchange="imageManager.uploadFiles(event.target.files)">
            </label>
        `;
        html += `</div>`;

        // Render empty message if needed
        if (this.images.length === 0) {
            html += `<div class="text-center py-6 text-brown-light italic text-sm">No images uploaded yet.</div>`;
        }
        
        this.container.innerHTML = html;
    }

    handleDragStart(e, index) {
        e.dataTransfer.setData('text/plain', index);
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e, targetIndex) {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (sourceIndex === targetIndex) return;
        
        const item = this.images.splice(sourceIndex, 1)[0];
        this.images.splice(targetIndex, 0, item);
        this.render();
        if (this.onChange) this.onChange(this.images);
    }

    handleExternalDrop(e) {
        e.preventDefault();
        this.uploadFiles(e.dataTransfer.files);
    }
}
