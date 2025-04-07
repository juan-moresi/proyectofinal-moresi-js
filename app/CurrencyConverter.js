import CurrencyApiService from './services/CurrencyApiService.js';

/**
 * Clase principal para la conversión de monedas
 * Gestiona las tasas de cambio, monedas soportadas y actualizaciones automáticas
 */
class CurrencyConverter {
    constructor() {
        // Servicios y estado inicial
        this.apiService = new CurrencyApiService();
        this.monedas = [];
        this.supportedCurrencies = [];
        this.customCurrencies = [];
        this.initializeCurrencies();
        this.startAutoUpdate();
    }

    /**
     * Inicia la actualización automática de tasas de cambio
     * Mantiene las tasas actualizadas en tiempo real
     */
    startAutoUpdate() {
        this.apiService.startAutoUpdate((newRates) => {
            this.updateRates(newRates);
        });
    }

    /**
     * Actualiza las tasas de cambio con los nuevos datos
     * @param {Object} ratesData - Nuevas tasas de cambio recibidas de la API
     */
    updateRates(ratesData) {
        // Actualizar tasas de monedas no personalizadas
        this.monedas = this.monedas.map(moneda => {
            if (!moneda.isCustom) {
                const newRate = ratesData.data[moneda.codigo];
                if (newRate) {
                    return {
                        ...moneda,
                        tasa: newRate
                    };
                }
            }
            return moneda;
        });

        // Asegurar que ARS esté actualizado
        const arsIndex = this.monedas.findIndex(m => m.codigo === 'ARS');
        if (arsIndex !== -1 && !this.monedas[arsIndex].isCustom) {
            this.monedas[arsIndex].tasa = ratesData.data.USD * 1067.02;
        }

        // Actualizar la lista de monedas soportadas
        this.supportedCurrencies = this.monedas.map(m => m.codigo);
    }

    async initializeCurrencies() {
        try {
            // Cargar monedas personalizadas del localStorage
            const savedCustomCurrencies = localStorage.getItem('customCurrencies');
            if (savedCustomCurrencies) {
                this.customCurrencies = JSON.parse(savedCustomCurrencies);
            }

            // Obtener monedas de la API
            const ratesData = await this.apiService.getLatestRates();
            this.monedas = Object.entries(ratesData.data).map(([codigo, tasa]) => ({
                codigo,
                nombre: this.getCurrencyName(codigo),
                tasa: tasa,
                isCustom: false
            }));
            
            // Asegurar que ARS esté en la lista
            if (!this.monedas.some(m => m.codigo === 'ARS')) {
                this.monedas.push({
                    codigo: 'ARS',
                    nombre: 'Peso Argentino',
                    tasa: ratesData.data.USD * 1067.02,
                    isCustom: false
                });
            }

            // Agregar monedas personalizadas a la lista de monedas
            this.monedas = [...this.monedas, ...this.customCurrencies];
            
            this.supportedCurrencies = this.monedas.map(m => m.codigo);
            
            // Actualizar el tiempo de última actualización
            this.apiService.updateLastUpdateTime();
        } catch (error) {
            this.apiService.showStatusPopup('Error al inicializar monedas: ' + error.message);
            // Fallback a USD y ARS si la API falla
            this.monedas = [
                { codigo: 'USD', nombre: 'Dólar Estadounidense', tasa: 1, isCustom: false },
                { codigo: 'ARS', nombre: 'Peso Argentino', tasa: 1067.02, isCustom: false }
            ];
            this.supportedCurrencies = ['USD', 'ARS'];
        }
    }

