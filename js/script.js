// --- GLOBAL STATE ---
let currentExpression = "";
let lastButtonType = "";
let memory = 0;
let isMemorySet = false;
let calculatorMode = "basic"; // Can be "basic" or "advanced"
let currentTheme = "dark"; // Can be "dark" or "light"
const calculationHistory = [];
const MAX_HISTORY_LENGTH = 10;

const BASIC_CALC_WIDTH_PX = "320px";
const ADVANCED_CALC_WIDTH_PX = "460px";

const THEME_ICON_DARK_MODE = "💡";
const THEME_ICON_LIGHT_MODE = "💡"; // You can use a different icon for light mode, e.g., "☀️"


// --- DISPLAY FUNCTION ---
function updateDisplay() {
    const displayElement = document.getElementById("display");
    const memoryIndicatorElement = document.getElementById("memoryIndicator");

    if (displayElement) {
        let textToShow = currentExpression;
        if (currentExpression === "" && lastButtonType !== "operator_pending_number") {
            textToShow = "0";
        }
        const isResultOrSingleNumber = lastButtonType === "equals" || (!isNaN(parseFloat(textToShow)) && !textToShow.includes(" ") && !textToShow.includes("**"));
        if (isResultOrSingleNumber && textToShow.length > 15 && parseFloat(textToShow) !== 0) {
            displayElement.value = parseFloat(textToShow).toPrecision(10);
        } else {
            displayElement.value = textToShow;
        }
    }

    if (memoryIndicatorElement) {
        memoryIndicatorElement.style.display = (calculatorMode === "advanced" && isMemorySet) ? "inline" : "none";
        memoryIndicatorElement.textContent = (calculatorMode === "advanced" && isMemorySet) ? "M" : "";
    }
}

// --- BUTTON CONFIGURATIONS ---
const basicButtonsConfig = [ // 5x4 layout
    { value: THEME_ICON_DARK_MODE, type: "themeToggle" }, { value: "C", type: "clear" },
    { value: "←", type: "backspace" }, { value: "/", type: "operator" },
    { value: "7", type: "number" }, { value: "8", type: "number" },
    { value: "9", type: "number" }, { value: "*", type: "operator" },
    { value: "4", type: "number" }, { value: "5", type: "number" },
    { value: "6", type: "number" }, { value: "-", type: "operator" },
    { value: "1", type: "number" }, { value: "2", type: "number" },
    { value: "3", type: "number" }, { value: "+", type: "operator" },
    { value: "Adv", type: "modeSwitch", data: { targetMode: "advanced"} }, { value: "0", type: "number" },
    { value: ".", type: "number" }, { value: "=", type: "equals" }
];

const advancedButtonsConfig = [ // For Desktop Advanced (6 columns layout)
    { value: THEME_ICON_DARK_MODE, type: "themeToggle" }, { value: "C", type: "clear" }, { value: "←", type: "backspace" }, { value: "/", type: "operator" },
    { value: "√", type: "squareRoot" }, { value: "1/x", type: "reciprocal" },
    { value: "7", type: "number" }, { value: "8", type: "number" }, { value: "9", type: "number" }, { value: "*", type: "operator" },
    { value: "x^y", type: "powerOperator" }, { value: "x²", type: "square" },
    { value: "4", type: "number" }, { value: "5", type: "number" }, { value: "6", type: "number" }, { value: "-", type: "operator" },
    { value: "+/-", type: "signKey" }, { value: "%", type: "percentage" },
    { value: "1", type: "number" }, { value: "2", type: "number" }, { value: "3", type: "number" }, { value: "+", type: "operator" },
    { value: "MC", type: "memoryClear" }, { value: "MR", type: "memoryRecall" },
    { value: "Std", type: "modeSwitch", data: { targetMode: "basic"} }, { value: "0", type: "number" },
    { value: ".", type: "number" }, { value: "=", type: "equals" },
    { value: "MS", type: "memoryStore" }, { value: "9%", type: "gst9PercentKey" }
];

