/**
 * input.js
 * ========
 * EVENT LISTENERS (Qué pasa cuando el usuario interactúa)
 * 
 * Aquí están todos los event listeners:
 * - Drag and drop
 * - Clicks
 * - Teclas
 */

let dragState = {
    draggingProduct: null,
    dragPreview: null,
    currentBagId: null
};

/**
 * FUNCIÓN: Setup de todos los event listeners
 * Se llama una sola vez al inicio
 */
function setupEventListeners() {
    // Tecla R para rotar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            const state = getState();
            if (state.selectedProduct !== null) {
                rotateProduct(state.selectedProduct);
                updateUI();
            }
        }
    });

    // Click en grid cells (drop)
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
    });

    // Botones
    document.getElementById('newClientBtn').addEventListener('click', handleNewClient);
    document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
}

/**
 * FUNCIÓN: Inicio de arrastre (drag start)
 */
function handleDragStart(e, productIdx) {
    const state = getState();
    if (state.products[productIdx].used) return;

    dragState.draggingProduct = productIdx;
    selectProduct(productIdx);

    const product = state.products[productIdx];
    const card = e.target.closest('.product-card');
    card.classList.add('dragging');

    dragState.dragPreview = createDragPreview(product);
    document.addEventListener('dragover', handleGlobalDragOver);
}

/**
 * FUNCIÓN: Fin de arrastre (drag end)
 */
function handleDragEnd(e) {
    const card = e.target.closest('.product-card');
    if (card) card.classList.remove('dragging');

    removeDragPreview(dragState.dragPreview);
    dragState.dragPreview = null;
    dragState.draggingProduct = null;
    dragState.currentBagId = null;
    clearCellHighlights();
    document.removeEventListener('dragover', handleGlobalDragOver);
}
/**
 * TOUCH: inicio de arrastre
 */
function handleTouchStart(e, idx) {
    e.preventDefault();
    const state = getState();
    if (state.products[idx].used) return;

    selectProduct(idx);
    setState({ draggingProduct: idx });

    const product = state.products[idx];
    const preview = createDragPreview(product);
    setState({ dragPreview: preview });

    const touch = e.touches[0];
    updateDragPreviewPosition(preview, touch.clientX - 40, touch.clientY - 40);
}

/**
 * TOUCH: mover
 */
function handleTouchMove(e) {
    const state = getState();
    if (state.draggingProduct === null ||!state.dragPreview) return;

    e.preventDefault();
    const touch = e.touches[0];
    updateDragPreviewPosition(state.dragPreview, touch.clientX - 40, touch.clientY - 40);

    // Detectar sobre qué celda estamos
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    clearCellHighlights();

    if (elementBelow && elementBelow.classList.contains('grid-cell')) {
        const bagId = parseInt(elementBelow.dataset.bagId);
        const x = parseInt(elementBelow.dataset.x);
        const y = parseInt(elementBelow.dataset.y);
        const product = state.products[state.draggingProduct];
        const shape = getRotatedShape(product.type, product.rotation);

        const cells = getCellsForPlacement(x, y, shape);
        const isValid = canPlaceProduct(bagId, x, y, shape);
        highlightCells(bagId, cells, isValid);
    }
}

/**
 * TOUCH: soltar
 */
function handleTouchEnd(e) {
    const state = getState();
    if (state.draggingProduct === null) return;

    e.preventDefault();
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

    clearCellHighlights();
    removeDragPreview(state.dragPreview);

    if (elementBelow && elementBelow.classList.contains('grid-cell')) {
        const bagId = parseInt(elementBelow.dataset.bagId);
        const x = parseInt(elementBelow.dataset.x);
        const y = parseInt(elementBelow.dataset.y);
        const productIdx = state.draggingProduct;
        const product = state.products[productIdx];
        const shape = getRotatedShape(product.type, product.rotation);

        if (canPlaceProduct(bagId, x, y, shape)) {
            placeProductInBag(productIdx, bagId, x, y, shape);
            updateUI();
        }
    }

    setState({ draggingProduct: null, dragPreview: null, selectedProduct: null });
}

/**
 * FUNCIÓN: Movimiento del mouse durante arrastre (global)
 */
function handleGlobalDragOver(e) {
    if (dragState.dragPreview) {
        updateDragPreviewPosition(dragState.dragPreview, e.clientX, e.clientY);
    }
}

/**
 * FUNCIÓN: Dragover en una celda
 */
function handleDragOver(e) {
    e.preventDefault();
    if (dragState.draggingProduct === null) return;

    const cell = e.target.closest('.grid-cell');
    if (!cell) return;

    const bagId = parseInt(cell.dataset.bagId);
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    const state = getState();
    const product = state.products[dragState.draggingProduct];
    const shape = getRotatedShape(product.type, product.rotation);

    clearCellHighlights();
    const cells = getProductCells(x, y, shape);
    const canPlace = canPlaceProduct(bagId, x, y, shape, product.type.weight);

    highlightCells(bagId, cells, canPlace);
    dragState.currentBagId = bagId;
}

/**
 * FUNCIÓN: Dragleave (salir de una celda)
 */
function handleDragLeave(e) {
    clearCellHighlights();
}

/**
 * FUNCIÓN: Drop (soltar producto)
 */
function handleDrop(e) {
    e.preventDefault();
    if (dragState.draggingProduct === null) return;

    const cell = e.target.closest('.grid-cell');
    if (!cell) return;

    const bagId = parseInt(cell.dataset.bagId);
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    const state = getState();
    const productIdx = dragState.draggingProduct;
    const product = state.products[productIdx];
    const shape = getRotatedShape(product.type, product.rotation);

    if (canPlaceProduct(bagId, x, y, shape, product.type.weight)) {
        placeProductInBag(productIdx, bagId, x, y, shape);
        showToast(`✅ ${product.type.name} colocado!`);
    } else {
        showToast('❌ No cabe aquí');
    }

    updateUI();
    clearCellHighlights();
}

/**
 * FUNCIÓN: Nuevo cliente
 */
function handleNewClient() {
    const state = getState();
    if (state.bags.some(b => b.products.length > 0)) {
        if (!confirm('¿Reiniciar bolsas y generar nuevo cliente?')) return;
    }
    resetBags();
    generateNewCustomer();
    updateUI();
    showToast('🎉 Nuevo cliente generado');
}

/**
 * FUNCIÓN: Cobrar cliente
 */
function handleCheckout() {
    if (!canCheckoutCustomer()) {
        showToast('❌ Usa al menos 80% de capacidad');
        return;
    }

    checkoutCustomer();
    resetBags();
    generateNewCustomer();
    updateUI();
    showToast('💰 Cliente cobrado!');
}

/**
 * FUNCIÓN: Reiniciar bolsas
 */
function handleReset() {
    if (!confirm('¿Vaciar todas las bolsas?')) return;
    resetBags();
    updateUI();
    showToast('🔄 Bolsas reiniciadas');
}