    getCurrencyName(code) {
        const currencyNames = {
            'USD': 'Dólar Estadounidense',
            'EUR': 'Euro',
            'GBP': 'Libra Esterlina',
            'JPY': 'Yen Japonés',
            'AUD': 'Dólar Australiano',
            'CAD': 'Dólar Canadiense',
            'CHF': 'Franco Suizo',
            'CNY': 'Yuan Chino',
            'INR': 'Rupia India',
            'BRL': 'Real Brasileño',
            'RUB': 'Rublo Ruso',
            'KRW': 'Won Surcoreano',
            'SGD': 'Dólar de Singapur',
            'NZD': 'Dólar Neozelandés',
            'MXN': 'Peso Mexicano',
            'HKD': 'Dólar de Hong Kong',
            'TRY': 'Lira Turca',
            'SAR': 'Riyal Saudí',
            'SEK': 'Corona Sueca',
            'ZAR': 'Rand Sudafricano',
            'ARS': 'Peso Argentino',
            'AED': 'Dírham de los Emiratos Árabes Unidos',
            'AFN': 'Afgani Afgano',
            'ALL': 'Lek Albanés',
            'AMD': 'Dram Armenio',
            'ANG': 'Florín Antillano Neerlandés',
            'AOA': 'Kwanza Angoleño',
            'AWG': 'Florín Arubeño',
            'AZN': 'Manat Azerbaiyano',
            'BAM': 'Marco Bosnia-Herzegovina',
            'BBD': 'Dólar de Barbados',
            'BDT': 'Taka Bangladesí',
            'BGN': 'Lev Búlgaro',
            'BHD': 'Dinar Bahreiní',
            'BIF': 'Franco Burundés',
            'BMD': 'Dólar Bermudeño',
            'BND': 'Dólar de Brunéi',
            'BOB': 'Boliviano',
            'BSD': 'Dólar Bahameño',
            'BTN': 'Ngultrum Butanés',
            'BWP': 'Pula Botsuano',
            'BYN': 'Rublo Bielorruso',
            'BZD': 'Dólar Beliceño',
            'CDF': 'Franco Congoleño',
            'CLP': 'Peso Chileno',
            'COP': 'Peso Colombiano',
            'CRC': 'Colón Costarricense',
            'CUP': 'Peso Cubano',
            'CVE': 'Escudo Caboverdiano',
            'CZK': 'Corona Checa',
            'DJF': 'Franco Yibutiano',
            'DKK': 'Corona Danesa',
            'DOP': 'Peso Dominicano',
            'DZD': 'Dinar Argelino',
            'EGP': 'Libra Egipcia',
            'ETB': 'Birr Etíope',
            'FJD': 'Dólar Fiyiano',
            'FKP': 'Libra de las Islas Malvinas',
            'GEL': 'Lari Georgiano',
            'GHS': 'Cedi Ghanés',
            'GIP': 'Libra de Gibraltar',
            'GMD': 'Dalasi Gambiano',
            'GNF': 'Franco Guineano',
            'GTQ': 'Quetzal Guatemalteco',
            'GYD': 'Dólar Guyanés',
            'HNL': 'Lempira Hondureño',
            'HRK': 'Kuna Croata',
            'HTG': 'Gourde Haitiano',
            'HUF': 'Forinto Húngaro',
            'IDR': 'Rupia Indonesia',
            'ILS': 'Nuevo Shéquel Israelí',
            'IQD': 'Dinar Iraquí',
            'IRR': 'Rial Iraní',
            'ISK': 'Corona Islandesa',
            'JMD': 'Dólar Jamaiquino',
            'JOD': 'Dinar Jordano',
            'KES': 'Chelín Keniata',
            'KGS': 'Som Kirguís',
            'KHR': 'Riel Camboyano',
            'KMF': 'Franco Comorense',
            'KPW': 'Won Norcoreano',
            'KWD': 'Dinar Kuwaití',
            'KYD': 'Dólar de las Islas Caimán',
            'KZT': 'Tenge Kazajo',
            'LAK': 'Kip Laosiano',
            'LBP': 'Libra Libanesa',
            'LKR': 'Rupia de Sri Lanka',
            'LRD': 'Dólar Liberiano',
            'LSL': 'Loti Lesotense',
            'LYD': 'Dinar Libio',
            'MAD': 'Dírham Marroquí',
            'MDL': 'Leu Moldavo',
            'MGA': 'Ariary Malgache',
            'MKD': 'Denar Macedonio',
            'MMK': 'Kyat de Myanmar',
            'MNT': 'Tugrik Mongol',
            'MOP': 'Pataca Macaense',
            'MRU': 'Ouguiya Mauritano',
            'MUR': 'Rupia Mauriciana',
            'MVR': 'Rufiyaa Maldiva',
            'MWK': 'Kwacha Malauí',
            'MYR': 'Ringgit Malayo',
            'MZN': 'Metical Mozambiqueño',
            'NAD': 'Dólar Namibio',
            'NGN': 'Naira Nigeriano',
            'NIO': 'Córdoba Nicaragüense',
            'NOK': 'Corona Noruega',
            'NPR': 'Rupia Nepalí',
            'OMR': 'Rial Omaní',
            'PAB': 'Balboa Panameño',
            'PEN': 'Sol Peruano',
            'PGK': 'Kina Papuano',
            'PHP': 'Peso Filipino',
            'PKR': 'Rupia Pakistaní',
            'PLN': 'Złoty Polaco',
            'PYG': 'Guaraní Paraguayo',
            'QAR': 'Riyal Catarí',
            'RON': 'Leu Rumano',
            'RSD': 'Dinar Serbio',
            'RWF': 'Franco Ruandés',
            'SBD': 'Dólar de las Islas Salomón',
            'SCR': 'Rupia Seychellense',
            'SDG': 'Libra Sudanesa',
            'SHP': 'Libra de Santa Elena',
            'SLL': 'Leone Sierraleonés',
            'SOS': 'Chelín Somalí',
            'SRD': 'Dólar Surinamés',
            'SSP': 'Libra Sudanesa del Sur',
            'STN': 'Dobra Santo Tomense',
            'SYP': 'Libra Siria',
            'SZL': 'Lilangeni Suazi',
            'THB': 'Baht Tailandés',
            'TJS': 'Somoni Tayiko',
            'TMT': 'Manat Turcomano',
            'TND': 'Dinar Tunecino',
            'TOP': 'Paʻanga Tongano',
            'TTD': 'Dólar de Trinidad y Tobago',
            'TWD': 'Dólar Taiwanés',
            'TZS': 'Chelín Tanzano',
            'UAH': 'Grivna Ucraniana',
            'UGX': 'Chelín Ugandés',
            'UYU': 'Peso Uruguayo',
            'UZS': 'Som Uzbeko',
            'VES': 'Bolívar Venezolano',
            'VND': 'Dong Vietnamita',
            'VUV': 'Vatu Vanuatuense',
            'WST': 'Tala Samoano',
            'XAF': 'Franco CFA de África Central',
            'XCD': 'Dólar del Caribe Oriental',
            'XOF': 'Franco CFA de África Occidental',
            'XPF': 'Franco CFP',
            'YER': 'Rial Yemení',
            'ZMW': 'Kwacha Zambiano',
            'ZWL': 'Dólar Zimbabuense'
        };
        return currencyNames[code] || code;
    }