// Configuration for Advanced Mode on Mobile based on SKETCH
// Contains 24 auto-flow buttons for Rows 1-6, then 6 specially placed buttons for Rows 7-8.
// "√" is auto-flowed into R1C4. "9%" is ID'd for placement in R8C2.
const advancedMobileButtonsConfig_Sketch = [
    // Auto-flow buttons for Rows 1-6 of the sketch
    // Row 1 (Sketch)
    { value: "MS", type: "memoryStore" }, { value: "MR", type: "memoryRecall" },
    { value: "MC", type: "memoryClear" }, { value: "√", type: "squareRoot" }, // "√" auto-flows here
    // Row 2 (Sketch)
    { value: "x²", type: "square" }, { value: "x^y", type: "powerOperator" },
    { value: "1/x", type: "reciprocal" }, { value: "%", type: "percentage" },
    // Row 3 (Sketch)
    { value: THEME_ICON_DARK_MODE, type: "themeToggle" }, { value: "C", type: "clear" },
    { value: "←", type: "backspace" }, { value: "/", type: "operator" },
    // Row 4 (Sketch)
    { value: "7", type: "number" }, { value: "8", type: "number" },
    { value: "9", type: "number" }, { value: "*", type: "operator" },
    // Row 5 (Sketch)
    { value: "4", type: "number" }, { value: "5", type: "number" },
    { value: "6", type: "number" }, { value: "-", type: "operator" },
    // Row 6 (Sketch)
    { value: "1", type: "number" }, { value: "2", type: "number" },
    { value: "3", type: "number" }, { value: "+", type: "operator" },

    // Specially placed buttons for Rows 7-8 (CSS will position these using their IDs)
    { value: "Std", type: "modeSwitch", data: { targetMode: "basic"}, id: "calc-btn-std" },
    { value: "0", type: "number", id: "calc-btn-zero" },
    { value: ".", type: "number", id: "calc-btn-dot" },
    { value: "=", type: "equals", id: "calc-btn-equals" },
    { value: "+/-", type: "signKey", id: "calc-btn-plus-minus" }, // Will be placed by CSS (R8C3 sketch)
    { value: "9%", type: "gst9PercentKey", id: "calc-btn-gst9" }  // Will be placed by CSS (R8C2 sketch)
    // Total 24 (auto-flow) + 6 (ID'd) = 30 buttons
];


