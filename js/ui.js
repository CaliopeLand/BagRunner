/**
 * ui.js
 * =====
 * RENDERIZACIÓN (Dibujar en pantalla)
 * 
 * Todas las funciones que actualizan el DOM.
 * Cuando el estado cambia, estas funciones redibuja la pantalla.
 */

/**
 * FUNCIÓN: Actualizar toda la UI
 * Se llama cada vez que algo importante cambia
 */
function updateUI() {
    updateStats();
    updateProductsGrid();
    updateBags();
    updateButtons();
}

function renderBags() {
    const state = getState();
    const container = document.getElementById('bagsContainer');
    container.innerHTML = '';
    state.bags.forEach(bag => {
        const bagEl = document.createElement('div');
        bagEl.className = 'bag';
        bagEl.innerHTML = `
            <div class="bag-header">
                <span class="bag-title">Bolsa ${bag.id + 1}</span>
                <div class="bag-stats">
                    <span id="bagWeight${bag.id}">0kg / ${CONFIG.BAG_WEIGHT_MAX}kg</span>
                    <span id="bagPercent${bag.id}">0%</span>
                </div>
                <div class="bag-progress">
                    <div class="bag-progress-fill" id="bagProgress${bag.id}"></div>
                </div>
            </div>
            <div class="bag-grid" data-bag-id="${bag.id}">
                ${Array(CONFIG.BAG_GRID_SIZE).fill(0).map((_, y) => 
                    Array(CONFIG.BAG_GRID_SIZE).fill(0).map((_, x) => 
                        `<div class="grid-cell" data-x="${x}" data-y="${y}" data-bag-id="${bag.id}"></div>`
                    ).join('')
                ).join('')}
            </div>
        `;
        container.appendChild(bagEl);
    });
}

/**
 * FUNCIÓN: Actualizar estadísticas (puntos, clientes, carga total)
 */
function updateStats() {
    const state = getState();
    const capacityInfo = getTotalCapacityInfo();

    document.getElementById('clientsCount').textContent = state.clientsServed;
    document.getElementById('pointsCount').textContent = state.points;
    document.getElementById('totalWeight').textContent = capacityInfo.weight + 'kg';
    document.getElementById('totalWeightText').textContent = capacityInfo.weight + 'kg / ' + capacityInfo.maxWeight + 'kg';
    document.getElementById('totalPercent').textContent = Math.round(capacityInfo.percent * 100) + '%';

    const progressFill = document.getElementById('totalProgress');
    progressFill.style.width = (capacityInfo.percent * 100) + '%';
    
    // Cambiar color según capacidad
    progressFill.classList.remove('warning', 'danger');
    if (capacityInfo.percent > 0.9) {
        progressFill.classList.add('danger');
    } else if (capacityInfo.percent > 0.75) {
        progressFill.classList.add('warning');
    }
}

/**
 * FUNCIÓN: Renderizar grilla de productos disponibles
 */
function updateProductsGrid() {
    const state = getState();
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    state.products.forEach((product, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.idx = idx;

        if (product.used) card.classList.add('disabled');
        if (state.selectedProduct === idx) card.classList.add('selected');

        const rotatedShape = getRotatedShape(product.type, product.rotation);
        const miniGrid = renderMiniGrid(rotatedShape);

        card.innerHTML = `
            <div class="product-header">
                <span class="product-emoji">${product.type.emoji}</span>
                <div class="product-info">
                    <div class="product-name">${product.type.name}</div>
                    <div class="product-weight">${product.type.weight}kg</div>
                </div>
            ${miniGrid}
        `;

        if (!product.used) {
            card.draggable = true;
            card.addEventListener('dragstart', (e) => handleDragStart(e, idx));
            card.addEventListener('dragend', handleDragEnd);
            card.addEventListener('click', () => {
                selectProduct(idx);
                updateUI();
            });
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                rotateProduct(idx);
                updateUI();
            });
        }

        grid.appendChild(card);
    });
}

/**
 * FUNCIÓN: Renderizar mini grid (forma del producto)
 */
function renderMiniGrid(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    let html = `<div class="mini-grid" style="grid-template-columns: repeat(${cols}, 1fr);">`;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            html += `<div class="mini-cell ${shape[y][x] ? 'active' : ''}"></div>`;
        }
    }
    html += '</div>';
    return html;
}

/**
 * FUNCIÓN: Actualizar bolsas
 */
function updateBags() {
    const state = getState();
    state.bags.forEach(bag => updateBag(bag.id));
}

/**
 * FUNCIÓN: Actualizar una bolsa específica
 */
function updateBag(bagId) {
    const state = getState();
    const bag = state.bags[bagId];
    const bagInfo = getBagInfo(bagId);

    // Actualizar peso
    document.getElementById(`bagWeight${bagId}`).textContent = bagInfo.weight + 'kg / ' + bagInfo.maxWeight + 'kg';
    document.getElementById(`bagPercent${bagId}`).textContent = Math.round(bagInfo.percent * 100) + '%';

    // Actualizar barra de progreso
    const progressFill = document.getElementById(`bagProgress${bagId}`);
    progressFill.style.width = (bagInfo.percent * 100) + '%';
    
    progressFill.classList.remove('warning', 'danger');
    if (bagInfo.percent > 0.9) {
        progressFill.classList.add('danger');
    } else if (bagInfo.percent > 0.75) {
        progressFill.classList.add('warning');
    }

    // Renderizar productos en la bolsa
    renderBagProducts(bagId);
}

