
# 🧮 Sleek Calculator

Welcome to Sleek Calculator – a modern, web-based calculator built with clean HTML, stylish CSS, and robust JavaScript. It boasts a responsive design, dynamic dark/light themes, and a range of basic to advanced mathematical functions. Experience an intuitive interface with visually appealing, smooth animations.

## ✨ Core Features

* ✅ **Basic Arithmetic:** Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`).


* 🧠 **Advanced Operations:**
  * Percentage (`%`)
  * Square (`x²`) & Square Root (`√`)
  * Power (`x^y`) & Reciprocal (`1/x`)
  * Sign Toggle (`+/-`)
  * Custom GST Calculation (`9%`)


* 💾 **Memory Functions:** Store (`MS`), Recall (`MR`), Clear (`MC`).


* 🖥️ **Dynamic Display:**
  * Clear, easy-to-read output for expressions and results.
  * Smart precision handling for long numbers.
  * Visual memory status indicator ('M').


* 🎨 **User Interface & Experience:**
  * Dual Mode: Switch between Basic and Advanced layouts.
  * 📱 **Tailored Mobile Advanced View:** Features a custom, sketch-based button layout for the Advanced Calculator specifically designed for intuitive use on smaller screens.
  * 🌗 Dynamic Theming: Toggle Dark/Light modes (preference saved via `localStorage`).
  * 📱 Responsive Design: Adapts seamlessly to various screen sizes beyond the specific advanced mobile layout.
  * 💫 Smooth Animations: For button interactions and mode transitions.
  

* ⌨️ **Input & Control:**
  * Intuitive on-screen button input.
  * Keyboard support for most operations.
  * Essential Clear (`C`) and Backspace (`←`) functions.
  

* 📜 **Calculation History:** Internally tracks the last 10 calculations (viewable in the browser console).

## 💻 Tech Stack

* 🌐 **HTML5:** Provides the foundational structure of the web page.
* 🎨 **CSS3:** Powers all styling, layout, custom themes, and animations.
  * *(Note: May utilize Bootstrap 5.3 for general page layout if integrated beyond the calculator itself.)*
* ⚙️ **JavaScript (ES6+):** Drives the core logic, calculations, DOM manipulation, event handling, and theme management.

## 📁 Folder Structure

The project is organized as follows:

```text
project-root/
├── css/
│   └── style.css         # Custom CSS for styling and animations
├── img/
│   └── favicon.png       # Browser tab icon
├── js/
│   └── script.js         # Core JavaScript logic and functionality
├── index.html            # Main HTML entry point for the application
└── README.md             # Project overview and documentation (this file)  
```
## 🔮 Future Upgrades & Enhancements

Sleek Calculator is set for an exciting evolution! Here’s a look at planned improvements:

### ⚙️ Core Functionality Boosters
* **Parentheses & Expressions:** Implement full `()` support for complex mathematical expressions.
* **Advanced Math Suite:** Add comprehensive trigonometric functions (with angle modes), logarithms, and exponentials.
* **Enhanced Memory Operations:** Introduce M+, M-, and potentially multiple memory slots for greater flexibility.
* **Practical Conversions:** Integrate unit converters (length, mass, temp) and real-time currency conversion.
* **Quick Access Tools:** Include an "Ans" key for recalling the last result and quick access to constants like π and e.

### 🖼️ UI & UX Elegance
* **Interactive Calculation History:** Display a clickable history log directly within the calculator UI for easy review and reuse.
* **Superior Number Readability:** Implement thousands separators and allow user-configurable decimal precision.
* **Smarter Error Handling:** Provide specific, user-friendly messages for calculation errors (e.g., "Division by zero").
* **Theme Personalization:** Offer more theme choices or options for users to customize accent colors.
* **Engaging Sensory Feedback:** Introduce optional audio cues for button presses and haptic feedback on compatible devices.

### 🛠️ Advanced & Technical Improvements
* **Versatile Notations & Number Bases:** Full control over scientific notation and support for BIN/OCT/DEC/HEX operations.
* **Robust Fraction Handling:** Enable precise calculations and clear display of fractions.
* **Offline-Ready PWA:** Transform into an installable Progressive Web App for seamless offline functionality.
* **Accessibility (A11y) Excellence:** Commit to WCAG compliance, ensuring full keyboard navigation and screen reader compatibility.
* **Solid Foundations:** Implement comprehensive unit and E2E testing, alongside continuous code architecture refinement for stability and scalability.

---
