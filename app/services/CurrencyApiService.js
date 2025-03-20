/**
 * Servicio para manejar la comunicación con la API de conversión de monedas
 * Gestiona las tasas de cambio, caché y actualizaciones automáticas
 */
class CurrencyApiService {
    constructor() {
        // Configuración de la API
        this.apiKey = 'fca_live_VBj6b8ySsI4iCLZdstj9dYmcZzPbbUUfDQNo1iGs';
        this.baseUrl = 'https://api.freecurrencyapi.com/v1';
        
        // Sistema de caché para optimizar las llamadas a la API
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.updateInterval = 5 * 60 * 1000; // 5 minutos
        
        // Control de actualizaciones y estado
        this.updateTimer = null;
        this.onUpdateCallback = null;
        this.lastUpdateTime = null;
        this.activePopup = null;
        this.popupTimeout = null;
    }

    /**
     * Inicia el sistema de actualización automática de tasas
     * @param {Function} callback - Función a ejecutar cuando se actualizan las tasas
     */
    startAutoUpdate(callback) {
        this.onUpdateCallback = callback;
        // Solo realizar una actualización inicial si no hay datos en caché
        if (!this.getFromCache('latest_rates')) {
            this.getLatestRates(true, true).then(rates => {
                if (callback) callback(rates);
            }).catch(error => this.showStatusPopup(`Error: ${error.message}`));
        }
        this.scheduleNextUpdate();
    }

    stopAutoUpdate() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }

    scheduleNextUpdate() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }

        this.updateTimer = setTimeout(async () => {
            try {
                const newRates = await this.getLatestRates(true);
                if (this.onUpdateCallback) {
                    this.onUpdateCallback(newRates);
                }
            } catch (error) {
                this.showStatusPopup(`Error en la actualización: ${error.message}`);
            } finally {
                this.scheduleNextUpdate();
            }
        }, this.updateInterval);
    }

    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const timeElement = document.getElementById('lastUpdateTime');
        if (timeElement) {
            timeElement.textContent = this.lastUpdateTime.toLocaleString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }
    }

    async initializeCurrencies() {
        const loadingPanel = document.getElementById('loadingPanel');
        loadingPanel.classList.add('show');
        try {
            const savedCustomCurrencies = localStorage.getItem('customCurrencies');
            if (savedCustomCurrencies) {
                this.customCurrencies = JSON.parse(savedCustomCurrencies);
            }
        } finally {
            loadingPanel.classList.remove('show');
        }
    }

    showStatusPopup(message) {
        if (this.activePopup) {
            clearTimeout(this.popupTimeout);
            this.activePopup.remove();
        }

        const popup = document.createElement('div');
        popup.className = 'status-popup';
        popup.textContent = message;
        document.body.appendChild(popup);
        
        this.activePopup = popup;
        this.popupTimeout = setTimeout(() => {
            popup.remove();
            this.activePopup = null;
        }, 3000);
    }

    /**
     * Obtiene las últimas tasas de cambio de la API
     * @param {boolean} forceUpdate - Forzar actualización ignorando caché
     * @param {boolean} suppressPopup - Suprimir mensajes popup
     * @returns {Promise<Object>} Tasas de cambio actualizadas
     */
    async getLatestRates(forceUpdate = false, suppressPopup = false) {
        const cacheKey = 'latest_rates';
        const loadingPanel = document.getElementById('loadingPanel');
        loadingPanel.classList.add('show');
        
        // Verificar caché antes de llamar a la API
        if (!forceUpdate) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                loadingPanel.classList.remove('show');
                return cachedData;
            }
        }

        try {
            const response = await fetch(`${this.baseUrl}/latest?apikey=${this.apiKey}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Error en la API (${response.status}): ${errorData.message || response.statusText}`
                );
            }

            const data = await response.json();
            
            if (!data || !data.data || typeof data.data !== 'object') {
                throw new Error('Formato de respuesta inválido de la API');
            }

            this.addToCache(cacheKey, data);
            this.updateLastUpdateTime();
            if (!suppressPopup) {
                this.showStatusPopup('Tasas de cambio actualizadas exitosamente');
            }
            loadingPanel.classList.remove('show');
            return data;
        } catch (error) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                loadingPanel.classList.remove('show');
                return cachedData;
            }
            loadingPanel.classList.remove('show');
            
            const errorMessage = `No se pudieron obtener las tasas de cambio: ${error.message}`;
            this.showStatusPopup(errorMessage);
            throw new Error(errorMessage);
        }
    }

    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
}

export default CurrencyApiService;