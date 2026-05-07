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

        // Calcular bounding box
        const minX = Math.min(...item.cells.map(c => c.x));
        const maxX = Math.max(...item.cells.map(c => c.x));
        const minY = Math.min(...item.cells.map(c => c.y));
        const maxY = Math.max(...item.cells.map(c => c.y));

        const cellWidth = 100 / CONFIG.BAG_GRID_SIZE;
        const cellHeight = 100 / CONFIG.BAG_GRID_SIZE;

        div.style.left = `${minX * cellWidth}%`;
        div.style.top = `${minY * cellHeight}%`;
        div.style.width = `${(maxX - minX + 1) * cellWidth}%`;
        div.style.height = `${(maxY - minY + 1) * cellHeight}%`;

        // Emoji centrado
        const area = item.cells.length;
        div.innerHTML = `<span class="placed-emoji" style="font-size: ${2 + area * 0.5}rem;">${item.product.type.emoji}</span>`;

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