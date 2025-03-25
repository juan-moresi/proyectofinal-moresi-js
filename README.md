# 💱 Conversor de Monedas con ChatBot 🤖

Esta aplicación es un conversor de monedas interactivo que utiliza un ChatBot para guiar al usuario a través del proceso de conversión. Permite convertir entre múltiples monedas internacionales y ofrece la posibilidad de agregar monedas personalizadas.

## ✨ Características Principales

- 💬 Interfaz de chat interactiva
- 🌍 Conversión entre múltiples monedas internacionales
- 🔄 Actualización automática de tasas de cambio
- ➕ Soporte para monedas personalizadas
- 📊 Historial de conversiones
- 📱 Diseño responsive

## 🛠️ Requisitos Previos

- 🌐 Navegador web moderno


## 📝 Cómo Usar

### 💸 Realizar una Conversión

1. ✍️ Escribe tu "Nombre" para guardarlo en el storage para proximos ingresos.
2. 🤖 Sigue los pasos que te indica el ChatBot:
   - 💰 Ingresa el monto a convertir
   - 🔄 Selecciona la moneda de origen (ej: USD, EUR, ARS)
   - 🎯 Selecciona la moneda de destino
3. ✨ El resultado se mostrará instantáneamente

### 📜 Historial de Conversiones
|
- 💾 Las últimas 5 conversiones se guardan automáticamente
- 📊 Puedes acceder al historial haciendo click en el botón "HISTORIAL"

- ❌ Puedes borrar el historial usando el botón "BORRAR HISTORIAL"
- 🔑 Presiona la tecla ESC para cerrar el panel del historial

### 💰 Monedas Disponibles

- 🔍 Visualiza todas las monedas disponibles haciendo click en el botón "VER MONEDAS"
- 🔑 Presiona la tecla ESC para cerrar el panel de monedas
- 📋 Incluye listado de monedas predeterminadas del sistema
- ⭐ Muestra también las monedas personalizadas que hayas agregado
- 💱 Consulta las tasas de cambio actuales de cada moneda

### ➕ Monedas Personalizadas

1. Para agregar una moneda personalizada:
   - 🆕 Presiona el boton "AGREGAR MONEDA"
   - ✏️ Completa los campos del formulario
     - 🔤 Código de la moneda (3 letras)
     - 📝 Nombre de la moneda
     - 💱 Tasa de cambio respecto al USD

## 🔄 Actualizaciones Automáticas

Las tasas de cambio se actualizan automáticamente para mantener los valores actualizados:

- 📍 El estado de la última actualización se muestra en la esquina superior izquierda, incluyendo fecha y hora
- ⏱️ Las actualizaciones ocurren:
  - Automáticamente cada hora mientras el chat está abierto
  - Al cerrar y volver a abrir la aplicación

## 📌 Notas Adicionales

- ⚡ La aplicación utiliza tasas de cambio en tiempo real
- 💾 Las monedas personalizadas se guardan localmente en tu navegador
- 📊 El historial de conversiones se mantiene entre sesiones

---

## 🚀 Iniciar el Servidor

Para iniciar el servidor estático y ejecutar la aplicación localmente:

1. 📦 Asegúrate de tener todas las dependencias instaladas:
   ```
   npm install
   ```

2. 🚀 Inicia el servidor con:
   ```
   npm start
   ```

3. 🌐 Abre tu navegador y visita `http://localhost:3001`
   

> 💡 El puerto predeterminado es 3001, pero puedes modificarlo en el archivo `server.js` si necesitas usar un puerto diferente.

---

📚 Se utilizó SASS para compilar el CSS y usar este proyecto para aplicar lo aprendido en el curso de Desarrollo Web
