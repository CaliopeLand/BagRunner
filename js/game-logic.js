/**
 * game-logic.js
 * =============
 * LÓGICA DEL JUEGO
 * 
 * Aquí están las REGLAS y CÁLCULOS del juego.
 * Por ejemplo:
 * - ¿Puede colocarse un producto aquí?
 * - ¿Cómo rotamos una forma?
 * - ¿Colisiona con algo?
 * 
 * IMPORTANTE: Estas funciones NO modifican el estado directamente.
 * Devuelven información que usa state.js o ui.js
 */

/**
 * FUNCIÓN: Rotar una forma 90 grados
 * 
 * Ejemplo:
 * [[1, 0]]        [[1],
 *  [1, 1]]  --->   [0],
 *                  [1]]
 * 
 * Esto es rotación en sentido antihorario
 */
function rotateShape(shape, times = 1) {
    let result = shape;
    for (let i = 0; i < times; i++) {
        const rows = result.length;
        const cols = result[0].length;
        
        // Crear nueva matriz rotada
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = result[y][x];
            }
        }
        result = rotated;
    }
    return result;
}

/**
 * FUNCIÓN: Obtener la forma de un producto considerando rotación
 */
function getRotatedShape(productType, rotation) {
    return rotateShape(productType.shape, rotation);
}

/**
 * FUNCIÓN: Validar si un producto PUEDE colocarse en una bolsa
 * 
 * Devuelve:
 * - true si cabe
 * - false si NO cabe (peso excedido, colisión, o sale del grid)
 */
function canPlaceProduct(bagId, startX, startY, shape, productWeight) {
    const state = getState();
    const bag = state.bags[bagId];

    // ========== VALIDACIÓN 1: ¿Hay peso suficiente? ==========
    if (bag.weight + productWeight > CONFIG.BAG_WEIGHT_MAX) {
        return false;
    }

    // ========== VALIDACIÓN 2: ¿Cabe en el grid? ==========
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {  // Si esta celda tiene producto
                const gridX = startX + x;
                const gridY = startY + y;

                // ¿Sale del grid?
                if (gridX >= CONFIG.BAG_GRID_SIZE || gridY >= CONFIG.BAG_GRID_SIZE) {
                    return false;
                }

                // ¿Hay colisión con otro producto?
                if (bag.grid[gridY][gridX] !== null) {
                    return false;
                }
            }
        }
    }

    // ¡Todo validado! Puede colocarse
    return true;
}

/**
 * FUNCIÓN: Obtener las celdas que ocuparía un producto
 * Útil para resaltar en la UI mientras arrastras
 */
function getProductCells(startX, startY, shape) {
    const cells = [];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                cells.push({
                    x: startX + x,
                    y: startY + y
                });
            }
        }
    }
    return cells;
}

/**
 * FUNCIÓN: Calcular bounding box de un producto
 * (el rectángulo más pequeño que lo contiene)
 */
function getProductBoundingBox(cells) {
    if (cells.length === 0) return null;

    const xs = cells.map(c => c.x);
    const ys = cells.map(c => c.y);

    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
        width: Math.max(...xs) - Math.min(...xs) + 1,
        height: Math.max(...ys) - Math.min(...ys) + 1
    };
}

/**
 * FUNCIÓN: Verificar si el cliente puede ser cobrado
 * (Si la capacidad total es >= 80%)
 */
function canCheckoutCustomer() {
    return getTotalCapacityInfo().canCheckout;
}

/**
 * FUNCIÓN: Obtener porcentaje de una bolsa
 */
function getBagCapacityPercent(bagId) {
    return getBagInfo(bagId).percent * 100;
}

/**
 * FUNCIÓN: Obtener porcentaje total
 */
function getTotalCapacityPercent() {
    return getTotalCapacityInfo().percent * 100;
}

/**
 * FUNCIÓN: Validar si un producto ya fue usado
 */
function isProductUsed(productIdx) {
    const state = getState();
    return state.products[productIdx]?.used || false;
}

/**
 * FUNCIÓN: Contar cuántos productos quedan sin usar
 */
function countUnusedProducts() {
    const state = getState();
    return state.products.filter(p => !p.used).length;
}

/**
 * FUNCIÓN: Verificar si todos los productos fueron colocados
 */
function allProductsPlaced() {
    return countUnusedProducts() === 0;
}