// --- UI CREATION ---
function createCalculator() {
    const calculatorContainer = document.getElementById("calculator");
    if (!calculatorContainer) { console.error("#calculator element not found. Aborting."); return; }

    const existingButtonsGrid = calculatorContainer.querySelector(".buttons-grid");

    if (existingButtonsGrid) { existingButtonsGrid.classList.add("grid-fade-out"); }
    calculatorContainer.classList.add("calculator-morph-out");

    setTimeout(() => {
        const currentContainer = document.getElementById("calculator");
        if (!currentContainer) { console.error("#calculator disappeared during timeout. Aborting rebuild."); return; }

        if (existingButtonsGrid) {
            existingButtonsGrid.remove();
        } else {
            currentContainer.innerHTML = '';
            const title = document.createElement("h2");
            title.innerText = "Calculator";
            currentContainer.appendChild(title);
            const displayArea = document.createElement("div"); displayArea.className = "display-area-wrapper"; currentContainer.appendChild(displayArea);
            const displayElement = document.createElement("input"); displayElement.id = "display"; displayElement.disabled = true; displayArea.appendChild(displayElement);
            const memoryIndicator = document.createElement("span"); memoryIndicator.id = "memoryIndicator"; displayArea.appendChild(memoryIndicator);
        }

        let activeButtonsConfig;
        const buttonsGrid = document.createElement("div");
        buttonsGrid.className = "buttons-grid";

        const currentThemeIcon = currentTheme === "dark" ? THEME_ICON_DARK_MODE : THEME_ICON_LIGHT_MODE;
        const isMobileView = window.innerWidth <= 520;

        if (calculatorMode === "basic") {
            currentContainer.style.width = BASIC_CALC_WIDTH_PX;
            // For basic mode, CSS will handle 4 columns on mobile, JS can set for desktop if necessary
            // Or rely on CSS to set desktop basic to 4 columns too.
            // To be safe, JS can set it for desktop if basic mode is always 4 columns.
            if (!isMobileView) { // Desktop basic
                buttonsGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
            } // Mobile basic uses CSS's !important for 4 columns
            activeButtonsConfig = basicButtonsConfig.map(btn =>
                btn.type === "themeToggle" ? {...btn, value: currentThemeIcon } : btn
            );
            currentContainer.classList.remove("advanced-mode-active");
        } else { // Advanced mode
            currentContainer.style.width = ADVANCED_CALC_WIDTH_PX; // CSS media query will override for mobile
            currentContainer.classList.add("advanced-mode-active");

            if (isMobileView) {
                // console.log("Using Sketch-based advancedMobileButtonsConfig for mobile view.");
                activeButtonsConfig = advancedMobileButtonsConfig_Sketch.map(btn =>
                    btn.type === "themeToggle" ? {...btn, value: currentThemeIcon } : btn
                );
                // CSS will handle the 4-column, 8-row grid and specific placements for this mode
            } else { // Desktop advanced
                // console.log("Using standard advancedButtonsConfig for desktop view.");
                activeButtonsConfig = advancedButtonsConfig.map(btn =>
                    btn.type === "themeToggle" ? {...btn, value: currentThemeIcon } : btn
                );
                buttonsGrid.style.gridTemplateColumns = "repeat(6, 1fr)"; // Desktop advanced is 6 columns
            }
        }
        currentContainer.appendChild(buttonsGrid);

        activeButtonsConfig.forEach(btnConfig => {
            if (btnConfig.type === "emptySlot") { const emptyDiv = document.createElement("div"); buttonsGrid.appendChild(emptyDiv); return; }
            const button = document.createElement("button"); button.innerText = btnConfig.value; button.className = "btn";

            if (btnConfig.id) { // Assign ID if present in config
                button.id = btnConfig.id;
            }

            const typeToClass = {
                operator: "btn-operator", equals: "btn-equals", clear: "btn-clear",
                modeSwitch: "btn-mode-switch", themeToggle: "btn-theme-control",
                memoryClear: "btn-memory", memoryRecall: "btn-memory", memoryStore: "btn-memory",
                squareRoot: "btn-operator", square: "btn-operator", reciprocal: "btn-operator",
                percentage: "btn-operator", powerOperator: "btn-operator",
                gst9PercentKey: "btn-gst-style", signKey: "btn-sign-key-style", backspace: "btn-backspace",
            };
            if (typeToClass[btnConfig.type]) { button.classList.add(typeToClass[btnConfig.type]); }

            // Column span logic: apply only if NOT an ID'd button (whose layout is fully CSS controlled)
            // AND if data.span exists.
            if (btnConfig.data && btnConfig.data.span && !btnConfig.id) {
                button.style.gridColumn = `span ${btnConfig.data.span}`;
            }
            // For buttons with an ID, their grid placement (including any column or row spans)
            // is expected to be handled entirely by CSS grid-area or grid-column/row properties.

            button.onclick = () => {
                button.classList.add("btn-press-animation");
                button.addEventListener("animationend", () => button.classList.remove("btn-press-animation"), { once: true });
                handleButtonClick(btnConfig);
            };
            buttonsGrid.appendChild(button);
        });

        isMemorySet = (memory !== 0);
        updateDisplay();

        buttonsGrid.classList.add("grid-fade-in");
        currentContainer.classList.remove("calculator-morph-out");
        currentContainer.classList.add("calculator-morph-in");

        const morphInTransitionEndHandler = (event) => {
            if (event.target === currentContainer && (event.propertyName.includes('transform') || event.propertyName.includes('opacity'))) {
                currentContainer.classList.remove("calculator-morph-in");
                const grid = currentContainer.querySelector(".buttons-grid");
                if (grid) grid.classList.remove("grid-fade-in");
            }
        };
        currentContainer.addEventListener('transitionend', morphInTransitionEndHandler, { once: true });

    }, 250);
}