/**
 * FUNCIÓN: Calcular el centroide (centro real) de un producto
 * Útil para posicionar el emoji correctamente en formas irregulares (como L)
 */
function calculateProductCentroid(cells) {
    if (cells.length === 0) return { x: 0, y: 0 };
    
    const totalX = cells.reduce((sum, cell) => sum + cell.x, 0);
    const totalY = cells.reduce((sum, cell) => sum + cell.y, 0);
    
    return {
        x: totalX / cells.length,
        y: totalY / cells.length
    };
}

/**
 * FUNCIÓN: Renderizar productos dentro de una bolsa
 */
function renderBagProducts(bagId) {
    const state = getState();
    const bag = state.bags[bagId];
    const grid = document.querySelector(`.bag-grid[data-bag-id="${bagId}"]`);

    grid.querySelectorAll('.placed-product').forEach(el => el.remove());

    bag.products.forEach(item => {
        const div = document.createElement('div');
        div.className = 'placed-product';
        div.dataset.instanceId = item.instanceId;
        div.dataset.bagId = bagId;
        div.style.background = item.product.color;

        // Calcular bounding box SOLO con las celdas ocupadas
        const minX = Math.min(...item.cells.map(c => c.x));
        const maxX = Math.max(...item.cells.map(c => c.x));
        const minY = Math.min(...item.cells.map(c => c.y));
        const maxY = Math.max(...item.cells.map(c => c.y));

        const cellWidth = 100 / CONFIG.BAG_GRID_SIZE;
        const cellHeight = 100 / CONFIG.BAG_GRID_SIZE;

        // Posición y tamaño del bounding box
        div.style.left = `${minX * cellWidth}%`;
        div.style.top = `${minY * cellHeight}%`;
        div.style.width = `${(maxX - minX + 1) * cellWidth}%`;
        div.style.height = `${(maxY - minY + 1) * cellHeight}%`;

        // Calcular centroide para posicionar el emoji correctamente
        const centroid = calculateProductCentroid(item.cells);
        
        // Calcular el offset del centroide respecto al bounding box (en porcentaje)
        const centerOffsetX = (centroid.x - minX + 0.5) * cellWidth;
        const centerOffsetY = (centroid.y - minY + 0.5) * cellHeight;

        // Crear elemento para el emoji posicionado en el centroide real
        const emoji = document.createElement('span');
        emoji.className = 'placed-emoji';
        const area = item.cells.length;
        emoji.style.fontSize = (2 + area * 0.5) + 'rem';
        emoji.style.position = 'absolute';
        emoji.style.left = centerOffsetX + '%';
        emoji.style.top = centerOffsetY + '%';
        emoji.style.transform = 'translate(-50%, -50%)';
        emoji.textContent = item.product.type.emoji;

        div.appendChild(emoji);

        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            removeProductFromBag(bagId, item.instanceId);
            updateUI();
        });

        grid.appendChild(div);
    });
}

/**
 * FUNCIÓN: Actualizar estado de botones
 */
function updateButtons() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = !canCheckoutCustomer();
}

/**
 * FUNCIÓN: Mostrar mensaje toast (notificación temporal)
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * FUNCIÓN: Crear preview del producto mientras arrastras
 */
function createDragPreview(product) {
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    updateDragPreviewContent(preview, product);
    document.body.appendChild(preview);
    return preview;
}

/**
 * FUNCIÓN: Actualizar contenido del preview de arrastre
 */
function updateDragPreviewContent(preview, product) {
    const shape = getRotatedShape(product.type, product.rotation);
    const rows = shape.length;
    const cols = shape[0].length;

    preview.innerHTML = `<div class="drag-shape" style="grid-template-columns: repeat(${cols}, 32px); background: ${product.color};">
        ${shape.flat().map(cell => `<div class="drag-cell ${cell ? 'active' : ''}"></div>`).join('')}
    </div>`;
}

/**
 * FUNCIÓN: Actualizar posición del preview
 */
function updateDragPreviewPosition(preview, x, y) {
    preview.style.left = x + 'px';
    preview.style.top = y + 'px';
}

/**
 * FUNCIÓN: Limpiar preview de arrastre
 */
function removeDragPreview(preview) {
    if (preview) {
        preview.remove();
    }
}

/**
 * FUNCIÓN: Resaltar celdas válidas/inválidas durante arrastre
 */
function highlightCells(bagId, cells, isValid) {
    const grid = document.querySelector(`.bag-grid[data-bag-id="${bagId}"]`);
    cells.forEach(cell => {
        const cellEl = grid.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`);
        if (cellEl) {
            cellEl.classList.add(isValid ? 'hover-valid' : 'hover-invalid');
        }
    });
}

/**
 * FUNCIÓN: Limpiar resaltado de celdas
 */
function clearCellHighlights() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('hover-valid', 'hover-invalid');
    });
}
