// Change this line to correctly point to the ChatBot in the app folder
import ChatBot from './app/ChatBot.js';

// Create a single chatbot instance
let chatbot;

// Asegurarse de que currency esté disponible
let currencyFunc;

// Verificar si currency está disponible globalmente (desde el script en HTML)
if (typeof window.currency !== 'undefined') {
    currencyFunc = window.currency;
} else {
    // Definir una función de respaldo simple si currency.js no está disponible
    currencyFunc = function(amount) {
        const value = parseFloat(amount);
        return {
            value: value,
            divide: function(divisor) { return currencyFunc(value / divisor); },
            multiply: function(multiplier) { return currencyFunc(value * multiplier); },
            format: function() { return value.toFixed(2); }
        };
    };
    console.warn('La biblioteca currency.js no está disponible. Usando implementación de respaldo.');
}

// Configuración de tasas de cambio (estas deberían actualizarse con una API real)
const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    ARS: 850,
    BRL: 5.02,
    GBP: 0.79
};

// Función para convertir monedas
function convertCurrency(amount, fromCurrency, toCurrency) {
    try {
        const amountInUSD = currencyFunc(amount).divide(exchangeRates[fromCurrency]);
        return currencyFunc(amountInUSD).multiply(exchangeRates[toCurrency]).value;
    } catch (error) {
        console.error('Error en la conversión:', error);
        return null;
    }
}

// Función para formatear moneda
function formatCurrency(amount, currencyCode) {
    return currencyFunc(amount, {
        symbol: getCurrencySymbol(currencyCode),
        precision: 2
    }).format();
}

// Función para obtener el símbolo de la moneda
function getCurrencySymbol(currencyCode) {
    const symbols = {
        USD: '$',
        EUR: '€',
        ARS: 'AR$',
        BRL: 'R$',
        GBP: '£'
    };
    return symbols[currencyCode] || currencyCode;
}

// Panel Management
class PanelManager {
    static showPanel(panel) {
        if (!panel) return;
        const overlay = document.querySelector('.panel-overlay');
        if (overlay) {
            overlay.classList.add('show');
            panel.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.updateButtonStates(panel);
        }
    }

    static hidePanel(panel) {
        if (!panel) return;
        const overlay = document.querySelector('.panel-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            panel.classList.remove('show');
            document.body.style.overflow = '';
            this.resetButtonStates();
        }
    }

    static hideAllPanels() {
        const panels = document.querySelectorAll('.history-panel, .currencies-panel, .currency-form-panel');
        panels.forEach(panel => {
            if (panel) this.hidePanel(panel);
        });
        this.resetButtonStates();
    }

    static updateButtonStates(panel) {
        const historyBtn = document.getElementById('historyBtn');
        const showCurrenciesBtn = document.getElementById('showCurrenciesBtn');
        const addCurrencyBtn = document.getElementById('addCurrencyBtn');

        if (panel.classList.contains('currency-form-panel')) {
            if (historyBtn) historyBtn.disabled = true;
            if (showCurrenciesBtn) showCurrenciesBtn.disabled = true;
            if (addCurrencyBtn) addCurrencyBtn.disabled = false;
        } else if (panel.classList.contains('currencies-panel') || panel.classList.contains('history-panel')) {
            if (historyBtn) historyBtn.disabled = false;
            if (showCurrenciesBtn) showCurrenciesBtn.disabled = false;
            if (addCurrencyBtn) addCurrencyBtn.disabled = true;
        }
    }

    static resetButtonStates() {
        const historyBtn = document.getElementById('historyBtn');
        const showCurrenciesBtn = document.getElementById('showCurrenciesBtn');
        const addCurrencyBtn = document.getElementById('addCurrencyBtn');

        if (historyBtn) historyBtn.disabled = false;
        if (showCurrenciesBtn) showCurrenciesBtn.disabled = false;
        if (addCurrencyBtn) addCurrencyBtn.disabled = false;
    }
}

// Function to close all panels
function closeAllPanels() {
    PanelManager.hideAllPanels();
}

// Function to clear form errors
function clearFormErrors() {
    ['nameError', 'codeError', 'rateError'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '';
    });
}

// Function to reset currency form
function resetCurrencyForm() {
    const currencyForm = document.getElementById('currencyForm');
    if (currencyForm) currencyForm.reset();
    clearFormErrors();
}

