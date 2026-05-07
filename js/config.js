/**
 * config.js
 * =========
 * Configuración central del juego
 * 
 * AQUÍ van todos los números que controlan cómo funciona BagRunner
 * Si quieres cambiar la dificultad, el tamaño, etc → CAMBIA AQUÍ
 */

const CONFIG = {
    // Bolsas
    BAG_COUNT: 2,              // Cuántas bolsas tiene el jugador
    BAG_WEIGHT_MAX: 6,         // Peso máximo por bolsa (kg)
    BAG_GRID_SIZE: 4,          // Tamaño del grid: 4x4 = 16 celdas por bolsa

    // Productos
    PRODUCTS_PER_CUSTOMER: 8,   // Cuántos productos genera cada cliente

    // UI
    CHECKOUT_MIN_CAPACITY: 0.8, // Porcentaje mínimo para poder cobrar (80%)
    CONFIRM_ON_NEW_CLIENT: true // Pedir confirmación si hay bolsas con productos
};

/**
 * COLORES (tema del juego)
 * Si quieres cambiar los colores (modo oscuro/claro), cambialos aquí
 */
const THEME = {
    bg: '#1a1a1a',
    panel: '#222222',
    panel2: '#2a2a2a',
    text: '#e8e8e8',
    textDim: '#a0a0a0',
    accent: '#4ade80',
    warning: '#facc15',
    danger: '#f87171',
    border: '#3a3a3a',
    gridLine: 'rgba(255,255,255,0.08)',
    shadow: '0 8px 24px rgba(0,0,0,0.4)'
};

/**
 * PUNTOS (Sistema de puntuación)
 * Cómo se calcula la puntuación del jugador
 */
const SCORING = {
    POINTS_PER_CLIENT: 10,      // Puntos base por cliente
    BONUS_HIGH_CAPACITY: 5,     // Bonus si usas > 90% capacidad
    BONUS_PERFECT_PACK: 10      // Bonus si empaças perfectamente
};