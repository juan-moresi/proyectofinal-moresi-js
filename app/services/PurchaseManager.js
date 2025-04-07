/**
 * Clase que maneja la funcionalidad de compra de monedas
 * Gestiona el panel de confirmación y el proceso de compra ficticia
 */
export class PurchaseManager {
    constructor(chatBot) {
        this.chatBot = chatBot;
        
        // Limpiar panel de compra existente
        const existingPanel = document.getElementById('purchasePanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        this.createPurchasePanel();
    }

    /**
     * Crea el panel de confirmación de compra
     */
    createPurchasePanel() {
        const purchasePanel = document.createElement('div');
        purchasePanel.className = 'purchase-panel';
        purchasePanel.id = 'purchasePanel';
        purchasePanel.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; justify-content: center; align-items: center;';
        
        const purchaseContent = document.createElement('div');
        purchaseContent.className = 'purchase-content';
        purchaseContent.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; width: 90%; text-align: center;';
        
        purchaseContent.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: #1e293b; font-size: 1.5rem;">Comprar Moneda</h3>
            <p style="color: #64748b; margin-bottom: 1.5rem;">¿Deseas realizar una compra de <span id="purchaseAmount"></span> <span id="purchaseCurrency"></span>?</p>
            <div class="purchase-buttons" style="display: flex; gap: 1rem; justify-content: center;">
                <button class="purchase-no" style="padding: 0.75rem 1.5rem; border: none; border-radius: 6px; background: #f1f5f9; color: #1e293b; font-weight: 600; cursor: pointer;">No, gracias</button>
                <button class="purchase-yes" style="padding: 0.75rem 1.5rem; border: none; border-radius: 6px; background: #10b981; color: white; font-weight: 600; cursor: pointer;">Sí, comprar ahora</button>
            </div>
        `;

        purchasePanel.appendChild(purchaseContent);
        document.body.appendChild(purchasePanel);

        // Agregar eventos a los botones
        const purchaseYesBtn = purchasePanel.querySelector('.purchase-yes');
        const purchaseNoBtn = purchasePanel.querySelector('.purchase-no');

        // Evento para cerrar al hacer clic fuera del contenido
        purchasePanel.addEventListener('click', (e) => {
            if (e.target === purchasePanel) {
                purchasePanel.style.display = 'none';
            }
        });

        purchaseYesBtn.addEventListener('click', () => {
            this.completePurchase();
            purchasePanel.style.display = 'none';
        });

        purchaseNoBtn.addEventListener('click', () => {
            purchasePanel.style.display = 'none';
        });

        // Agregar efectos hover a los botones
        const addHoverEffect = (button, isConfirm = false) => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                if (!isConfirm) {
                    button.style.background = '#f8fafc';
                }
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
                if (!isConfirm) {
                    button.style.background = '#f1f5f9';
                }
            });
        };

        addHoverEffect(purchaseNoBtn);
        addHoverEffect(purchaseYesBtn, true);
    }

    /**
     * Muestra el panel de confirmación de compra
     * @param {Object} conversionData - Datos de la conversión realizada
     */
    showPurchaseConfirmation(conversionData) {
        const purchasePanel = document.getElementById('purchasePanel');
        if (!purchasePanel) {
            console.error('Panel de compra no encontrado');
            return;
        }

        // Actualizar los datos en el panel
        const amountElement = purchasePanel.querySelector('#purchaseAmount');
        const currencyElement = purchasePanel.querySelector('#purchaseCurrency');

        if (amountElement && currencyElement) {
            amountElement.textContent = conversionData.result;
            currencyElement.textContent = conversionData.to;
        } else {
            console.error('Elementos del panel de compra no encontrados');
            return;
        }

        // Guardar los datos de conversión para usarlos en la compra
        this.currentConversion = conversionData;

        // Mostrar el panel
        purchasePanel.style.display = 'flex';
        console.log('Panel de compra mostrado', conversionData);
    }

    /**
     * Completa el proceso de compra y guarda en el historial
     */
    completePurchase() {
        if (!this.currentConversion) return;

        // Crear entrada para el historial
        const purchaseEntry = {
            timestamp: new Date(),
            type: 'purchase',
            from: this.currentConversion.from,
            to: this.currentConversion.to,
            amount: this.currentConversion.amount,
            result: this.currentConversion.result
        };

        // Agregar al historial usando el HistoryManager
        this.chatBot.historyManager.addToHistory(purchaseEntry);

        // Mostrar mensaje de confirmación en el chat
        const purchaseMessage = document.createElement('div');
        purchaseMessage.className = 'message bot-message purchase-confirmation';
        purchaseMessage.innerHTML = `
            <div class="purchase-content">
                <div class="purchase-icon">✅</div>
                <div class="purchase-details">
                    <span class="purchase-title">Compra realizada con éxito</span>
                    <span class="purchase-info">Has comprado ${this.currentConversion.result} ${this.currentConversion.to}</span>
                </div>
            </div>
        `;
        
        document.getElementById('chatMessages').appendChild(purchaseMessage);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;

        // Limpiar la conversión actual
        this.currentConversion = null;
    }
}