// Function to handle user message submission
function handleUserMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message) {
        chatbot.addMessage(message, 'user');
        chatbot.handleInput(message);
        userInput.value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize chatbot
    chatbot = new ChatBot();
    
    // Disable utility buttons initially if no username is stored
    if (!localStorage.getItem('nombreUsuario')) {
        document.querySelectorAll('.utility-buttons button').forEach(button => {
            button.disabled = true;
        });
    }
    
    // Set up chat input functionality
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    
    // Set up send button
    if (sendBtn) {
        sendBtn.addEventListener('click', handleUserMessage);
    }
    
    // Set up enter key press
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserMessage();
            }
        });
    }
    
    // Set up mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const utilityButtons = document.querySelector('.utility-buttons');
    
    if (mobileMenuToggle && mobileMenuOverlay && utilityButtons) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            utilityButtons.classList.toggle('active');
        });
        
        mobileMenuOverlay.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            utilityButtons.classList.remove('active');
        });
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'panel-overlay';
    document.body.appendChild(overlay);
    
    // Set up panel buttons
    const buttonActions = {
        'historyBtn': () => {
            chatbot.showHistory();
            // Bloquear el botón de agregar moneda
            document.getElementById('addCurrencyBtn').disabled = true;
        },
        'showCurrenciesBtn': () => {
            chatbot.showCurrencies();
            // Bloquear el botón de agregar moneda
            document.getElementById('addCurrencyBtn').disabled = true;
        },
        'addCurrencyBtn': () => {
            const currencyFormPanel = document.querySelector('.currency-form-panel');
            if (currencyFormPanel) {
                PanelManager.hideAllPanels();
                PanelManager.showPanel(currencyFormPanel);
                // Bloquear los otros botones
                document.getElementById('historyBtn').disabled = true;
                document.getElementById('showCurrenciesBtn').disabled = true;
            }
        }
    };
    
    // Add event listeners to all buttons
    Object.entries(buttonActions).forEach(([id, action]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                PanelManager.hideAllPanels();
                action();
            });
        }
    });
    
    // Set up close buttons
    const closeButtons = [
        { selector: '.close-history-btn', resetForm: false },
        { selector: '.close-currencies', resetForm: false }
    ];
    
    closeButtons.forEach(btn => {
        document.addEventListener('click', (e) => {
            if (e.target.matches(btn.selector)) {
                const panel = e.target.closest('.history-panel, .currencies-panel, .currency-form-panel');
                if (panel) {
                    PanelManager.hidePanel(panel);
                    if (btn.resetForm) {
                        resetCurrencyForm();
                    }
                    // Desbloquear los botones según el panel que se cierra
                    if (panel.classList.contains('currency-form-panel')) {
                        document.getElementById('historyBtn').disabled = false;
                        document.getElementById('showCurrenciesBtn').disabled = false;
                    } else if (panel.classList.contains('currencies-panel') || panel.classList.contains('history-panel')) {
                        document.getElementById('addCurrencyBtn').disabled = false;
                    }
                }
            }
        });
    });
    
    // Set up cancel button
    const cancelCurrencyBtn = document.getElementById('cancelCurrency');
    if (cancelCurrencyBtn) {
        cancelCurrencyBtn.addEventListener('click', () => {
            const panel = document.querySelector('.currency-form-panel');
            if (panel) {
                PanelManager.hidePanel(panel);
                resetCurrencyForm();
                // Restaurar todos los botones usando PanelManager
                PanelManager.resetButtonStates();
            }
        });
    }
    
    // Set up currency form submission
    const currencyForm = document.getElementById('currencyForm');
    if (currencyForm) {
        currencyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors();
            
            const nombre = document.getElementById('currencyName').value.trim();
            const codigo = document.getElementById('currencyCode').value.trim();
            const tasa = document.getElementById('currencyRate').value;
            
            let isValid = true;
            const validationRules = [
                { id: 'nameError', condition: !nombre, message: 'El nombre es obligatorio' },
                { id: 'codeError', condition: !codigo, message: 'El código es obligatorio' },
                { id: 'codeError', condition: codigo.length !== 3, message: 'El código debe tener exactamente 3 letras' },
                { id: 'rateError', condition: !tasa, message: 'La tasa es obligatoria' },
                { id: 'rateError', condition: parseFloat(tasa) <= 0, message: 'La tasa debe ser un número positivo' }
            ];
            
            validationRules.forEach(rule => {
                if (rule.condition) {
                    document.getElementById(rule.id).textContent = rule.message;
                    isValid = false;
                }
            });
            
            if (isValid) {
                const success = chatbot.addCurrencyFromForm(nombre, codigo, tasa);
                
                if (success) {
                    PanelManager.hideAllPanels();
                    resetCurrencyForm();
                    // Restaurar todos los botones usando PanelManager
                    PanelManager.resetButtonStates();
                }
            }
        });
    }

    // Close on overlay click
    overlay.addEventListener('click', () => {
        PanelManager.hideAllPanels();
        // Restaurar todos los botones usando PanelManager
        PanelManager.resetButtonStates();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const currencyFormPanel = document.querySelector('.currency-form-panel');
            const currenciesPanel = document.querySelector('.currencies-panel');
            const historyPanel = document.querySelector('.history-panel');

            // Solo cerrar los paneles de historial y monedas, no el formulario de agregar moneda
            if (currenciesPanel && currenciesPanel.classList.contains('show')) {
                PanelManager.hidePanel(currenciesPanel);
                chatbot.isPanelOpen = false;
                chatbot.activePanel = null;
                PanelManager.resetButtonStates();
            }
            if (historyPanel && historyPanel.classList.contains('show')) {
                PanelManager.hidePanel(historyPanel);
                chatbot.isPanelOpen = false;
                chatbot.activePanel = null;
                PanelManager.resetButtonStates();
            }
        }
    });
});

// Panel Elements
const historyPanel = document.querySelector('.history-panel');
const currencyFormPanel = document.querySelector('.currency-form-panel');
const currenciesPanel = document.querySelector('.currencies-panel');

// Search functionality for currencies
const currencySearch = document.querySelector('.currency-search');
if (currencySearch) {
    currencySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.currencies-table tr:not(:first-child)');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}




