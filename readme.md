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
    * 🌗 Dynamic Theming: Toggle Dark/Light modes (preference saved via `localStorage`).
    * 📱 Responsive Design: Adapts seamlessly to various screen sizes.
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

## 🚀 Setup and Usage

1.  📥 **Grab the Code:** Download or clone the project repository to your local machine.
2.  🖼️ **Verify Assets:** Ensure the `favicon.png` is correctly placed within the `img/` directory.
3.  ▶️ **Launch Time!** Simply open `index.html` in your favorite modern web browser.

And just like that – your Sleek Calculator is ready to crunch numbers!

## 🔮 Future Upgrades & Enhancements

This calculator is already a powerhouse, but here’s a glimpse into its exciting future potential:

### ⚙️ Core Functionality Boosters
* 💡 **Parentheses `()` Power:** Empower users with grouping for precise calculation order.
* 💡 **Trigonometric Trio & Inverses:** Implement `sin`, `cos`, `tan`, plus `asin`, `acos`, `atan`.
* 💡 **Angle Mode Mastery:** Add `DEG` (Degrees), `RAD` (Radians), `GRAD` (Gradians) toggles.
* 💡 **Logarithmic Leaps:** Include `log` (base 10), `ln` (natural log), `10^x`, and `e^x`.
* 💡 **Factorial `n!` Fun:** Introduce a dedicated button for factorial calculations.
* 💡 **Math Constants on Tap:** Quick access buttons for π (Pi) and e (Euler's number).
* 💡 **"Ans" Recall Key:** A smart key to instantly reuse the previous calculation's result.
* 💡 **Full Memory Suite (M+/M-):** Implement dedicated `M+` (Memory Add) and `M-` (Memory Subtract) buttons.

### 🖼️ UI & UX Elegance
* 💡 **Interactive History Log:** Display calculation history within the UI for easy review and reuse.
* 💡 **Crystal Clear Numbers:** Implement thousands separators (e.g., `1,000,000`) for superior readability.
* 💡 **Intelligent Error Handling:** Offer specific feedback (e.g., "Oops! Division by zero") beyond a generic "Error."
* 💡 **Effortless Copy & Paste:** Add a "Copy to Clipboard" feature for the display content.
* 💡 **Tactile Audio Cues:** Optional sound feedback for satisfying button clicks.

### 🛠️ Advanced & Technical Marvels
* 💡 **Scientific Notation Command:** Full control to toggle or force scientific notation for input/output.
* 💡 **Number Base Wizardry:** Add functionality for `BIN`, `OCT`, `DEC`, `HEX` conversions and operations.
* 💡 **Fraction Finesse:** Support for inputting, calculating, and beautifully displaying fractions.
* 💡 **PWA Transformation:** Evolve into an installable Progressive Web App for offline access (via manifest & service worker).
* 💡 **Accessibility (A11y) Excellence:** Champion inclusivity with thorough ARIA attributes and flawless keyboard navigation.
* 💡 **Rock-Solid Unit Testing:** Implement comprehensive unit tests for the calculation logic, ensuring enduring accuracy.
* 💡 **Elegant Code Architecture:** Continuously refactor JavaScript for enhanced maintainability and modularity as new features emerge.

---