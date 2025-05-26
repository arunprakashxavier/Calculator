
// --- GLOBAL STATE ---
let currentExpression = "";
let lastButtonType = "";
let memory = 0;
let isMemorySet = false;
let calculatorMode = "basic";
let currentTheme = "dark";
const calculationHistory = [];
const MAX_HISTORY_LENGTH = 10;

const BASIC_CALC_WIDTH_PX = "320px";
const ADVANCED_CALC_WIDTH_PX = "460px";

const THEME_ICON_DARK_MODE = "💡";
const THEME_ICON_LIGHT_MODE = "💡";


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

// --- BUTTON CONFIGURATIONS (ADVANCED LAYOUT MODIFIED) ---
const basicButtonsConfig = [ // 20 buttons, 5x4. All single width.
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

const advancedButtonsConfig = [ // 30 buttons for 5 rows x 6 columns layout.
    // Basic Pad (First 4 columns)                                     | Advanced Panel (Cols 5-6, on the RIGHT)
    // Row 1
    { value: THEME_ICON_DARK_MODE, type: "themeToggle" }, { value: "C", type: "clear" }, { value: "←", type: "backspace" }, { value: "/", type: "operator" },    /* Basic Pad */
    { value: "√", type: "squareRoot" }, /* MODIFIED: Adv Panel Col 5 (now √, was +/-) */ { value: "1/x", type: "reciprocal" }, /* MODIFIED: Adv Panel Col 6 (now 1/x, was √) */
    // Row 2
    { value: "7", type: "number" }, { value: "8", type: "number" }, { value: "9", type: "number" }, { value: "*", type: "operator" },              /* Basic Pad */
    { value: "x^y", type: "powerOperator" }, /* MODIFIED: Adv Panel Col 5 (now x^y, was √) */ { value: "x²", type: "square" }, /* MODIFIED: Adv Panel Col 6 (now x², was %) */
    // Row 3
    { value: "4", type: "number" }, { value: "5", type: "number" }, { value: "6", type: "number" }, { value: "-", type: "operator" },              /* Basic Pad */
    { value: "+/-", type: "signKey" }, /* MODIFIED: Adv Panel Col 5 (now +/-, was 1/x, "right of -") */ { value: "%", type: "percentage" }, /* MODIFIED: Adv Panel Col 6 (now %, was x^y then x²) */
    // Row 4
    { value: "1", type: "number" }, { value: "2", type: "number" }, { value: "3", type: "number" }, { value: "+", type: "operator" },              /* Basic Pad */
    { value: "MC", type: "memoryClear" }, { value: "MR", type: "memoryRecall" }, /* Adv Panel */
    // Row 5
    // MODIFIED: "Std" (mode switch) is now in the Basic Pad section, replacing where "+/-" was from the original Basic Config's "Adv" slot.
    { value: "Std", type: "modeSwitch", data: { targetMode: "basic"} }, { value: "0", type: "number" },
    { value: ".", type: "number" }, { value: "=", type: "equals" },
    { value: "MS", type: "memoryStore" }, { value: "9%", type: "gst9PercentKey" } /* Adv Panel */
];


// --- UI CREATION ---
function createCalculator() {
    console.log(`createCalculator function started (Mode: ${calculatorMode}).`);
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

        if (calculatorMode === "basic") {
            currentContainer.style.width = BASIC_CALC_WIDTH_PX;
            buttonsGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
            activeButtonsConfig = basicButtonsConfig.map(btn =>
                btn.type === "themeToggle" ? {...btn, value: currentThemeIcon } : btn
            );
            currentContainer.classList.remove("advanced-mode-active");
        } else {
            currentContainer.style.width = ADVANCED_CALC_WIDTH_PX;
            buttonsGrid.style.gridTemplateColumns = "repeat(6, 1fr)";
            activeButtonsConfig = advancedButtonsConfig.map(btn =>
                btn.type === "themeToggle" ? {...btn, value: currentThemeIcon } : btn
            );
            currentContainer.classList.add("advanced-mode-active");
        }
        currentContainer.appendChild(buttonsGrid);

        activeButtonsConfig.forEach(btnConfig => {
            if (btnConfig.type === "emptySlot") { const emptyDiv = document.createElement("div"); buttonsGrid.appendChild(emptyDiv); return; }
            const button = document.createElement("button"); button.innerText = btnConfig.value; button.className = "btn";
            const typeToClass = {
                operator: "btn-operator", equals: "btn-equals", clear: "btn-clear",
                modeSwitch: "btn-mode-switch", themeToggle: "btn-theme-control",
                memoryClear: "btn-memory", memoryRecall: "btn-memory", memoryStore: "btn-memory",
                memoryAdd: "btn-memory",
                memorySubtract: "btn-memory",
                squareRoot: "btn-operator", square: "btn-operator", reciprocal: "btn-operator",
                percentage: "btn-operator", powerOperator: "btn-operator",
                gst9PercentKey: "btn-gst-style",
                signKey: "btn-sign-key-style",
                backspace: "btn-backspace",
            };
            if (typeToClass[btnConfig.type]) { button.classList.add(typeToClass[btnConfig.type]); }

            button.style.gridColumn = (btnConfig.data && btnConfig.data.span) ? `span ${btnConfig.data.span}` : "span 1";

            button.onclick = () => {
                button.classList.add("btn-press-animation");
                button.addEventListener("animationend", () => button.classList.remove("btn-press-animation"), { once: true });
                handleButtonClick(btnConfig);
            };
            buttonsGrid.appendChild(button);
        });

        if (lastButtonType !== "modeSwitch") {
            // currentExpression = ""; // Retain expression on mode switch
            // lastButtonType = "";    // Retain lastButtonType on mode switch
        }
        isMemorySet = (memory !== 0);
        updateDisplay();
        console.log(`UI built for ${calculatorMode} mode with ${activeButtonsConfig.length} buttons.`);

        buttonsGrid.classList.add("grid-fade-in");
        currentContainer.classList.remove("calculator-morph-out");
        currentContainer.classList.add("calculator-morph-in");

        const animationEndHandler = () => {
            const cont = document.getElementById("calculator");
            if (cont) cont.classList.remove("calculator-morph-in");
            const grid = cont ? cont.querySelector(".buttons-grid") : null;
            if (grid) grid.classList.remove("grid-fade-in");
            if (cont) cont.removeEventListener('animationend', animationEndHandler);
        };
        currentContainer.addEventListener('animationend', animationEndHandler);

    }, 250);
}