// --- HELPER FUNCTIONS ---
// ... (extractLastNumber and applyUnaryMath functions are unchanged)
function extractLastNumber(expression) {
    if (expression === "Error" || expression === "") return { numStr: "", baseExpr: "" };
    const match = expression.match(/^(.*?)(\s[+\-*/]\s|\s\*\*\s)?(-?\d*\.?\d+(?:e[+\-]?\d+)?)$/i);
    if (match) {
        const basePart = match[1] || "";
        const operatorPart = match[2] || "";
        return { numStr: match[3], baseExpr: basePart + operatorPart };
    }
    if (!isNaN(parseFloat(expression)) && (expression.match(/[+\-*/]|\*\*/g) || []).length <= (expression.startsWith("-") ? 1 : 0) ) {
        return { numStr: expression, baseExpr: "" };
    }
    return { numStr: "", baseExpr: expression };
}

function applyUnaryMath(mathFunction, errorCheckFunction) {
    if (currentExpression === "Error" || currentExpression === "") return;
    try {
        let valueToOperateOnStr = currentExpression;
        let baseExpressionForResult = "";
        const segments = currentExpression.split(/(\s[+\-*/]\s|\s\*\*\s)/);
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";

        if (segments.length > 1 && !isNaN(parseFloat(lastSegment)) && lastSegment.trim() !== "") {
            valueToOperateOnStr = segments.pop();
            baseExpressionForResult = segments.join("");
        } else if (isNaN(parseFloat(valueToOperateOnStr)) && valueToOperateOnStr !== "-") {
            let evaluatedPrefix;
            try { evaluatedPrefix = eval(currentExpression); } catch(e) { /* ignore */ }
            if (typeof evaluatedPrefix === 'number' && !isNaN(evaluatedPrefix)) {
                valueToOperateOnStr = evaluatedPrefix.toString();
            } else { currentExpression = "Error"; updateDisplay(); return; }
            baseExpressionForResult = "";
        } else if (valueToOperateOnStr === "-") { valueToOperateOnStr = "0"; }

        const valueToOperateOn = parseFloat(valueToOperateOnStr);
        if (isNaN(valueToOperateOn)) { currentExpression = "Error"; updateDisplay(); return; }

        if (errorCheckFunction && errorCheckFunction(valueToOperateOn)) {
            currentExpression = "Error";
        } else {
            const result = mathFunction(valueToOperateOn);
            if (isNaN(result) || !isFinite(result)) { currentExpression = "Error"; }
            else { currentExpression = baseExpressionForResult + result.toString(); }
        }
    } catch (e) { currentExpression = "Error"; }
    lastButtonType = "equals";
}

