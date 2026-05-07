/**
 * state.js
 * ========
 * ESTADO GLOBAL DEL JUEGO
 * 
 * Aquí está toda la INFORMACIÓN del juego:
 * - Qué cliente está jugando
 * - Qué productos hay disponibles
 * - Cómo están llenas las bolsas
 * - Puntuación
 * 
 * IMPORTANTE: El estado NUNCA se modifica directamente.
 * SIEMPRE usamos funciones como setState() o updateBag()
 */

let gameState = {
    // ==================== CLIENTE ====================
    clientsServed: 0,       // Cuántos clientes hemos atendido
    points: 0,              // Puntos totales acumulados
    
    // ==================== PRODUCTOS ====================
    products: [],           // Array de productos disponibles del cliente actual
                            // Cada uno: { instanceId, type, rotation, used, color }
    
    // ==================== BOLSAS ====================
    bags: [],               // Array de bolsas
                            // Cada bolsa: { id, weight, grid, products }
    
    // ==================== UI STATE ====================
    selectedProduct: null,  // Índice del producto seleccionado (o null)
    draggingProduct: null,  // Índice del producto que estamos arrastrando
    dragPreview: null,      // Elemento DOM del preview mientras arrastramos
    
    // ==================== CAPACIDAD ====================
    totalCapacity: CONFIG.BAG_COUNT * CONFIG.BAG_WEIGHT_MAX  // Peso máximo total
};

/**
 * FUNCIÓN: Obtener el estado actual
 * Uso: const current = getState();
 */
function getState() {
    return gameState;
}

/**
 * FUNCIÓN: Reemplazar todo el estado
 * Uso: setState({ ...newState });
 * CUIDADO: Reemplaza TODO, úsalo solo en init
 */
function setState(newState) {
    gameState = { ...gameState, ...newState };
}

/**
 * FUNCIÓN: Crear bolsas vacías
 * Se llama al inicio y cuando presionas "Reiniciar bolsas"
 */
function createBags() {
    const bags = [];
    for (let i = 0; i < CONFIG.BAG_COUNT; i++) {
        bags.push({
            id: i,
            weight: 0,
            grid: Array(CONFIG.BAG_GRID_SIZE).fill(null).map(() =>
                Array(CONFIG.BAG_GRID_SIZE).fill(null)
            ),
            products: []
        });
    }
    gameState.bags = bags;
}

/**
 * FUNCIÓN: Generar nuevo cliente
 * Crea 8 productos aleatorios
 */
function generateNewCustomer() {
    gameState.products = [];
    gameState.selectedProduct = null;

    for (let i = 0; i < CONFIG.PRODUCTS_PER_CUSTOMER; i++) {
        const typeIndex = Math.floor(Math.random() * PRODUCT_TYPES.length);
        const type = PRODUCT_TYPES[typeIndex];

        gameState.products.push({
            instanceId: `${type.id}_${Date.now()}_${i}`,
            type: type,
            rotation: 0,
            used: false,
            color: PRODUCT_COLORS[i % PRODUCT_COLORS.length]
        });
    }
}

/**
 * FUNCIÓN: Colocar un producto en una bolsa
 * Se llama desde game-logic.js cuando el usuario suelta el producto
 */
function placeProductInBag(productIdx, bagId, startX, startY, shape) {
    const product = gameState.products[productIdx];
    const bag = gameState.bags[bagId];

    // Marcar producto como usado
    product.used = true;

    // Actualizar el grid de la bolsa
    const cells = [];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const gridX = startX + x;
                const gridY = startY + y;
                bag.grid[gridY][gridX] = product.instanceId;
                cells.push({ x: gridX, y: gridY });
            }
        }
    }

    // Actualizar peso de la bolsa
    bag.weight += product.type.weight;

    // Guardar producto en la bolsa (para renderizar después)
    bag.products.push({
        instanceId: product.instanceId,
        product: product,
        cells: cells,
        shape: shape,
        startX: startX,
        startY: startY
    });
}

/**
 * FUNCIÓN: Quitar un producto de una bolsa
 * Se llama cuando haces click derecho en un producto
 */
function removeProductFromBag(bagId, instanceId) {
    const bag = gameState.bags[bagId];
    const productInBag = bag.products.find(p => p.instanceId === instanceId);

    if (!productInBag) return;

    // Limpiar grid
    productInBag.cells.forEach(cell => {
        bag.grid[cell.y][cell.x] = null;
    });

    // Actualizar peso
    bag.weight -= productInBag.product.type.weight;

    // Eliminar de la bolsa
    bag.products = bag.products.filter(p => p.instanceId !== instanceId);

    // Marcar producto como NO usado (puede arrastrarse de nuevo)
    const productInList = gameState.products.find(p => p.instanceId === instanceId);
    if (productInList) {
        productInList.used = false;
    }
}

/**
 * FUNCIÓN: Vaciar todas las bolsas
 * Se llama cuando presionas "Reiniciar bolsas"
 */
function resetBags() {
    createBags();
    gameState.products.forEach(p => p.used = false);
}

/**
 * FUNCIÓN: Cobrar al cliente
 * Se llama cuando presionas "Cobrar al cliente"
 * Calcula puntos y pasa al siguiente cliente
 */
function checkoutCustomer() {
    // Calcular puntos
    const totalWeight = gameState.bags.reduce((sum, bag) => sum + bag.weight, 0);
    const usagePercent = totalWeight / gameState.totalCapacity;

    let points = CONFIG.SCORING.POINTS_PER_CLIENT;
    if (usagePercent > 0.9) points += CONFIG.SCORING.BONUS_HIGH_CAPACITY;

    gameState.points += points;
    gameState.clientsServed += 1;

    console.log(`🎉 Cliente atendido! +${points} puntos`);
}

/**
 * FUNCIÓN: Obtener información de una bolsa
 * Útil para calcular porcentaje, etc
 */
function getBagInfo(bagId) {
    const bag = gameState.bags[bagId];
    return {
        weight: bag.weight,
        maxWeight: CONFIG.BAG_WEIGHT_MAX,
        percent: bag.weight / CONFIG.BAG_WEIGHT_MAX,
        isFull: bag.weight >= CONFIG.BAG_WEIGHT_MAX
    };
}

/**
 * FUNCIÓN: Obtener información de capacidad total
 */
function getTotalCapacityInfo() {
    const totalWeight = gameState.bags.reduce((sum, bag) => sum + bag.weight, 0);
    return {
        weight: totalWeight,
        maxWeight: gameState.totalCapacity,
        percent: totalWeight / gameState.totalCapacity,
        canCheckout: totalWeight / gameState.totalCapacity >= CONFIG.CHECKOUT_MIN_CAPACITY
    };
}

/**
 * FUNCIÓN: Seleccionar producto
 */
function selectProduct(idx) {
    gameState.selectedProduct = idx;
}

/**
 * FUNCIÓN: Rotar producto
 */
function rotateProduct(idx) {
    if (gameState.products[idx] && !gameState.products[idx].used) {
        gameState.products[idx].rotation = (gameState.products[idx].rotation + 1) % 4;
    }
}