/**
 * products.js
 * ===========
 * Definición de todos los productos del juego
 * 
 * Cada producto tiene:
 * - id: identificador único
 * - name: nombre en español
 * - emoji: cómo se ve
 * - weight: cuánto pesa (kg)
 * - shape: qué celdas ocupa en la bolsa
 */

const PRODUCT_TYPES = [
    {
        id: 'leche',
        name: 'leche',
        emoji: '🥛',
        weight: 1,
        // Shape: 1 celda (1x1)
        // [1] significa "hay producto aquí"
        shape: [[1, 1]]
    },
    {
        id: 'sandia',
        name: 'sandía',
        emoji: '🍉',
        weight: 3,
        // Shape: 2x2 (ocupa 4 celdas)
        shape: [[1, 1], [1, 1]]
    },
    {
        id: 'huevos',
        name: 'huevos',
        emoji: '🥚',
        weight: 1,
        // Shape: 2x2
        shape: [[1, 1], [1, 1]]
    },
    {
        id: 'pan',
        name: 'pan',
        emoji: '🍞',
        weight: 1,
        // Shape: 1x3 (fila horizontal)
        shape: [[1, 1, 1]]
    },
    {
        id: 'manzana',
        name: 'manzana',
        emoji: '🍎',
        weight: 1,
        // Shape: 1x1 (muy pequeño)
        shape: [[1]]
    },
    {
        id: 'zumo',
        name: 'zumo',
        emoji: '🧃',
        weight: 2,
        // Shape: 2x1 (vertical)
        shape: [[1], [1]]
    },
    {
        id: 'queso',
        name: 'queso',
        emoji: '🧀',
        weight: 2,
        // Shape: 1x2
        shape: [[1, 1]]
    },
    {
        id: 'pollo',
        name: 'pollo',
        emoji: '🍗',
        weight: 3,
        // Shape: L-shape (forma especial)
        //   [1][0]
        //   [1][1]
        shape: [[1, 0], [1, 1]]
    }
];

/**
 * COLORES de los productos
 * Cada producto puede tener un color diferente
 * Se asignan cíclicamente (el primero usa color 1, segundo color 2, etc)
 */
const PRODUCT_COLORS = [
    'rgba(74, 222, 128, 0.4)',    // Verde
    'rgba(34, 211, 238, 0.4)',    // Cian
    'rgba(251, 191, 36, 0.4)',    // Amarillo
    'rgba(248, 113, 113, 0.4)',   // Rojo
    'rgba(167, 139, 250, 0.4)',   // Púrpura
    'rgba(244, 114, 182, 0.4)',   // Rosa
    'rgba(96, 165, 250, 0.4)',    // Azul
    'rgba(251, 146, 60, 0.4)'     // Naranja
];

/**
 * FORMAS especiales (Tetris-like)
 * Si quieres usar solo algunas formas, aquí puedes crearlas
 */
const SHAPES = {
    SINGLE: [[1]],
    HORIZONTAL_2: [[1, 1]],
    HORIZONTAL_3: [[1, 1, 1]],
    VERTICAL_2: [[1], [1]],
    VERTICAL_3: [[1], [1], [1]],
    SQUARE_2x2: [[1, 1], [1, 1]],
    L_SHAPE: [[1, 0], [1, 1]],
    T_SHAPE: [[1, 1, 1], [0, 1, 0]],
};