// --- CORE BUTTON CLICK HANDLER ---
// ... (This entire function is unchanged)
function handleButtonClick(btnConfig) {
    const { value: buttonValue, type: buttonType, data } = btnConfig;

    if (currentExpression === "Error" && buttonType !== "clear" && buttonType !== "modeSwitch" && buttonType !== "themeToggle") {
        currentExpression = "";
    }
    if (lastButtonType === "equals" &&
        buttonType !== "operator" && buttonType !== "powerOperator" &&
        !buttonType.startsWith("memory") && buttonType !== "signKey" &&
        buttonType !== "modeSwitch" && buttonType !== "themeToggle" &&
        !["squareRoot", "square", "reciprocal", "percentage", "gst9PercentKey"].includes(buttonType) ) {
        currentExpression = "";
    }

    switch (buttonType) {
        case "number":
            currentExpression = String(currentExpression);
            if (buttonValue === ".") {
                const segments = currentExpression.split(/(\s[+\-*/]\s|\s\*\*\s)/);
                let currentNumSegment = segments.length > 0 ? segments[segments.length - 1] : "";
                if (!currentNumSegment) currentNumSegment = "";
                if (currentNumSegment === "" && (currentExpression === "" || currentExpression.endsWith(" ") || currentExpression === "-")) {
                    currentExpression += (currentExpression === "-" ? "0." : "0.");
                } else if (!currentNumSegment.includes(".")) { currentExpression += "."; }
            } else {
                if (currentExpression === "0" && buttonValue !== "0") { currentExpression = buttonValue; }
                else if (currentExpression === "-0" && buttonValue !== "0"){ currentExpression = "-" + buttonValue; }
                else { currentExpression += buttonValue; }
            }
            lastButtonType = "number";
            break;

        case "operator":
        case "powerOperator":
            let opToAdd = (buttonType === "powerOperator") ? "**" : buttonValue;
            currentExpression = String(currentExpression).trim();
            if (currentExpression === "" && opToAdd !== "-") { currentExpression = "0" + ` ${opToAdd} `; }
            else if (currentExpression === "" && opToAdd === "-") { currentExpression = "-"; }
            else if (currentExpression === "-" && opToAdd !== "-") { currentExpression = "-0" + ` ${opToAdd} `; }
            else if (currentExpression.endsWith(" **") && (opToAdd === "+" || opToAdd === "*" || opToAdd === "/")) { return; }
            else if (currentExpression.endsWith(" ") || currentExpression.endsWith("**")) {
                const endsWithDoubleStarSpace = currentExpression.endsWith(" ** ");
                const endsWithOpSpace = currentExpression.endsWith(" ");
                if (endsWithDoubleStarSpace) { currentExpression = currentExpression.slice(0, -4) + ` ${opToAdd} `; }
                else if (endsWithOpSpace && currentExpression.slice(-3).match(/\s[+\-*/]\s/)) { currentExpression = currentExpression.slice(0, -3) + ` ${opToAdd} `; }
                else { currentExpression += ` ${opToAdd} `; }
            } else { currentExpression += ` ${opToAdd} `; }
            lastButtonType = "operator";
            break;

        case "equals":
            if (currentExpression === "Error" || currentExpression === "") { /* No action */ }
            else {
                let expressionToEvaluate = String(currentExpression).trim();
                const trimmedExpr = expressionToEvaluate.trim();
                if (trimmedExpr.endsWith(" ") && (trimmedExpr.slice(-2,-1).match(/[+\-*/]/) || trimmedExpr.endsWith(" **"))) {
                    const parts = trimmedExpr.split(/(\s[+\-*/]\s|\s\*\*\s)/);
                    let lastValidOperand = "";
                    for(let i = parts.length - 1; i >= 0; i--) {
                        if(parts[i] && !isNaN(parseFloat(parts[i])) && parts[i].trim() !== "" && !parts[i].trim().match(/[+\-*/]$/) && !parts[i].trim().endsWith("**")) {
                            lastValidOperand = parts[i].trim(); break;
                        }
                    }
                    if (lastValidOperand) { expressionToEvaluate += lastValidOperand; }
                    else if (trimmedExpr === "-") { expressionToEvaluate = "0"; }
                    else { currentExpression = "Error"; }
                }

                if (currentExpression !== "Error") {
                    try {
                        expressionToEvaluate = expressionToEvaluate.replace(/(\s[+\-*/]\s|\s\*\*\s)$/, "").trim();
                        if(expressionToEvaluate === "" || expressionToEvaluate === "-") expressionToEvaluate = "0";
                        const result = eval(expressionToEvaluate);
                        calculationHistory.unshift({ expression: expressionToEvaluate, result: result.toString() });
                        if (calculationHistory.length > MAX_HISTORY_LENGTH) calculationHistory.pop();
                        if (isNaN(result) || !isFinite(result)) { currentExpression = "Error"; }
                        else { currentExpression = result.toString(); }
                    } catch (e) { currentExpression = "Error"; }
                }
            }
            lastButtonType = "equals";
            break;

        case "clear": currentExpression = ""; lastButtonType = "clear"; break;
        case "backspace":
            currentExpression = String(currentExpression);
            if (currentExpression === "Error") { currentExpression = ""; }
            else if (currentExpression.endsWith(" ** ")) { currentExpression = currentExpression.slice(0, -4); }
            else if (currentExpression.endsWith(" ")) { currentExpression = currentExpression.slice(0, -3); }
            else if (currentExpression.length > 0) { currentExpression = currentExpression.slice(0, -1); }
            if (currentExpression.endsWith(" ") || currentExpression.endsWith("**")) { lastButtonType = "operator"; }
            else if (currentExpression === "" || currentExpression === "-") { lastButtonType = (currentExpression === "") ? "clear" : "number"; }
            else if (!isNaN(parseFloat(extractLastNumber(currentExpression).numStr))) { lastButtonType = "number"; }
            else { lastButtonType = "backspace"; }
            break;
        case "signKey":
            if (lastButtonType === "equals" && !isNaN(parseFloat(currentExpression))) {
                if (currentExpression.startsWith("-")) { currentExpression = currentExpression.substring(1); }
                else if (parseFloat(currentExpression) !== 0) { currentExpression = "-" + currentExpression; }
            } else {
                const { numStr, baseExpr } = extractLastNumber(currentExpression);
                if (numStr !== "" && !isNaN(parseFloat(numStr))) {
                    let toggledNumStr = numStr;
                    if (numStr.startsWith("-")) { toggledNumStr = numStr.substring(1); }
                    else { if (parseFloat(numStr) !== 0 || numStr.includes(".")) { toggledNumStr = "-" + numStr; }
                    else if (numStr === "0" && baseExpr + numStr === currentExpression) { currentExpression = baseExpr + "-"; lastButtonType = "operator"; updateDisplay(); return; }
                    }
                    currentExpression = baseExpr + toggledNumStr;
                } else if (currentExpression === "" || currentExpression === "0") { currentExpression = "-"; lastButtonType = "operator"; updateDisplay(); return; }
                else if (currentExpression.endsWith(" ") || currentExpression.endsWith("** ")) { currentExpression += "-"; lastButtonType = "operator"; updateDisplay(); return; }
            }
            const { numStr: finalNumStr } = extractLastNumber(currentExpression);
            if (finalNumStr !== "" && !isNaN(parseFloat(finalNumStr))) { lastButtonType = "number"; }
            else if (currentExpression.endsWith("-")) { lastButtonType = "operator"; }
            break;
        case "squareRoot": applyUnaryMath(value => Math.sqrt(value), value => value < 0); break;
        case "square": applyUnaryMath(value => value * value); break;
        case "reciprocal": applyUnaryMath(value => 1 / value, value => value === 0); break;
        case "percentage":
            if (currentExpression === "Error" || currentExpression === "") break;
            try {
                const { numStr: lastNumStr, baseExpr: exprBase } = extractLastNumber(currentExpression);
                if (lastNumStr !== "") {
                    const lastNum = parseFloat(lastNumStr);
                    if (exprBase.trim().endsWith(" ") && exprBase.length > 2) {
                        const op = exprBase.trim().slice(-1);
                        const firstNumStr = extractLastNumber(exprBase.trim().slice(0, -2).trim()).numStr;
                        const firstNum = parseFloat(firstNumStr);
                        if (!isNaN(firstNum) && !isNaN(lastNum)) {
                            let percentValPart;
                            if (op === "+" || op === "-") { percentValPart = firstNum * (lastNum / 100); }
                            else { percentValPart = lastNum / 100; }
                            currentExpression = exprBase + percentValPart.toString();
                        } else { currentExpression = "Error"; }
                    } else if (!isNaN(lastNum)) { currentExpression = (lastNum / 100).toString(); }
                    else { currentExpression = "Error"; }
                } else { currentExpression = "Error"; }
            } catch (e) { currentExpression = "Error"; }
            lastButtonType = "number";
            break;
        case "gst9PercentKey":
            if (currentExpression === "Error" || currentExpression === "") break;
            try {
                const { numStr, baseExpr } = extractLastNumber(currentExpression);
                let valueToCalcGSTOn;
                if (numStr !== "" && !isNaN(parseFloat(numStr))) {
                    valueToCalcGSTOn = parseFloat(numStr);
                    if (!isNaN(valueToCalcGSTOn)) {
                        const gstValue = valueToCalcGSTOn * 0.09;
                        currentExpression = baseExpr + gstValue.toString();
                    } else { currentExpression = "Error"; }
                } else {
                    let evaluatedExpr;
                    try { evaluatedExpr = eval(currentExpression.trim() === "-" ? "0" : currentExpression.trim()); } catch(e) {evaluatedExpr = NaN;}
                    if (!isNaN(evaluatedExpr)) { currentExpression = (evaluatedExpr * 0.09).toString(); }
                    else { currentExpression = "Error"; }
                }
            } catch (e) { currentExpression = "Error"; }
            lastButtonType = "number";
            break;
        case "memoryClear": memory = 0; isMemorySet = false; lastButtonType = "memory"; break;
        case "memoryRecall":
            if (isMemorySet) {
                const memoryStr = memory.toString();
                if (currentExpression === "" || currentExpression.endsWith(" ") || currentExpression === "-" || currentExpression.endsWith("** ")) {
                    currentExpression += memoryStr;
                } else {
                    const { numStr: lastN, baseExpr: baseE } = extractLastNumber(currentExpression);
                    if (lastN !== "" && !isNaN(parseFloat(lastN)) && (baseE + lastN === currentExpression || baseE === "")) {
                        currentExpression = baseE + memoryStr;
                    } else {
                        if (lastButtonType === "number" && !currentExpression.includes(" ")) { currentExpression = memoryStr; }
                        else { currentExpression += ` ${memoryStr} `; }
                    }
                }
                lastButtonType = "number";
            }
            break;
        case "memoryStore":
            let valToStore;
            try {
                let exprToEvalForMS = String(currentExpression).trim();
                if (exprToEvalForMS === "" || exprToEvalForMS === "Error") { valToStore = 0; }
                else {
                    if (exprToEvalForMS.match(/(\s[+\-*/]\s|\s\*\*\s)$/)) {
                        exprToEvalForMS = exprToEvalForMS.replace(/(\s[+\-*/]\s|\s\*\*\s)$/, "").trim();
                    }
                    if (exprToEvalForMS === "" || exprToEvalForMS === "-") { valToStore = 0; }
                    else { valToStore = eval(exprToEvalForMS); }
                }
                if (isNaN(valToStore) || !isFinite(valToStore)) {
                    const lastNumFromExpr = extractLastNumber(String(currentExpression)).numStr;
                    valToStore = parseFloat(lastNumFromExpr);
                    if (isNaN(valToStore) || !isFinite(valToStore)) { valToStore = 0; }
                }
            } catch (e) {
                const lastNumFromExprOnError = extractLastNumber(String(currentExpression)).numStr;
                valToStore = parseFloat(lastNumFromExprOnError);
                if (isNaN(valToStore) || !isFinite(valToStore)) { valToStore = 0; }
            }
            memory = valToStore;
            isMemorySet = !isNaN(memory) && isFinite(memory) ;
            if(!isMemorySet) memory = 0;
            lastButtonType = "memory";
            break;
        case "memoryAdd":
            let valForMPlusArith;
            try {
                let exprToEvalForMPlus = String(currentExpression).trim();
                if (exprToEvalForMPlus === "" || exprToEvalForMPlus === "Error") exprToEvalForMPlus = "0";
                if (exprToEvalForMPlus.match(/(\s[+\-*/]\s|\s\*\*\s)$/)) {
                    exprToEvalForMPlus = exprToEvalForMPlus.replace(/(\s[+\-*/]\s|\s\*\*\s)$/, "").trim();
                }
                if (exprToEvalForMPlus === "") exprToEvalForMPlus = "0";
                valForMPlusArith = eval(exprToEvalForMPlus);
                if (isNaN(valForMPlusArith) || !isFinite(valForMPlusArith)) { valForMPlusArith = parseFloat(extractLastNumber(currentExpression).numStr) || 0;}
            } catch { valForMPlusArith = parseFloat(extractLastNumber(currentExpression).numStr) || 0;}
            valForMPlusArith = (isNaN(valForMPlusArith) || !isFinite(valForMPlusArith)) ? 0 : valForMPlusArith;
            memory += valForMPlusArith;
            if (!isNaN(memory) && isFinite(memory)) isMemorySet = true;
            else { isMemorySet = false; memory = 0; }
            const tempCE_Mplus = currentExpression;
            currentExpression = `M: ${memory}`; updateDisplay();
            setTimeout(() => { currentExpression = tempCE_Mplus; updateDisplay(); }, 1500);
            lastButtonType = "memory";
            break;

        case "themeToggle":
            currentTheme = (currentTheme === "dark") ? "light" : "dark";
            document.body.className = currentTheme === "light" ? "light-theme" : "";
            localStorage.setItem("calculatorTheme", currentTheme);
            const themeBtnIcon = currentTheme === "dark" ? THEME_ICON_DARK_MODE : THEME_ICON_LIGHT_MODE;
            document.querySelectorAll('.btn-theme-control').forEach(b => { b.innerText = themeBtnIcon; });
            return;
        case "modeSwitch":
            calculatorMode = data.targetMode;
            lastButtonType = "modeSwitch";
            createCalculator();
            return;
        default: console.warn("Unhandled button type:", buttonType);
    }
    updateDisplay();
}

