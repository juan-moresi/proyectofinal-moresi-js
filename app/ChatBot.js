import CurrencyConverter from './CurrencyConverter.js';
import { textos } from './config/texts.js';
import { CurrencyManager } from './services/CurrencyManager.js';
import { HistoryManager } from './services/HistoryManager.js';
import { UIManager } from './services/UIManager.js';
import { MessageHandler } from './services/MessageHandler.js';
import { PurchaseManager } from './services/PurchaseManager.js';

class ChatBot {
    constructor() {
        this.converter = new CurrencyConverter();
        this.userName = localStorage.getItem('nombreUsuario') || '';
        this.messages = textos;
        
        // Initialize conversionHistory properly
        this.conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        
        this.conversionState = { step: 0, amount: null, fromCurrency: null, toCurrency: null };
        this.addCurrencyState = { step: null, nombre: null, codigo: null };
        
        this.activePanel = null;
        this.isPanelOpen = false;
        this.panelButtons = {
            history: 'historyBtn',
            currencies: 'showCurrenciesBtn',
            addCurrency: 'addCurrencyBtn'
        };

        // Inicializar servicios
        this.currencyManager = new CurrencyManager(this);
        this.historyManager = new HistoryManager(this);
        this.uiManager = new UIManager(this);
        this.messageHandler = new MessageHandler(this);
        this.purchaseManager = new PurchaseManager(this);

        // Inicialización asíncrona
        this.initializeAsync();
    }

    async initializeAsync() {
        try {
            await this.converter.initializeCurrencies();
            this.initialize();
            this.uiManager.initAutocomplete();
            this.uiManager.addClearChatButton();
        } catch (error) {
            console.error('Error initializing chatbot:', error);
            this.addMessage('Error al cargar las tasas de cambio. Por favor, recarga la página.', 'bot');
        }
    }

    initialize() {
        const userInput = document.getElementById('userInput');
        
        if (!this.userName) {
            this.addMessage(this.messages.mensajes.solicitarNombre, 'bot');
            userInput.placeholder = this.messages.placeholder.nombre;
            userInput.classList.add('name-input');
        } else {
            this.addMessage(`${this.messages.mensajes.bienvenida} ${this.userName}! ${this.messages.mensajes.instruccion}`, 'bot');
            userInput.placeholder = this.messages.placeholder.monto;
        }
    }

    updateInputPlaceholder(text) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.placeholder = this.messages.placeholder[text] || text;
        }
    }

    addMessage(text, type) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    handleInput(input) {
        this.messageHandler.handleInput(input);
    }

    resetAddCurrencyState() {
        this.addCurrencyState.step = null;
        this.addCurrencyState.nombre = null;
        this.addCurrencyState.codigo = null;
        this.isPanelOpen = false;
        this.activePanel = null;
        
        // Re-enable utility buttons
        const utilityButtons = document.querySelectorAll('.utility-buttons button');
        utilityButtons.forEach(button => {
            if (button.id === 'historyBtn' || button.id === 'showCurrenciesBtn') {
                button.disabled = false;
            }
        });
        
        this.addMessage(this.messages.mensajes.instruccion, 'bot');
    }

    togglePanelButtons(disabled) {
        const historyBtn = document.getElementById('historyBtn');
        const currenciesBtn = document.getElementById('showCurrenciesBtn');
        
        if (historyBtn) historyBtn.disabled = disabled;
        if (currenciesBtn) currenciesBtn.disabled = disabled;
    }

    resetConversionState() {
        this.conversionState.step = 0;
        this.conversionState.amount = null;
        this.conversionState.fromCurrency = null;
        this.updateInputPlaceholder(this.messages.placeholder.monto);
    }

    showHistory() {
        if (this.isPanelOpen) return;
        this.togglePanelButtons(true);
        this.historyManager.showHistory();
        this.activePanel = 'history';
    }

    showCurrencies() {
        if (this.isPanelOpen) return;
        this.togglePanelButtons(true);
        this.uiManager.showCurrencies();
        this.activePanel = 'currencies';
    }

    clearUserInput() {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = '';
        }
    }

    addCurrencyFromForm(nombre, codigo, tasa) {
        try {
            this.converter.addCurrency(nombre, codigo, parseFloat(tasa));
            this.addMessage('Moneda agregada exitosamente', 'bot');
            return true;
        } catch (error) {
            this.addMessage(error.message, 'error');
            return false;
        }
    }
}

export default ChatBot;