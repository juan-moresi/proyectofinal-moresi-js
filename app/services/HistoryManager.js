/**
 * Clase que maneja el historial de conversiones de monedas
 * Gestiona el almacenamiento, visualización y eliminación del historial
 */
export class HistoryManager {
    constructor(chatBot) {
        this.chatBot = chatBot;
        // Cargar historial desde localStorage
        this.history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        
        // Limpiar panel de confirmación existente
        const existingPanel = document.getElementById('confirmPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        this.createConfirmationPanel();
    }

    createConfirmationPanel() {
        const confirmPanel = document.createElement('div');
        confirmPanel.className = 'confirm-panel';
        confirmPanel.id = 'confirmPanel';
        confirmPanel.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; justify-content: center; align-items: center;';
        
        const confirmContent = document.createElement('div');
        confirmContent.className = 'confirm-content';
        confirmContent.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; width: 90%; text-align: center;';
        
        confirmContent.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: #1e293b; font-size: 1.5rem;">Confirmar Borrado</h3>
            <p style="color: #64748b; margin-bottom: 1.5rem;">¿Estás seguro que deseas borrar todo el historial de conversiones?</p>
            <div class="confirm-buttons" style="display: flex; gap: 1rem; justify-content: center;">
                <button class="confirm-no" style="padding: 0.75rem 1.5rem; border: none; border-radius: 6px; background: #f1f5f9; color: #1e293b; font-weight: 600; cursor: pointer;">No, mantener historial</button>
                <button class="confirm-yes" style="padding: 0.75rem 1.5rem; border: none; border-radius: 6px; background: #dc2626; color: white; font-weight: 600; cursor: pointer;">Sí, borrar todo</button>
            </div>
        `;

        confirmPanel.appendChild(confirmContent);
        document.body.appendChild(confirmPanel);

        // Agregar eventos a los botones
        const confirmYesBtn = confirmPanel.querySelector('.confirm-yes');
        const confirmNoBtn = confirmPanel.querySelector('.confirm-no');

        // Evento para cerrar al hacer clic fuera del contenido
        confirmPanel.addEventListener('click', (e) => {
            if (e.target === confirmPanel) {
                confirmPanel.style.display = 'none';
            }
        });

        confirmYesBtn.addEventListener('click', () => {
            this.clearHistory();
            confirmPanel.style.display = 'none';
            const historyPanel = document.querySelector('.history-panel');
            if (historyPanel) {
                this.refreshContent(historyPanel);
            }
        });

        confirmNoBtn.addEventListener('click', () => {
            confirmPanel.style.display = 'none';
        });
    }

    /**
     * Agrega una nueva conversión al historial
     * @param {Object} conversion - Datos de la conversión realizada
     */
    addToHistory(conversion) {
        // Agregar nueva conversión al inicio del historial
        this.history.unshift({
            ...conversion,
            timestamp: new Date().toISOString()
        });

        // Limitar el historial a 50 entradas
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        // Guardar en localStorage y actualizar UI si es necesario
        localStorage.setItem('conversionHistory', JSON.stringify(this.history));
        const historyPanel = document.querySelector('.history-panel');
        if (historyPanel && historyPanel.classList.contains('show')) {
            this.refreshContent(historyPanel);
        }
    }

    showHistory() {
        const existingPanel = document.querySelector('.history-panel');
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('div');
        panel.className = 'history-panel';
        panel.style.zIndex = '1000';

        // Header
        const header = document.createElement('div');
        header.className = 'history-panel-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Historial de Conversiones';
        header.appendChild(title);

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'history-panel-buttons';
        buttonsContainer.style.cssText = 'padding: 1rem 2rem; display: flex; justify-content: space-between; gap: 1rem; background: var(--surface-color); border-bottom: 1px solid var(--border-color);';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-history-btn';
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.cssText = 'padding: 0.75rem 1.5rem; border: 2px solid var(--border-color); border-radius: 8px; background: white; color: var(--text-primary); font-weight: 600; cursor: pointer; transition: all 0.3s ease;';
        closeBtn.addEventListener('click', () => this.hidePanel(panel));

        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-history-btn';
        clearBtn.textContent = 'Borrar Historial';
        clearBtn.style.cssText = 'padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--error-color), #ef4444); color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease;';
        clearBtn.addEventListener('click', () => {
            const confirmPanel = document.getElementById('confirmPanel');
            if (confirmPanel) {
                confirmPanel.style.display = 'flex';
            }
        });

        buttonsContainer.appendChild(closeBtn);
        buttonsContainer.appendChild(clearBtn);

        panel.appendChild(header);
        panel.appendChild(buttonsContainer);

        // Content
        this.refreshContent(panel);
        
        document.body.appendChild(panel);
        setTimeout(() => panel.classList.add('show'), 50);

        this.chatBot.isPanelOpen = true;
        this.chatBot.activePanel = 'history';

        // Add hover effects
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'translateY(-2px)';
            closeBtn.style.boxShadow = 'var(--shadow-md)';
            closeBtn.style.background = 'var(--background-color)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'translateY(0)';
            closeBtn.style.boxShadow = 'none';
            closeBtn.style.background = 'white';
        });

        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.transform = 'translateY(-2px)';
            clearBtn.style.boxShadow = 'var(--shadow-md)';
        });

        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.transform = 'translateY(0)';
            clearBtn.style.boxShadow = 'none';
        });
    }

    hidePanel(panel) {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.remove();
            this.chatBot.isPanelOpen = false;
            this.chatBot.activePanel = null;
            this.chatBot.togglePanelButtons(false);
        }, 300);
    }

    refreshContent(panel) {
        const existingContent = panel.querySelector('.history-content');
        if (existingContent) {
            existingContent.remove();
        }
        
        const content = this.createHistoryContent();
        panel.appendChild(content);
    }

    createHistoryContent() {
        const content = document.createElement('div');
        content.className = 'history-content';
        
        if (this.history.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history';
            emptyMessage.innerHTML = `
                <div class="empty-history-icon">📊</div>
                <h3>No hay conversiones en el historial</h3>
                <p>Las conversiones que realices aparecerán aquí</p>
            `;
            content.appendChild(emptyMessage);
            return content;
        }

        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        this.history.forEach(conversion => {
            const date = new Date(conversion.timestamp);
            const historyItem = document.createElement('div');
            historyItem.className = 'conversion-result history-item';
            
            historyItem.innerHTML = `
                <div class="conversion-details">
                    <div class="currency-info">
                        <div class="currency-code">${conversion.fromCurrency}</div>
                        <div class="currency-name">${conversion.fromCurrencyName || ''}</div>
                        <div class="amount">${conversion.formattedAmount}</div>
                    </div>
                    <div class="arrow">➜</div>
                    <div class="currency-info">
                        <div class="currency-code">${conversion.toCurrency}</div>
                        <div class="currency-name">${conversion.toCurrencyName || ''}</div>
                        <div class="result">${conversion.formattedResult}</div>
                    </div>
                </div>
                <div class="exchange-rate">
                    1 ${conversion.fromCurrency} = ${(conversion.toRate / conversion.fromRate).toFixed(4)} ${conversion.toCurrency}
                    <div class="rate-timestamp">Actualizado: ${date.toLocaleString()}</div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        content.appendChild(historyList);
        return content;
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('conversionHistory');
        this.chatBot.addMessage('El historial ha sido borrado', 'bot');
    }
}