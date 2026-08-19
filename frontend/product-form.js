/**
 * ProductFormManager handles the complex UI and data logic for both 
 * adding and editing products in the HandyCraft Admin.
 */
class ProductFormManager {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) throw new Error(`Form with id ${formId} not found`);
        
        this.options = {
            mainImageContainerId: options.mainImageContainerId,
            customFieldsContainerId: options.customFieldsContainerId,
            variantsSectionId: options.variantsSectionId,
            variantsListId: options.variantsListId,
            hasVariantsCheckboxId: options.hasVariantsCheckboxId,
            onSave: options.onSave || (async (data) => { throw new Error('onSave handler not provided'); }),
            ...options
        };

        this.mainImageManager = null;
        this.variantImageManagers = new Map(); // Map of variantId -> ImageManager
        
        this.init();
    }

    init() {
        // Initialize Main Image Manager
        if (this.options.mainImageContainerId) {
            this.mainImageManager = new ImageManager(this.options.mainImageContainerId, [], (imgs) => {
                this.mainImages = imgs;
            });
            this.mainImages = [];
        }

        // Setup Event Listeners for Custom Fields
        this.setupCustomFieldListeners();

        // Setup Variants Checkbox
        const hasVariantsCb = document.getElementById(this.options.hasVariantsCheckboxId);
        if (hasVariantsCb) {
            hasVariantsCb.addEventListener('change', (e) => {
                const section = document.getElementById(this.options.variantsSectionId);
                if (section) {
                    section.classList.toggle('hidden', !e.target.checked);
                }
            });
        }
    }

    setupCustomFieldListeners() {
        // We use event delegation for custom fields and variant custom fields
        this.form.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-field-btn')) {
                e.preventDefault();
                e.target.closest('.custom-field-row, .var-cf-row').remove();
            }
        });
    }

    // --- Custom Fields Logic ---

    addCustomField(type = 'text', data = {}) {
        const container = document.getElementById(this.options.customFieldsContainerId);
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'custom-field-row bg-[#fffdf9] border border-[#ecdccc]/70 rounded-lg p-4 space-y-3';
        
        const fieldId = 'field-' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        const isImage = type === 'image';
        const minImg = data.minImages || (isImage ? 1 : 1);
        const maxImg = data.maxImages || (isImage ? 100 : 9);
        const required = data.required || false;
        const label = data.label || '';

        row.innerHTML = `
            <div>
                <input type="text" placeholder="Field label" value="${this.escapeHtml(label)}" 
                    class="w-full rounded-lg border border-[#ecdccc] px-3 py-2 text-sm focus:outline-none focus:border-[#9e7550]" 
                    data-role="label">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <select class="rounded-lg border border-[#ecdccc] px-3 py-2 text-sm focus:outline-none focus:border-[#9e7550]" data-role="type">
                    <option value="text" ${type === 'text' ? 'selected' : ''}>Text</option>
                    <option value="image" ${type === 'image' ? 'selected' : ''}>Image</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-[#9e7550] cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 rounded" data-role="required" ${required ? 'checked' : ''}>
                    <span>Required</span>
                </label>
            </div>
            <div class="grid grid-cols-2 gap-2 ${isImage ? '' : 'hidden'}" data-minmax-section>
                <div>
                    <label class="text-xs text-[#9e7550] mb-1 block">Min Photos</label>
                    <input type="number" min="1" value="${minImg}" class="w-full rounded-lg border border-[#ecdccc] px-2 py-1.5 text-sm focus:outline-none focus:border-[#9e7550]" data-role="min-images">
                </div>
                <div>
                    <label class="text-xs text-[#9e7550] mb-1 block">Max Photos</label>
                    <input type="number" min="1" value="${maxImg}" class="w-full rounded-lg border border-[#ecdccc] px-2 py-1.5 text-sm focus:outline-none focus:border-[#9e7550]" data-role="max-images">
                </div>
            </div>
            <button type="button" class="w-full px-3 py-2 rounded-lg text-[10px] tracking-widest uppercase border border-red-200 text-red-600 hover:bg-red-50 transition font-medium remove-field-btn">Remove</button>
        `;

        const typeSelect = row.querySelector('[data-role="type"]');
        typeSelect.addEventListener('change', (e) => {
            const minMaxDiv = row.querySelector('[data-minmax-section]');
            if (minMaxDiv) {
                minMaxDiv.classList.toggle('hidden', e.target.value !== 'image');
            }
        });

        container.appendChild(row);
    }

    readCustomFields() {
        const container = document.getElementById(this.options.customFieldsContainerId);
        if (!container) return [];
        
        return Array.from(container.querySelectorAll('.custom-field-row')).map(row => ({
            label: row.querySelector('[data-role="label"]').value.trim(),
            type: row.querySelector('[data-role="type"]').value,
            required: row.querySelector('[data-role="required"]').checked,
            minImages: parseInt(row.querySelector('[data-role="min-images"]').value) || 1,
            maxImages: parseInt(row.querySelector('[data-role="max-images"]').value) || 9
        })).filter(f => f.label);
    }

    // --- Variants Logic ---

    addVariant(data = {}) {
        const list = document.getElementById(this.options.variantsListId);
        if (!list) return;

        const vId = 'var-' + Date.now() + Math.random().toString(36).substr(2, 9);
        const block = document.createElement('div');
        block.className = 'bg-white border border-[#ecdccc] rounded-lg p-5 space-y-4 relative variant-block';
        block.dataset.vid = vId;
        
        const name = data.name || '';
        const price = data.price || '';
        const images = data.images || [];

        block.innerHTML = `
            <button type="button" class="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-medium uppercase remove-variant-btn">Remove</button>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs uppercase tracking-widest text-[#9e7550] mb-2">Variant Name <span class="text-red-400">*</span></label>
                    <input type="text" data-var-role="name" value="${this.escapeHtml(name)}" placeholder="e.g. Pink Flowers" required class="w-full rounded-lg border border-[#ecdccc] px-3 py-2 text-sm focus:outline-none focus:border-[#9e7550]">
                </div>
                <div>
                    <label class="block text-xs uppercase tracking-widest text-[#9e7550] mb-2">Override Price (Optional)</label>
                    <input type="number" data-var-role="price" value="${price}" min="0" step="0.01" placeholder="Leave empty to use base price" class="w-full rounded-lg border border-[#ecdccc] px-3 py-2 text-sm focus:outline-none focus:border-[#9e7550]">
                </div>
            </div>
            <div>
                <label class="block text-xs uppercase tracking-widest text-[#9e7550] mb-2">Variant Images <span class="text-red-400">*</span></label>
                <div id="img-mgr-${vId}" class="mb-2"></div>
            </div>
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs uppercase tracking-widest text-[#9e7550]">Variant Custom Fields (Optional)</label>
                    <div class="flex gap-2">
                        <button type="button" class="add-var-cf-btn px-2 py-1 rounded border border-[#ecdccc] text-[#9e7550] text-[9px] uppercase hover:bg-[#faf5ef] transition" data-type="text">+ Text</button>
                        <button type="button" class="add-var-cf-btn px-2 py-1 rounded border border-[#ecdccc] text-[#9e7550] text-[9px] uppercase hover:bg-[#faf5ef] transition" data-type="image">+ Image</button>
                    </div>
                </div>
                <div id="var-cf-list-${vId}" class="space-y-2"></div>
            </div>
        `;

        list.appendChild(block);

        // Handle Variant Removal
        block.querySelector('.remove-variant-btn').addEventListener('click', () => {
            block.remove();
            this.variantImageManagers.delete(vId);
        });

        // Initialize Variant Image Manager
        const vImgMgr = new ImageManager(`img-mgr-${vId}`, images, (imgs) => {
            // Images are stored in the manager
        });
        this.variantImageManagers.set(vId, vImgMgr);

        // Handle Variant Custom Field Addition
        block.querySelectorAll('.add-var-cf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addVariantCustomField(vId, btn.dataset.type);
            });
        });

        // Populate existing Variant Custom Fields
        if (data.customFields && Array.isArray(data.customFields)) {
            data.customFields.forEach(cf => this.addVariantCustomField(vId, cf.type, cf));
        }
    }

    addVariantCustomField(vId, type, data = {}) {
        const list = document.getElementById(`var-cf-list-${vId}`);
        if (!list) return;
        const row = document.createElement('div');
        row.className = 'bg-[#faf5ef] border border-[#ecdccc]/70 rounded p-3 space-y-2 var-cf-row';
        
        const cfId = 'vcf-' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        const isImage = type === 'image';
        const minImg = data.minImages || (isImage ? 1 : 1);
        const maxImg = data.maxImages || (isImage ? 100 : 9);
        const required = data.required || false;
        const label = data.label || '';

        let minMaxSection = isImage ? `
            <div class="grid grid-cols-2 gap-2 mt-2">
                <input type="number" min="1" value="${minImg}" placeholder="Min" class="w-full rounded border border-[#ecdccc] px-2 py-1 text-xs focus:outline-none" data-role="min-images">
                <input type="number" min="1" value="${maxImg}" placeholder="Max" class="w-full rounded border border-[#ecdccc] px-2 py-1 text-xs focus:outline-none" data-role="max-images">
            </div>
        ` : `<input type="hidden" data-role="min-images" value="${minImg}"><input type="hidden" data-role="max-images" value="${maxImg}">`;

        row.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="text" placeholder="Field Label" value="${this.escapeHtml(label)}" class="flex-grow rounded border border-[#ecdccc] px-2 py-1 text-xs focus:outline-none" data-role="label">
                <input type="hidden" data-role="type" value="${type}">
                <label class="flex items-center gap-1 text-xs text-[#9e7550] whitespace-nowrap">
                    <input type="checkbox" data-role="required" class="rounded" ${required ? 'checked' : ''}> Req
                </label>
                <button type="button" class="text-red-500 hover:text-red-700 text-xs font-bold px-1 remove-field-btn">&times;</button>
            </div>
            ${minMaxSection}
        `;
        list.appendChild(row);
    }

    readVariants() {
        const blocks = Array.from(this.form.querySelectorAll('.variant-block'));
        return blocks.map(block => {
            const vId = block.dataset.vid;
            const imgMgr = this.variantImageManagers.get(vId);
            
            // Read custom fields for this variant
            const cfList = block.querySelector(`[id^="var-cf-list-"]`);
            const customFields = Array.from(cfList.querySelectorAll('.var-cf-row')).map(row => ({
                label: row.querySelector('[data-role="label"]').value.trim(),
                type: row.querySelector('[data-role="type"]').value,
                required: row.querySelector('[data-role="required"]').checked,
                minImages: parseInt(row.querySelector('[data-role="min-images"]').value) || 1,
                maxImages: parseInt(row.querySelector('[data-role="max-images"]').value) || 9
            })).filter(f => f.label);

            return {
                name: block.querySelector('[data-var-role="name"]').value.trim(),
                price: block.querySelector('[data-var-role="price"]').value ? parseFloat(block.querySelector('[data-var-role="price"]').value) : undefined,
                images: imgMgr ? imgMgr.getImages() : [],
                customFields
            };
        }).filter(v => v.name);
    }

    // --- Data Loading & Saving ---

    async loadProductData(product) {
        // Reset form
        this.form.reset();
        
        // Basic Fields
        if (this.form.querySelector('[name="name"]')) this.form.querySelector('[name="name"]').value = product.name || '';
        if (this.form.querySelector('[name="price"]')) this.form.querySelector('[name="price"]').value = product.price || '';
        if (this.form.querySelector('[name="category"]')) this.form.querySelector('[name="category"]').value = product.category || '';
        if (this.form.querySelector('[name="subcategory"]')) this.form.querySelector('[name="subcategory"]').value = product.subcategory || '';
        if (this.form.querySelector('[name="description"]')) this.form.querySelector('[name="description"]').value = product.description || '';
        if (this.form.querySelector('[name="bestseller"]')) this.form.querySelector('[name="bestseller"]').checked = product.bestSeller || false;
        if (this.form.querySelector('[name="status"]')) this.form.querySelector('[name="status"]').value = product.status || 'active';
        if (this.form.querySelector('[name="sku"]')) this.form.querySelector('[name="sku"]').value = product.sku || '';
        if (this.form.querySelector('[name="product-id"]')) this.form.querySelector('[name="product-id"]').value = product._id || '';

        // Main Images
        if (this.mainImageManager) {
            this.mainImageManager.setImages(product.images || []);
        }

        // Custom Fields
        const cfContainer = document.getElementById(this.options.customFieldsContainerId);
        if (cfContainer) cfContainer.innerHTML = '';
        if (product.customFields && Array.isArray(product.customFields)) {
            product.customFields.forEach(cf => this.addCustomField(cf.type, cf));
        }

        // Variants
        const variantsList = document.getElementById(this.options.variantsListId);
        if (variantsList) variantsList.innerHTML = '';
        this.variantImageManagers.clear();
        
        const hasVariantsCb = document.getElementById(this.options.hasVariantsCheckboxId);
        if (hasVariantsCb) {
            hasVariantsCb.checked = product.hasVariants || false;
            // Trigger the change event to show/hide section
            hasVariantsCb.dispatchEvent(new Event('change'));
        }

        if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach(v => this.addVariant(v));
        }
    }

    async gatherData() {
        const formData = new FormData(this.form);
        const skuValue = formData.get('sku')?.trim();
        const priceVal = parseFloat(formData.get('price'));
        
        const data = {
            name: formData.get('name')?.trim(),
            price: isNaN(priceVal) ? 0 : priceVal,
            category: formData.get('category')?.trim(),
            subcategory: formData.get('subcategory')?.trim() || '',
            description: formData.get('description')?.trim(),
            status: formData.get('status')?.trim() || 'active',
            sku: skuValue !== '' ? skuValue : undefined,
            bestSeller: formData.get('bestseller') === 'on',
            images: this.mainImageManager ? this.mainImageManager.getImages() : [],
            customFields: this.readCustomFields(),
            hasVariants: formData.get('hasVariants') === 'on',
            variants: this.readVariants()
        };

        // Special case: if we have a hidden product-id, we might be editing
        const idField = this.form.querySelector('[name="product-id"]');
        if (idField) data._id = idField.value;

        return data;
    }

    async submit() {
        const data = await this.gatherData();
        return await this.options.onSave(data);
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }
}
