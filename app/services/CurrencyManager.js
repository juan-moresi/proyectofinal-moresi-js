export class CurrencyManager {
    constructor(chatBot) {
        this.chatBot = chatBot;
    }

    performConversion() {
        const { amount, fromCurrency, toCurrency } = this.chatBot.conversionState;
        const result = this.chatBot.converter.convert(amount, fromCurrency, toCurrency);
        
        // Save to history (limitado a 5 conversiones)
        const historyEntry = {
            timestamp: new Date(),
            type: 'conversion',
            from: fromCurrency,
            to: toCurrency,
            amount: amount,
            result: result
        };
        
        // Agregar la nueva conversión al inicio del array y mantener solo las últimas 5
        this.chatBot.conversionHistory.unshift(historyEntry);
        if (this.chatBot.conversionHistory.length > 5) {
            this.chatBot.conversionHistory = this.chatBot.conversionHistory.slice(0, 5);
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
        
        this.chatBot.resetConversionState();
    }
}