/**
 * Clase que maneja el procesamiento de mensajes del chatbot
 * Gestiona la entrada del usuario y coordina las diferentes acciones
 */
export class MessageHandler {
    constructor(chatBot) {
        this.chatBot = chatBot;
    }

    /**
     * Procesa la entrada del usuario y determina la acción apropiada
     * @param {string} input - Texto ingresado por el usuario
     */
    handleInput(input) {
        if (!this.chatBot.userName) {
            return this.handleNameInput(input);
        }

        if (input.toLowerCase() === "agregar moneda") {
            return this.handleAddCurrencyCommand();
        }

        if (this.chatBot.addCurrencyState.step !== null) {
            this.handleAddCurrency(input);
        } else {
            this.handleConversionStep(input);
        }
    }

    /**
     * Procesa el ingreso del nombre del usuario
     * Valida y almacena el nombre para personalizar la experiencia
     * @param {string} input - Nombre ingresado por el usuario
     */
    handleNameInput(input) {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(input)) {
            this.chatBot.addMessage("Por favor ingresa un nombre válido (solo letras)", 'error');
            return;
        }
        
        this.chatBot.userName = input;
        localStorage.setItem('nombreUsuario', input);
        document.getElementById('userInput').placeholder = this.chatBot.messages.placeholder.monto;
        
        // Habilitar los botones de utilidad después de establecer el nombre
        document.querySelectorAll('.utility-buttons button').forEach(button => {
            button.disabled = false;
        });
        
        this.chatBot.addMessage(`${this.chatBot.messages.mensajes.bienvenida} ${input}! ${this.chatBot.messages.mensajes.instruccion}`, 'bot');
    }

    handleAddCurrencyCommand() {
        this.chatBot.addCurrencyState.step = 1;
        this.chatBot.addMessage("Por favor ingresa el nombre de la moneda:", 'bot');
    }

    async handleConversionStep(input) {
        const state = this.chatBot.conversionState;
        
        try {
            switch (state.step) {
                case 0:
                    const amount = parseFloat(input.replace(/[^\d.-]/g, ''));
                    if (isNaN(amount) || amount <= 0) {
                        this.chatBot.addMessage("Por favor ingresa un monto válido (mayor a 0)", 'error');
                        return;
                    }
                    state.amount = amount;
                    state.step = 1;
                    this.chatBot.addMessage(`Ingresa la moneda de origen (por ejemplo: USD, EUR, ARS)`, 'bot');
                    this.chatBot.updateInputPlaceholder('monedaOrigen');
                    break;

                case 1:
                    const fromCurrency = input.toUpperCase();
                    if (this.validateCurrency(fromCurrency)) {
                        state.fromCurrency = fromCurrency;
                        state.step = 2;
                        this.chatBot.addMessage(`Ingresa la moneda de destino (por ejemplo: USD, EUR, ARS)`, 'bot');
                        this.chatBot.updateInputPlaceholder('monedaDestino');
                    }
                    break;

                case 2:
                    const toCurrency = input.toUpperCase();
                    if (this.validateCurrency(toCurrency)) {
                        state.toCurrency = toCurrency;
                        try {
                            const result = await this.chatBot.converter.convert(
                                state.amount,
                                state.fromCurrency,
                                state.toCurrency
                            );

                            const formattedAmount = this.chatBot.converter.formatAmount(state.amount, state.fromCurrency);
                            const formattedResult = this.chatBot.converter.formatAmount(result.amount, state.toCurrency);

                            // Obtener los nombres completos de las monedas
                            const fromCurrencyInfo = this.chatBot.converter.monedas.find(m => m.codigo === state.fromCurrency);
                            const toCurrencyInfo = this.chatBot.converter.monedas.find(m => m.codigo === state.toCurrency);

                            // Crear el mensaje con el nuevo diseño
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message bot-message conversion-result';
                            messageDiv.innerHTML = `
                                <div class="conversion-details">
                                    <div class="currency-info">
                                        <div class="currency-code">${state.fromCurrency}</div>
                                        <div class="currency-name">${fromCurrencyInfo.nombre}</div>
                                        <div class="amount">${formattedAmount}</div>
                                    </div>
                                    <div class="arrow">➔</div>
                                    <div class="currency-info">
                                        <div class="currency-code">${state.toCurrency}</div>
                                        <div class="currency-name">${toCurrencyInfo.nombre}</div>
                                        <div class="result">${formattedResult}</div>
                                    </div>
                                </div>
                                <div class="exchange-rate">
                                    Tasa de cambio: 1 ${state.fromCurrency} = ${(result.toRate / result.fromRate).toFixed(4)} ${state.toCurrency}
                                </div>
                            `;

                            document.getElementById('chatMessages').appendChild(messageDiv);
                            document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;

                            // Guardar en el historial
                            this.chatBot.historyManager.addToHistory({
                                ...result,
                                formattedAmount,
                                formattedResult,
                                fromCurrencyName: fromCurrencyInfo.nombre,
                                toCurrencyName: toCurrencyInfo.nombre
                            });

                        } catch (error) {
                            this.chatBot.addMessage(`Error: ${error.message}`, 'error');
                        }

                        this.chatBot.resetConversionState();
                        this.chatBot.addMessage(this.chatBot.messages.mensajes.instruccion, 'bot');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error en la conversión:', error);
            this.chatBot.addMessage(`Error: ${error.message}`, 'error');
            this.chatBot.resetConversionState();
        }
    }

    validateCurrency(currency) {
        if (!this.chatBot.converter.supportedCurrencies.includes(currency)) {
            this.chatBot.addMessage(`La moneda ${currency} no está soportada. Las monedas disponibles son: ${this.chatBot.converter.getSupportedCurrenciesText()}`, 'error');
            return false;
        }
        return true;
    }

    handleAddCurrency(input) {
        const state = this.chatBot.addCurrencyState;
        
        switch (state.step) {
            case 1:
                state.nombre = input;
                state.step = 2;
                this.chatBot.addMessage("Ingresa el código de la moneda (3 letras):", 'bot');
                break;
                
            case 2:
                if (!/^[A-Za-z]{3}$/.test(input)) {
                    this.chatBot.addMessage("El código debe ser exactamente 3 letras", 'error');
                    return;
                }
                state.codigo = input.toUpperCase();
                state.step = 3;
                this.chatBot.addMessage("Ingresa la tasa de cambio respecto al USD:", 'bot');
                break;
                
            case 3:
                const tasa = parseFloat(input);
                if (isNaN(tasa) || tasa <= 0) {
                    this.chatBot.addMessage("Por favor ingresa una tasa válida (número mayor que 0)", 'error');
                    return;
                }
                
                try {
                    this.chatBot.converter.addCurrency(state.nombre, state.codigo, tasa);
                    this.chatBot.addMessage(`Moneda ${state.codigo} agregada exitosamente`, 'bot');
                } catch (error) {
                    this.chatBot.addMessage(error.message, 'error');
                }
                
                this.chatBot.resetAddCurrencyState();
                break;
        }
    }
}