    async addCurrency(nombre, codigo, tasa) {
        codigo = codigo.trim().toUpperCase();
        if (this.monedas.some(m => m.codigo === codigo)) {
            throw new Error('Esta moneda ya existe');
        }
        
        const newCurrency = { codigo, nombre, tasa, isCustom: true };
        this.customCurrencies.push(newCurrency);
        this.monedas.push(newCurrency);
        this.supportedCurrencies = this.monedas.map(m => m.codigo);
        this.saveCustomCurrenciesToLocalStorage();
    }

    async actualizarTasaMoneda(codigo, nuevaTasa) {
        codigo = codigo.trim().toUpperCase();
        const indiceMoneda = this.monedas.findIndex(m => m.codigo === codigo);
        
        if (indiceMoneda === -1) {
            throw new Error('Moneda no encontrada');
        }

        // Solo permitir actualizar monedas personalizadas
        if (!this.monedas[indiceMoneda].isCustom) {
            throw new Error('No se puede actualizar la tasa de una moneda de la API');
        }
        
        this.monedas[indiceMoneda].tasa = parseFloat(nuevaTasa);
        // Actualizar también en customCurrencies
        const customIndex = this.customCurrencies.findIndex(m => m.codigo === codigo);
        if (customIndex !== -1) {
            this.customCurrencies[customIndex].tasa = parseFloat(nuevaTasa);
        }
        this.saveCustomCurrenciesToLocalStorage();
        
        return this.monedas[indiceMoneda];
    }

    async convert(amount, fromCurrency, toCurrency) {
        try {
            if (!amount || isNaN(amount)) {
                throw new Error('El monto debe ser un número válido');
            }

            const fromRate = await this.getRateWithTimeout(fromCurrency);
            const toRate = await this.getRateWithTimeout(toCurrency);

            if (!fromRate || !toRate) {
                throw new Error('No se pudieron obtener las tasas de cambio');
            }

            // Verificar si currency está disponible globalmente (desde el script en HTML)
            let currencyFunc;
            if (typeof window !== 'undefined' && typeof window.currency !== 'undefined') {
                currencyFunc = window.currency;
            } else {
                // Definir una función de respaldo simple si currency.js no está disponible
                currencyFunc = function(amount) {
                    const value = parseFloat(amount);
                    return {
                        value: value,
                        divide: function(divisor) { return currencyFunc(value / divisor); },
                        multiply: function(multiplier) { return currencyFunc(value * multiplier); }
                    };
                };
                console.warn('La biblioteca currency.js no está disponible. Usando implementación de respaldo.');
            }
            
            // Realizar la conversión
            const amountInUSD = currencyFunc(amount).divide(fromRate);
            const result = currencyFunc(amountInUSD).multiply(toRate);

            return {
                amount: parseFloat(result.value.toFixed(2)),
                fromCurrency,
                toCurrency,
                fromRate,
                toRate,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error en la conversión:', error);
            throw error;
        }
    }

    async getRateWithTimeout(currencyCode, timeout = 5000) {
        try {
            const ratePromise = new Promise((resolve, reject) => {
                const currency = this.monedas.find(m => m.codigo === currencyCode);
                if (!currency) {
                    reject(new Error(`Moneda ${currencyCode} no encontrada`));
                    return;
                }
                resolve(currency.tasa);
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Timeout al obtener la tasa para ${currencyCode}`));
                }, timeout);
            });

            return await Promise.race([ratePromise, timeoutPromise]);
        } catch (error) {
            console.error(`Error al obtener tasa para ${currencyCode}:`, error);
            throw error;
        }
    }

    getSupportedCurrenciesText() {
        return this.monedas.map(m => `${m.codigo} (${m.nombre})`).join(', ');
    }

    saveCustomCurrenciesToLocalStorage() {
        localStorage.setItem('customCurrencies', JSON.stringify(this.customCurrencies));
    }

    getCurrencySymbol(currencyCode) {
        const symbols = {
            USD: '$',
            EUR: '€',
            ARS: 'AR$',
            BRL: 'R$',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            MXN: 'MX$',
            CLP: 'CL$',
            PEN: 'S/',
            COP: 'COL$'
        };
        return symbols[currencyCode] || currencyCode;
    }

    formatAmount(amount, currencyCode) {
        const formatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(amount);
    }
}

export default CurrencyConverter;