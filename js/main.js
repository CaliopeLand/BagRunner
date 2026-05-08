/**
 * main.js
 * =======
 * PUNTO DE ENTRADA
 * 
 * Aquí se orquesta todo:
 * 1. Se carga la configuración
 * 2. Se crea el estado inicial
 * 3. Se configura la UI
 * 4. Se inician los event listeners
 */

console.log('🎮 BagRunner v1.0 (Modularizado)');

/**
 * FUNCIÓN: Inicializar juego
 */
function init() {
    console.log('📋 Inicializando estado...');
    createBags();
    generateNewCustomer();

   console.log('🎨 Renderizando UI...');
renderBags();
updateUI();

    console.log('⌨️ Configurando event listeners...');
    setupEventListeners();

    console.log('✅ Juego listo!');
    console.log(`📦 CONFIG: ${CONFIG.BAG_COUNT} bolsas, ${CONFIG.BAG_WEIGHT_MAX}kg max, ${CONFIG.PRODUCTS_PER_CUSTOMER} productos/cliente`);
}

// Iniciar cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