// Keyboard input handling
document.addEventListener("keydown", (event) => {
    const key = event.key;
    const isMobile = window.innerWidth <= 520;
    // Ensure correct config is used for keyboard based on current view
    let activeConfig = (calculatorMode === "basic") ? basicButtonsConfig :
        (isMobile && calculatorMode === "advanced") ? advancedMobileButtonsConfig_Sketch : advancedButtonsConfig;
    let matchedBtnConfig = null;
    let tempButtonValue = "", tempButtonType = "";

    if (key === "Backspace") { event.preventDefault(); tempButtonValue = "←"; tempButtonType = "backspace";}
    else if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) { tempButtonValue = key; tempButtonType = "number";}
    else if (key === ".") { tempButtonValue = key; tempButtonType = "number";}
    else if (key === "+") { tempButtonValue = "+"; tempButtonType = "operator";}
    else if (key === "-") { tempButtonValue = "-"; tempButtonType = "operator";}
    else if (key === "*") { tempButtonValue = "*"; tempButtonType = "operator";}
    else if (key === "/") { event.preventDefault(); tempButtonValue = "/"; tempButtonType = "operator";}
    else if (key === "%") { matchedBtnConfig = activeConfig.find(b => b.value === "%" && b.type === "percentage"); }
    else if (key === "Enter" || key === "=") { event.preventDefault(); tempButtonValue = "="; tempButtonType = "equals";}
    else if (key === "Escape") { tempButtonValue = "C"; tempButtonType = "clear";}
    else if (key === "^") { matchedBtnConfig = activeConfig.find(b => b.value === "x^y" && b.type === "powerOperator"); }

    if (!matchedBtnConfig && tempButtonValue !== "") {
        let potentialMatches = activeConfig.filter(b => b.value === tempButtonValue);
        if (potentialMatches.length > 1 && tempButtonType) {
            matchedBtnConfig = potentialMatches.find(b => b.type === tempButtonType);
        } else if (potentialMatches.length === 1) { matchedBtnConfig = potentialMatches[0]; }
        if (!matchedBtnConfig && tempButtonValue && tempButtonType) {
            matchedBtnConfig = { value: tempButtonValue, type: tempButtonType, data: {} };
        }
    }

    if(matchedBtnConfig && matchedBtnConfig.type) {
        const onscreenButton = Array.from(document.querySelectorAll('.btn')).find(btn_dom_element => {
            if (matchedBtnConfig.id) { // Match by ID if available for sketch layout special buttons
                return btn_dom_element.id === matchedBtnConfig.id;
            }
            if (matchedBtnConfig.type === "themeToggle") { return btn_dom_element.classList.contains('btn-theme-control'); }
            return btn_dom_element.innerText.trim() === String(matchedBtnConfig.value).trim();
        });
        if (onscreenButton) {
            onscreenButton.classList.add("btn-press-animation");
            onscreenButton.addEventListener("animationend", () => { onscreenButton.classList.remove("btn-press-animation"); }, { once: true });
        }
        handleButtonClick(matchedBtnConfig);
    }
});

// Run the calculator setup
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("calculatorTheme");
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.className = currentTheme === "light" ? "light-theme" : "";
    }
    try {
        createCalculator();
        const calculatorElement = document.getElementById("calculator");
        if (calculatorElement && !calculatorElement.classList.contains('already-animated')) {
            calculatorElement.classList.add('initial-load-animation');
            calculatorElement.addEventListener('animationend', (e) => {
                if(e.animationName === 'fadeInScalePageLoad') {
                    calculatorElement.classList.remove('initial-load-animation');
                    calculatorElement.classList.add('already-animated');
                }
            }, { once: true });
        }
    } catch (e) { console.error("Error during initial createCalculator:", e); }
});