// --- HELPER FUNCTIONS ---
function extractLastNumber(expression) {
    if (expression === "Error" || expression === "") return { numStr: "", baseExpr: "" };
    const match = expression.match(/^(.*?)(\s[+\-*/]\s|\s\*\*\s)?(-?\d*\.?\d+)$/);
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
            if (!isNaN(evaluatedPrefix)) { valueToOperateOnStr = evaluatedPrefix.toString(); }
            else { currentExpression = "Error"; updateDisplay(); return; }
            baseExpressionForResult = "";
        } else if (valueToOperateOnStr === "-") {
            valueToOperateOnStr = "0";
        }

        const valueToOperateOn = parseFloat(valueToOperateOnStr);
        if (isNaN(valueToOperateOn)) { currentExpression = "Error"; updateDisplay(); return; }

        if (errorCheckFunction && errorCheckFunction(valueToOperateOn)) {
            currentExpression = "Error";
        } else {
            const result = mathFunction(valueToOperateOn);
            if (isNaN(result) || !isFinite(result)) {
                currentExpression = "Error";
            } else {
                currentExpression = baseExpressionForResult + result.toString();
            }
        }
    } catch (e) { currentExpression = "Error"; }
    lastButtonType = "equals";
}

// --- CORE BUTTON CLICK HANDLER ---
function handleButtonClick(btnConfig) {
    const { value: buttonValue, type: buttonType, data } = btnConfig;
    console.log(`Button: "${buttonValue}", Type: "${buttonType}", Data: ${JSON.stringify(data)} || Before -> CE: "${currentExpression}", LBT: "${lastButtonType}"`);

    if (currentExpression === "Error" && buttonType !== "clear" && buttonType !== "modeSwitch") currentExpression = "";
    if (lastButtonType === "equals" &&
        buttonType !== "operator" && buttonType !== "powerOperator" &&
        !buttonType.startsWith("memory") && buttonType !== "signKey" &&
        buttonType !== "modeSwitch" &&
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
            else if (currentExpression.endsWith(" **") && (opToAdd === "+" || opToAdd === "*" || opToAdd === "/")) { return; }
            else if (currentExpression.endsWith(" ") || currentExpression.endsWith("**")) {
                const endsWithDoubleStar = currentExpression.endsWith(" **");
                const endsWithOpSpace = currentExpression.endsWith(" ");

                if (endsWithDoubleStar) { currentExpression = currentExpression.slice(0, -3) + ` ${opToAdd} `; }
                else if (endsWithOpSpace && currentExpression.slice(-3).match(/\s[+\-*/]\s/)) { currentExpression = currentExpression.slice(0, -3) + ` ${opToAdd} `; }
                else { currentExpression += ` ${opToAdd} `; }
            } else { currentExpression += ` ${opToAdd} `; }
            lastButtonType = "operator";
            break;

        case "equals":
            if (currentExpression === "Error" || currentExpression === "") { /* No action */ }
            else {
                let expressionToEvaluate = String(currentExpression);
                const trimmedExpr = expressionToEvaluate.trim();
                if (trimmedExpr.endsWith(" ") && (trimmedExpr.slice(-2,-1).match(/[+\-*/]/) || trimmedExpr.endsWith(" **"))) {
                    const parts = trimmedExpr.split(/(\s[+\-*/]\s|\s\*\*\s)/);
                    let lastValidOperand = "";
                    for(let i = parts.length - 1; i >= 0; i--) {
                        if(parts[i] && !isNaN(parseFloat(parts[i])) && !parts[i].trim().match(/[+\-*/]$/) && !parts[i].trim().endsWith("**")) {
                            lastValidOperand = parts[i].trim(); break;
                        }
                    }
                    if (lastValidOperand) { expressionToEvaluate += lastValidOperand; }
                    else if (trimmedExpr === "-") { expressionToEvaluate = "0"; }
                    else { currentExpression = "Error"; }
                }

                if (currentExpression !== "Error") {
                    try {
                        const result = eval(expressionToEvaluate);
                        calculationHistory.unshift({ expression: expressionToEvaluate, result: result.toString() });
                        if (calculationHistory.length > MAX_HISTORY_LENGTH) calculationHistory.pop();
                        console.log("Calculation History:", JSON.stringify(calculationHistory, null, 2));

                        if (isNaN(result) || !isFinite(result)) { currentExpression = "Error"; }
                        else { currentExpression = result.toString(); }
                    } catch (e) { currentExpression = "Error"; }
                }
            }
            lastButtonType = "equals";
            break;

        case "clear":
            currentExpression = "";
            lastButtonType = "clear";
            break;
        case "backspace":
            currentExpression = String(currentExpression);
            if (currentExpression === "Error") { currentExpression = ""; }
            else if (currentExpression.endsWith(" ** ")) { currentExpression = currentExpression.slice(0, -4); }
            else if (currentExpression.endsWith(" ")) { currentExpression = currentExpression.slice(0, -3); }
            else if (currentExpression.length > 0) { currentExpression = currentExpression.slice(0, -1); }
            if (currentExpression.endsWith(" ") || currentExpression.endsWith("**")) { lastButtonType = "operator"; }
            else if (currentExpression === "" || !isNaN(parseFloat(extractLastNumber(currentExpression).numStr))) {
                lastButtonType = (currentExpression === "") ? "clear" : "number";
            } else { lastButtonType = "backspace";  }
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
                    else { if (parseFloat(numStr) !== 0 || numStr.includes(".")) { toggledNumStr = "-" + numStr; } }
                    currentExpression = baseExpr + toggledNumStr;
                } else if (currentExpression === "" || currentExpression === "0") {
                    currentExpression = "-";
                }
            }
            if (extractLastNumber(currentExpression).numStr !== "") lastButtonType = "number";
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
                        const firstNumStr = extractLastNumber(exprBase.trim().slice(0, -1).trim()).numStr;
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
                    try { evaluatedExpr = eval(currentExpression); } catch(e) {evaluatedExpr = NaN;}
                    if (!isNaN(evaluatedExpr)) {
                        currentExpression = (evaluatedExpr * 0.09).toString();
                    } else { currentExpression = "Error"; }
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
                    if (lastN !== "" && !isNaN(parseFloat(lastN)) && baseE + lastN === currentExpression) {
                        currentExpression = baseE + memoryStr;
                    } else {
                        currentExpression += ` ${memoryStr} `;
                    }
                }
                lastButtonType = "number";
            }
            break;
        case "memoryStore":
            let valToStore;
            console.log(`MS: Current expression to consider for storing: "${currentExpression}"`);
            try {
                let exprToEvalForMS = String(currentExpression).trim();
                if (exprToEvalForMS === "" || exprToEvalForMS === "Error") {
                    valToStore = 0;
                } else {
                    if (exprToEvalForMS.match(/(\s[+\-*/]\s|\s\*\*\s)$/)) {
                        exprToEvalForMS = exprToEvalForMS.replace(/(\s[+\-*/]\s|\s\*\*\s)$/, "").trim();
                    }
                    if (exprToEvalForMS === "" || exprToEvalForMS === "-") {
                        valToStore = 0;
                    } else {
                        console.log(`MS: Attempting to eval for store: "${exprToEvalForMS}"`);
                        valToStore = eval(exprToEvalForMS);
                    }
                }
                if (isNaN(valToStore) || !isFinite(valToStore)) {
                    const lastNumFromExpr = extractLastNumber(String(currentExpression)).numStr;
                    console.log(`MS: Eval gave NaN/Infinity, trying to parse last num: "${lastNumFromExpr}"`);
                    valToStore = parseFloat(lastNumFromExpr);
                    if (isNaN(valToStore) || !isFinite(valToStore)) {
                        console.log("MS: Parsing last num also failed or gave NaN/Inf.");
                        valToStore = 0;
                    }
                }
            } catch (e) {
                console.error("MS Eval Error, attempting to parse last number:", e);
                const lastNumFromExprOnError = extractLastNumber(String(currentExpression)).numStr;
                valToStore = parseFloat(lastNumFromExprOnError);
                if (isNaN(valToStore) || !isFinite(valToStore)) {
                    valToStore = 0;
                }
            }
            memory = valToStore;
            isMemorySet = !isNaN(memory) && isFinite(memory);
            if(!isMemorySet) memory = 0;

            console.log(`Memory Stored: ${memory}, isMemorySet: ${isMemorySet}`);
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
            document.querySelectorAll('.btn').forEach(b => {
                const currentLayoutConfig = (calculatorMode === 'basic') ? basicButtonsConfig : advancedButtonsConfig;
                const thisButtonConfig = currentLayoutConfig.find(cfg =>
                    (cfg.value === b.innerText && cfg.type === "themeToggle") ||
                    (cfg.type === "themeToggle" && (b.innerText === THEME_ICON_DARK_MODE || b.innerText === THEME_ICON_LIGHT_MODE))
                );
                if (thisButtonConfig && thisButtonConfig.type === "themeToggle") {
                    b.innerText = themeBtnIcon;
                }
            });
            console.log("Theme switched to:", currentTheme);
            updateDisplay(); return;
        case "modeSwitch":
            calculatorMode = data.targetMode;
            lastButtonType = "modeSwitch";
            createCalculator();
            return;
        default: console.warn("Unhandled button type:", buttonType);
    }
    updateDisplay();
    console.log(`Button: "${buttonValue}", Type: "${buttonType}", Data: ${JSON.stringify(data)} || After  -> CE: "${currentExpression}", LBT: "${lastButtonType}"`);
}

