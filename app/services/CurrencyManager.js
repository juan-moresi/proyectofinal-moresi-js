export class CurrencyManager {
    constructor(chatBot) {
        this.chatBot = chatBot;
    }

    performConversion() {
        const { amount, fromCurrency, toCurrency } = this.chatBot.conversionState;
        const result = this.chatBot.converter.convert(amount, fromCurrency, toCurrency);
        
        // Guardar en Historial (limitado a 15 conversiones)
        const historyEntry = {
            timestamp: new Date(),
            type: 'conversion',
            from: fromCurrency,
            to: toCurrency,
            amount: amount,
            result: result
        };
        
        // Agregar la nueva conversión al inicio del array y mantener solo las últimas 15
        this.chatBot.conversionHistory.unshift(historyEntry);
        if (this.chatBot.conversionHistory.length > 15) {
            this.chatBot.conversionHistory = this.chatBot.conversionHistory.slice(0, 15);
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(this.chatBot.conversionHistory));
        
        // Display enhanced conversion result
        const monedaOrigen = this.chatBot.converter.monedas.find(m => m.codigo === fromCurrency).nombre;
        const monedaDestino = this.chatBot.converter.monedas.find(m => m.codigo === toCurrency).nombre;
        
        const resultMessage = document.createElement('div');
        resultMessage.className = 'message bot-message conversion-result';
        resultMessage.innerHTML = `
            <div class="conversion-content">
                <div class="conversion-from">
                    <span class="amount">${amount} ${fromCurrency}</span>
                    <span class="currency-name">${monedaOrigen}</span>
                </div>
                <span class="arrow">➔</span>
                <div class="conversion-to">
                    <span class="result">${result} ${toCurrency}</span>
                    <span class="currency-name">${monedaDestino}</span>
                </div>
            </div>
        `;
        
        document.getElementById('chatMessages').appendChild(resultMessage);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
        
        // Mostrar panel de confirmación de compra
        setTimeout(() => {
            this.chatBot.purchaseManager.showPurchaseConfirmation({
                from: fromCurrency,
                to: toCurrency,
                amount: amount,
                result: result
            });
        }, 1000); // Pequeño retraso para mejor experiencia de usuario
        
        this.chatBot.resetConversionState();
    }
}