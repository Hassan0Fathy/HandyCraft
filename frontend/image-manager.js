// Reusable Image Manager Component for HandyCraft Admin
// Requirements: Multiple upload, preview, drag & drop, remove, replace, reorder.
// Optimized for performance with controlled concurrency and immediate previews.

class ImageManager {
    static globalQueue = [];
    static activeGlobalUploads = 0;
    static MAX_GLOBAL_CONCURRENCY = 4;

    constructor(containerId, initialImages = [], onChange) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }

        // Each item: { url: string, file: File|null, previewUrl: string|null, status: 'success'|'uploading'|'error', errorMsg: string|null }
        this.items = initialImages.map(url => ({
            url: url,
            file: null,
            previewUrl: url,
            status: 'success',
            errorMsg: null
        }));
        
        this.onChange = onChange;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Use event delegation to avoid issues with hardcoded global variables
        this.container.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('[data-mgr-action="remove"]');
            if (removeBtn) {
                this.removeImage(parseInt(removeBtn.dataset.index));
                return;
            }

            const retryBtn = e.target.closest('[data-mgr-action="retry"]');
            if (retryBtn) {
                this.retryUpload(parseInt(retryBtn.dataset.index));
                return;
            }
        });

        this.container.addEventListener('change', (e) => {
            const uploadInput = e.target.closest('[data-mgr-action="upload-input"]');
            if (uploadInput && uploadInput.files.length > 0) {
                this.uploadFiles(uploadInput.files);
                uploadInput.value = ''; // Reset for next selection
                return;
            }

            const replaceInput = e.target.closest('[data-mgr-action="replace-input"]');
            if (replaceInput && replaceInput.files.length > 0) {
                this.replaceImage(parseInt(replaceInput.dataset.index), replaceInput.files[0]);
                replaceInput.value = ''; // Reset
                return;
            }
        });

        // Drag & Drop
        this.container.addEventListener('dragstart', (e) => {
            const card = e.target.closest('[data-index]');
            if (card) {
                e.dataTransfer.setData('text/plain', card.dataset.index);
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetCard = e.target.closest('[data-index]');
            
            if (isNaN(sourceIndex)) {
                // External files drop
                if (e.dataTransfer.files.length > 0) {
                    this.uploadFiles(e.dataTransfer.files);
                }
                return;
            }

            if (targetCard) {
                const targetIndex = parseInt(targetCard.dataset.index);
                this.handleReorder(sourceIndex, targetIndex);
            }
        });
    }

    setImages(images) {
        this.items = images.map(url => ({
            url: url,
            file: null,
            previewUrl: url,
            status: 'success',
            errorMsg: null
        }));
        this.render();
    }

    getImages() {
        return this.items
            .filter(item => item.status === 'success')
            .map(item => item.url);
    }

    async uploadFiles(files) {
        const newItems = Array.from(files).map(file => {
            const previewUrl = URL.createObjectURL(file);
            return {
                url: '',
                file: file,
                previewUrl: previewUrl,
                status: 'pending',
                errorMsg: null
            };
        });

        this.items.push(...newItems);
        this.render();

        newItems.forEach(item => {
            this.enqueueUpload(item);
        });
    }

    async replaceImage(index, file) {
        if (index < 0 || index >= this.items.length) return;

        // Cleanup old preview if it was a local URL
        if (this.items[index].previewUrl && this.items[index].previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.items[index].previewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        this.items[index] = {
            url: '',
            file: file,
            previewUrl: previewUrl,
            status: 'pending',
            errorMsg: null
        };
        
        this.render();
        this.enqueueUpload(this.items[index]);
    }

    removeImage(index) {
        if (index < 0 || index >= this.items.length) return;
        
        const item = this.items[index];
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
        }

        this.items.splice(index, 1);
        this.render();
        this.notifyChange();
    }

    retryUpload(index) {
        const item = this.items[index];
        if (item && item.status === 'error') {
            item.status = 'pending';
            item.errorMsg = null;
            this.render();
            this.enqueueUpload(item);
        }
    }

    handleReorder(sourceIndex, targetIndex) {
        if (sourceIndex === targetIndex) return;
        const item = this.items.splice(sourceIndex, 1)[0];
        this.items.splice(targetIndex, 0, item);
        this.render();
        this.notifyChange();
    }

    enqueueUpload(item) {
        ImageManager.globalQueue.push({ manager: this, item });
        ImageManager.processGlobalQueue();
        this.updateButtonState();
    }

    static async processGlobalQueue() {
        if (this.activeGlobalUploads >= this.MAX_GLOBAL_CONCURRENCY || this.globalQueue.length === 0) {
            return;
        }

        const { manager, item } = this.globalQueue.shift();
        
        // If item was removed while in queue
        if (!manager.items.includes(item)) {
            this.processGlobalQueue();
            return;
        }

        this.activeGlobalUploads++;
        item.status = 'uploading';
        manager.render();

        try {
            const url = await manager.performUpload(item.file);
            item.url = url;
            item.status = 'success';
            item.previewUrl = url; // Use remote URL now
        } catch (e) {
            item.status = 'error';
            item.errorMsg = e.message;
        } finally {
            this.activeGlobalUploads--;
            manager.render();
            manager.notifyChange();
            manager.updateButtonState();
            this.processGlobalQueue();
        }
    }

    async performUpload(file) {
        const adminToken = localStorage.getItem('adminToken');
        const API_BASE_URL = (window.RUNTIME_CONFIG?.API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, '');
        
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` },
            body: formData
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed: ${res.statusText}`);
        }
        
        const data = await res.json();
        return data.url;
    }

    updateButtonState() {
        const btn = document.querySelector('button[type="submit"]') || document.getElementById('save-product-btn');
        if (!btn) return;

        const anyUploading = ImageManager.activeGlobalUploads > 0 || ImageManager.globalQueue.length > 0;
        
        if (anyUploading) {
            if (!btn.dataset.originalText) {
                btn.dataset.originalText = btn.textContent;
            }
            btn.disabled = true;
            btn.textContent = 'Uploading...';
        } else {
            if (btn.dataset.originalText) {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        }
    }

    notifyChange() {
        if (this.onChange) {
            this.onChange(this.getImages());
        }
    }

    render() {
        const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
        const cardClass = "relative aspect-square rounded-xl overflow-hidden border border-brown-pale group bg-white shadow-sm";
        const btnClass = "p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition";
        const replaceBtnClass = "p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer";
        const retryBtnClass = "p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition";
        
        let html = `<div class="${gridClass}">`;

        // Render items
        this.items.forEach((item, idx) => {
            const isUploading = item.status === 'uploading' || item.status === 'pending';
            const isError = item.status === 'error';
            
            html += `
                <div class="${cardClass}" draggable="true" data-index="${idx}">
                    <img src="${item.previewUrl}" class="w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}" onerror="this.src='images/placeholder.png'">
                    
                    ${isUploading ? `
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-6 h-6 border-2 border-brown-mid border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ` : ''}

                    ${isError ? `
                        <div class="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center p-2 text-center">
                            <span class="text-[8px] text-red-700 font-bold mb-1 leading-tight">Failed</span>
                            <button type="button" data-mgr-action="retry" data-index="${idx}" class="${retryBtnClass}" title="Retry">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            </button>
                        </div>
                    ` : ''}

                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" data-mgr-action="remove" data-index="${idx}" class="${btnClass}" title="Remove">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <label class="${replaceBtnClass}" title="Replace">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 113.23 3.23L19.513 7.1C21.388 8.156 22.5 9.83 22.5 11.652v6.348a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.348C4.5 9.83 5.612 8.156 7.487 7.1l-1.687-1.688a1.875 1.875 0 113.23-3.23L8.138 4.487z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12l2-2m0 0l2 2m-2-2v6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <input type="file" class="hidden" accept="image/*" data-mgr-action="replace-input" data-index="${idx}">
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
                <input type="file" multiple accept="image/*" class="hidden" data-mgr-action="upload-input">
            </label>
        `;
        html += `</div>`;

        // Render empty message if needed
        if (this.items.length === 0) {
            html += `<div class="text-center py-6 text-brown-light italic text-sm">No images uploaded yet.</div>`;
        }
        
        this.container.innerHTML = html;
    }
}

// Attach to window to make it globally available as before
window.ImageManager = ImageManager;
