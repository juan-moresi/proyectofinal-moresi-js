/**
 * KeyboardManager.js
 * Maneja los eventos del teclado para la aplicación
 */

class KeyboardManager {
    constructor() {
        this.initKeyboardEvents();
    }

    /**
     * Inicializa los eventos del teclado
     */
    initKeyboardEvents() {
        // Prevenir el comportamiento predeterminado de la tecla Escape
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Maneja el evento keydown
     * @param {KeyboardEvent} event - El evento de teclado
     */
    handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            return false;
        }
    }
}

// Crear una instancia del KeyboardManager cuando se carga el script
const keyboardManager = new KeyboardManager();

export default KeyboardManager;