// Keyboard input handling
document.addEventListener("keydown", (event) => {
    const key = event.key;
    let activeConfig = (calculatorMode === "basic") ? basicButtonsConfig : advancedButtonsConfig;
    let matchedBtnConfig = null;
    let tempButtonValue = "", tempButtonType = "";

    if (key === "Backspace") { event.preventDefault(); tempButtonValue = "←"; tempButtonType = "backspace";}
    else if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) { tempButtonValue = key; tempButtonType = "number";}
    else if (key === ".") { tempButtonValue = key; tempButtonType = "number";}
    else if (key === "+") { tempButtonValue = "+"; tempButtonType = "operator";}
    else if (key === "-") { tempButtonValue = "-"; tempButtonType = "operator";}
    else if (key === "*") { tempButtonValue = "*"; tempButtonType = "operator";}
    else if (key === "/") { tempButtonValue = "/"; tempButtonType = "operator";}
    else if (key === "%") {
        matchedBtnConfig = activeConfig.find(b => b.value === "%" && b.type === "percentage");
    }
    else if (key === "Enter" || key === "=") { event.preventDefault(); tempButtonValue = "="; tempButtonType = "equals";}
    else if (key === "Escape") { tempButtonValue = "C"; tempButtonType = "clear";}
    else if (key === "^") {
        matchedBtnConfig = activeConfig.find(b => b.value === "x^y" && b.type === "powerOperator");
    }


    if (!matchedBtnConfig && tempButtonValue !== "") {
        let potentialMatches = activeConfig.filter(b => b.value === tempButtonValue);
        if (potentialMatches.length > 1 && tempButtonType) {
            matchedBtnConfig = potentialMatches.find(b => b.type === tempButtonType);
        } else if (potentialMatches.length === 1) {
            matchedBtnConfig = potentialMatches[0];
        }

        if (!matchedBtnConfig && tempButtonType) {
            const genericMatch = activeConfig.find(b => b.type === tempButtonType && !b.value.match(/[a-zA-Z]/) );
            if(genericMatch) matchedBtnConfig = genericMatch;
            else matchedBtnConfig = { value: tempButtonValue, type: tempButtonType, data: {} };
        }
    }


    if(matchedBtnConfig && matchedBtnConfig.type) {
        const onscreenButton = Array.from(document.querySelectorAll('.btn')).find(btn => {
            if (matchedBtnConfig.type === "themeToggle") {
                const themeToggleConfig = activeConfig.find(acfg => acfg.type === "themeToggle");
                return btn.innerText.trim() === themeToggleConfig.value.trim();
            }
            return btn.innerText.trim() === matchedBtnConfig.value.trim();
        });
        if (onscreenButton) {
            onscreenButton.classList.add("btn-press-animation");
            onscreenButton.addEventListener("animationend", () => { onscreenButton.classList.remove("btn-press-animation"); }, { once: true });
        }
        handleButtonClick(matchedBtnConfig);
    } else if (tempButtonValue && tempButtonType && !matchedBtnConfig) {
        console.warn(`Keyboard input "${key}" (parsed as value: "${tempButtonValue}", type: "${tempButtonType}") did not match any button config.`);
        const fallbackMatch = activeConfig.find(b => b.type === tempButtonType);
        if(fallbackMatch){
            handleButtonClick(fallbackMatch);
        }
    }
});

// Run the calculator setup
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Attempting to create calculator... (Layout modifications applied)");
    const savedTheme = localStorage.getItem("calculatorTheme");
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.className = currentTheme === "light" ? "light-theme" : "";
    }
    const initialThemeIcon = currentTheme === "dark" ? THEME_ICON_DARK_MODE : THEME_ICON_LIGHT_MODE;
    basicButtonsConfig.forEach(btn => { if (btn.type === "themeToggle") btn.value = initialThemeIcon; });
    advancedButtonsConfig.forEach(btn => { if (btn.type === "themeToggle") btn.value = initialThemeIcon; });

    try { createCalculator(); } catch (e) { console.error("Error initial createCalculator:", e); }
});