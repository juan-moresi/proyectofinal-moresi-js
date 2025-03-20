/**
 * Clase que maneja la interfaz de usuario del chatbot
 * Gestiona los paneles, actualizaciones de UI y eventos de usuario
 */
export class UIManager {
    constructor(chatBot) {
        this.chatBot = chatBot;
        this.setupRateUpdateListener();
    }

    /**
     * Configura el observador para actualizar automáticamente
     * el panel de monedas cuando hay cambios en las tasas
     */
    setupRateUpdateListener() {
        const observer = new MutationObserver(() => {
            this.updateCurrenciesPanel();
        });

        // Configurar el observer para monitorear cambios en el panel de monedas
        const currenciesPanel = document.querySelector('.currencies-panel');
        if (currenciesPanel) {
            observer.observe(currenciesPanel, {
                childList: true,
                subtree: true
            });
        }
    }

    updateCurrenciesPanel() {
        const tbody = document.querySelector('.currencies-table tbody');
        if (!tbody) return;

        // Actualizar las tasas en la tabla
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const codeCell = row.querySelector('.currency-code-cell');
            const rateCell = row.querySelector('.currency-rate-cell');
            if (codeCell && rateCell) {
                const code = codeCell.textContent;
                const moneda = this.chatBot.converter.monedas.find(m => m.codigo === code);
                if (moneda) {
                    rateCell.textContent = moneda.tasa.toFixed(4);
                }
            }
        });
    }

    /**
     * Muestra el panel de monedas disponibles
     * Permite visualizar todas las monedas y sus tasas de cambio
     */
    showCurrencies() {
        const existingPanel = document.querySelector('.currencies-panel');
        if (existingPanel) existingPanel.remove();

        this.chatBot.togglePanelButtons(true);
        
        const currenciesPanel = this.createCurrenciesPanel();
        document.body.appendChild(currenciesPanel);
        
        setTimeout(() => {
            currenciesPanel.classList.add('show');
        }, 10);
        
        this.chatBot.isPanelOpen = true;
    }

    createCurrenciesPanel() {
        const panel = document.createElement('div');
        panel.className = 'currencies-panel';
        
        const header = document.createElement('h2');
        header.textContent = 'Monedas Disponibles';
        panel.appendChild(header);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-currencies';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeCurrenciesPanel(panel);
        panel.appendChild(closeBtn);

        // Add search input
        const searchContainer = document.createElement('div');
        searchContainer.className = 'currency-search-container';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'currency-search';
        searchInput.placeholder = 'Buscar moneda...';
        searchContainer.appendChild(searchInput);
        panel.appendChild(searchContainer);

        // Create scrollable container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'currencies-scroll-container';

        const currenciesTable = document.createElement('table');
        currenciesTable.className = 'currencies-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tasa de Cambio (USD)</th>
            </tr>
        `;
        currenciesTable.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Sort currencies: USD first, then alphabetically by code
        const sortedMonedas = [...this.chatBot.converter.monedas].sort((a, b) => {
            if (a.codigo === 'USD') return -1;
            if (b.codigo === 'USD') return 1;
            return a.codigo.localeCompare(b.codigo);
        });

        sortedMonedas.forEach(moneda => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="currency-code-cell">${moneda.codigo}</td>
                <td class="currency-name-cell">${moneda.nombre}</td>
                <td class="currency-rate-cell">${moneda.tasa.toFixed(4)}</td>
            `;
            tbody.appendChild(tr);
        });
        currenciesTable.appendChild(tbody);
        
        scrollContainer.appendChild(currenciesTable);
        panel.appendChild(scrollContainer);

        // Add search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const code = row.querySelector('.currency-code-cell').textContent.toLowerCase();
                const name = row.querySelector('.currency-name-cell').textContent.toLowerCase();
                row.style.display = code.includes(searchTerm) || name.includes(searchTerm) ? '' : 'none';
            });
        });

        return panel;
    }

    closeCurrenciesPanel(panel) {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.remove();
            this.chatBot.isPanelOpen = false;
            this.chatBot.activePanel = null;
            this.chatBot.togglePanelButtons(false);
        }, 300);
    }

    initAutocomplete() {
        const userInput = document.getElementById('userInput');
        const inputContainer = userInput.parentNode;
        
        // Crear el contenedor del autocompletado
        const autocompleteList = document.createElement('div');
        autocompleteList.className = 'autocomplete-list';
        
        // Insertar el autocompletado antes del input
        inputContainer.insertBefore(autocompleteList, userInput);

        userInput.addEventListener('input', (e) => {
            if (this.chatBot.conversionState.step > 0) {
                const value = e.target.value.toUpperCase();
                const suggestions = this.chatBot.converter.monedas
                    .filter(m => m.codigo.includes(value) || m.nombre.toUpperCase().includes(value))
                    .slice(0, 5);

                autocompleteList.innerHTML = '';
                if (suggestions.length > 0 && value) {
                    suggestions.forEach(currency => {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = `${currency.codigo} - ${currency.nombre}`;
                        div.onclick = () => {
                            userInput.value = currency.codigo;
                            autocompleteList.style.display = 'none';
                        };
                        autocompleteList.appendChild(div);
                    });
                    autocompleteList.style.display = 'block';
                } else {
                    autocompleteList.style.display = 'none';
                }
            }
        });

        // Cerrar el autocompletado cuando se hace clic fuera
        document.addEventListener('click', (e) => {
            if (!autocompleteList.contains(e.target) && e.target !== userInput) {
                autocompleteList.style.display = 'none';
            }
        });
    }

    addClearChatButton() {
        // Check if button already exists
        let clearChatBtn = document.getElementById('clearChatBtn');
        
        // If button doesn't exist, create it
        if (!clearChatBtn) {
            clearChatBtn = document.createElement('button');
            clearChatBtn.id = 'clearChatBtn';
            clearChatBtn.textContent = 'Limpiar Chat';
            
            // Add button to the chat header
            const chatHeader = document.querySelector('.chat-header');
            if (chatHeader) {
                chatHeader.appendChild(clearChatBtn);
            }
        }
        
        // Add event listener to the button
        clearChatBtn.addEventListener('click', () => {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            // Reset placeholder to initial value
            const userInput = document.getElementById('userInput');
            userInput.placeholder = '💰 Ingresa el monto a convertir...';
            
            // Reset conversion state
            this.chatBot.resetConversionState();
            
            // Add welcome message only
            this.chatBot.addMessage(`Bienvenido ${this.chatBot.userName}! Para comenzar la conversión, ingresa el monto:`, 'bot');
        });
    }
}