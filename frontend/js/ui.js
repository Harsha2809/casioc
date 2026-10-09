
/* =====================================================
   CASIOC - UI CONTROLLER
   Member 4 - Frontend UI
   Integrated with Member 3 Calculator, History and Storage
   ===================================================== */


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const expressionElement = document.getElementById("expression");
const resultElement = document.getElementById("result");
const themeToggle = document.getElementById("themeToggle");
const statusMessage = document.getElementById("statusMessage");
const calculator = document.querySelector(".calculator");

const calculatorButtons = document.querySelectorAll(".calculator-button");
const advancedButtons = document.querySelectorAll(".advanced-button");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");


/* =====================================================
   UI STATE
   ===================================================== */

let currentExpression = "";
let lastResult = "0";
let calculatorHistory = null;


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    initializeButtonAnimations();
    initializeKeyboard();
    initializeHistoryUI();
});


/* =====================================================
   BUTTON ANIMATIONS
   ===================================================== */

function initializeButtonAnimations() {
    const allButtons = [
        ...calculatorButtons,
        ...advancedButtons
    ];

    allButtons.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.remove("button-click");

            // Restart the animation on every click.
            void button.offsetWidth;

            button.classList.add("button-click");
        });
    });
}


/* =====================================================
   DISPLAY
   ===================================================== */

function updateExpressionDisplay(expression) {
    expressionElement.textContent = expression || "0";
}

function updateResultDisplay(result) {
    resultElement.textContent = result ?? "0";

    resultElement.classList.remove("result-update");

    // Restart the result animation.
    void resultElement.offsetWidth;

    resultElement.classList.add("result-update");
}


/* =====================================================
   STATUS MESSAGE
   ===================================================== */

function showStatus(message, isError = false) {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.classList.add("visible");
    statusMessage.classList.toggle("error", isError);

    setTimeout(() => {
        statusMessage.classList.remove("visible");
    }, 2500);
}


/* =====================================================
   ERROR ANIMATION
   ===================================================== */

function showError(message = "Invalid expression") {
    showStatus(message, true);

    if (!calculator) return;

    calculator.classList.remove("error-shake");

    void calculator.offsetWidth;

    calculator.classList.add("error-shake");

    setTimeout(() => {
        calculator.classList.remove("error-shake");
    }, 400);
}


/* =====================================================
   THEME
   ===================================================== */

function loadTheme() {
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("casioc-theme") || "light";
    } catch (error) {
        console.warn("Unable to read saved theme:", error);
    }

    const isDark = savedTheme === "dark";

    document.body.classList.toggle("dark", isDark);

    if (themeToggle) {
        themeToggle.textContent = isDark ? "☀" : "☾";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    try {
        localStorage.setItem(
            "casioc-theme",
            isDark ? "dark" : "light"
        );
    } catch (error) {
        console.warn("Unable to save theme:", error);
    }

    if (themeToggle) {
        themeToggle.textContent = isDark ? "☀" : "☾";
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}


/* =====================================================
   CALCULATOR BUTTONS
   ===================================================== */

calculatorButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        // Numbers, operators and decimal point.
        if (value !== undefined) {
            addToExpression(value);
            return;
        }

        // Clear all input.
        if (action === "clear") {
            clearCalculator();
            return;
        }

        // Delete the last character.
        if (action === "delete") {
            deleteLastCharacter();
            return;
        }

        // Change the sign.
        if (action === "negative") {
            toggleNegative();
            return;
        }

        // Calculate the expression.
        if (action === "calculate") {
            calculateExpression();
        }
    });
});


/* =====================================================
   ADVANCED BUTTONS
   ===================================================== */

advancedButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            addToExpression(value);
            return;
        }

        if (action === "sqrt") {
            addUnaryOperation("sqrt");
            return;
        }

        if (action === "square") {
            addUnaryOperation("square");
            return;
        }

        if (action === "reciprocal") {
            addUnaryOperation("reciprocal");
        }
    });
});


/* =====================================================
   ADD INPUT
   ===================================================== */

function addToExpression(value) {
    currentExpression += value;

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   DELETE
   ===================================================== */

function deleteLastCharacter() {
    currentExpression = currentExpression.slice(0, -1);

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   CLEAR CALCULATOR DISPLAY
   ===================================================== */

function clearCalculator() {
    currentExpression = "";
    lastResult = "0";

    updateExpressionDisplay("0");
    updateResultDisplay("0");

    if (statusMessage) {
        statusMessage.classList.remove("visible");
    }
}


/* =====================================================
   NEGATIVE SIGN
   ===================================================== */

function toggleNegative() {
    if (!currentExpression) {
        currentExpression = "-";
    } else {
        currentExpression = currentExpression.startsWith("-")
            ? currentExpression.substring(1)
            : "-" + currentExpression;
    }

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   ADVANCED OPERATIONS
   ===================================================== */

function addUnaryOperation(operation) {
    if (!currentExpression.trim()) {
        showError("Enter a number first");
        return;
    }

    if (operation === "sqrt") {
        currentExpression = `sqrt(${currentExpression})`;
    } else if (operation === "square") {
        currentExpression = `(${currentExpression})^2`;
    } else if (operation === "reciprocal") {
        currentExpression = `1/(${currentExpression})`;
    }

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   EXPRESSION FORMATTING
   ===================================================== */

function formatExpression(expression) {
    return String(expression)
        .replaceAll("*", "×")
        .replaceAll("/", "÷");
}


/* =====================================================
   BACKEND CALCULATION
   ===================================================== */

async function calculateExpression() {
    if (!currentExpression.trim()) {
        showError("Enter an expression");
        return;
    }

    const expressionToSend = currentExpression;

    try {
        showStatus("Calculating...");

        const response = await fetch("http://127.0.0.1:8000/api/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expression: expressionToSend
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.result === undefined || data.result === null) {
            throw new Error("Invalid response from server");
        }

        // Update the calculator display.
        lastResult = String(data.result);
        updateResultDisplay(lastResult);

        showStatus("Calculation completed");

        // Save the successful calculation using Member 3's storage module.
        try {
            if (
                typeof CalculationStorage !== "undefined" &&
                typeof CalculationStorage.saveCalculation === "function"
            ) {
                CalculationStorage.saveCalculation({
                    expression: expressionToSend,
                    result: lastResult,
                    timestamp: new Date().toISOString()
                });

                // Refresh the history display.
                if (calculatorHistory) {
                    calculatorHistory.refresh();
                }
            } else {
                console.warn(
                    "CalculationStorage is not available. Check script order."
                );
            }
        } catch (historyError) {
            // A history-storage problem should not undo a successful calculation.
            console.error("Unable to save calculation history:", historyError);
            showStatus("Calculated, but history could not be saved", true);
        }

        // Notify any other UI component interested in completed calculations.
        document.dispatchEvent(
            new CustomEvent("calculationCompleted", {
                detail: {
                    expression: expressionToSend,
                    result: lastResult,
                    timestamp: new Date().toISOString()
                }
            })
        );

    } catch (error) {
        console.error("Calculation error:", error);

        showError(
            "Unable to calculate. Check the backend."
        );
    }
}


/* =====================================================
   HISTORY INTEGRATION - MEMBER 3
   ===================================================== */

function initializeHistoryUI() {
    if (!historyList) {
        console.warn("History container #historyList was not found.");
        return;
    }

    if (
        typeof CalculationHistory === "undefined" ||
        typeof CalculationHistory.connectHistory !== "function"
    ) {
        console.error(
            "CalculationHistory is not available. Check index.html script order."
        );

        showStatus("History module could not be loaded", true);
        return;
    }

    try {
        calculatorHistory = CalculationHistory.connectHistory({
            container: historyList,
            clearButton: clearHistoryButton,

            // Selecting a history item restores its expression and result.
            onSelect(entry) {
                currentExpression = entry.expression;
                lastResult = String(entry.result);

                updateExpressionDisplay(
                    formatExpression(currentExpression)
                );

                updateResultDisplay(lastResult);
            }
        });

        calculatorHistory.refresh();

    } catch (error) {
        console.error("History initialization error:", error);
        showStatus("Unable to load calculation history", true);
    }
}


/* =====================================================
   KEYBOARD SUPPORT
   ===================================================== */

function initializeKeyboard() {
    document.addEventListener("keydown", event => {
        const key = event.key;

        // Ignore keyboard shortcuts while typing in an input field.
        const target = event.target;

        if (
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            )
        ) {
            return;
        }

        // Numbers.
        if (key >= "0" && key <= "9") {
            addToExpression(key);
            return;
        }

        // Decimal point.
        if (key === ".") {
            addToExpression(".");
            return;
        }

        // Mathematical operators.
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "%"
        ) {
            addToExpression(key);
            return;
        }

        // Parentheses.
        if (key === "(" || key === ")") {
            addToExpression(key);
            return;
        }

        // Calculate using Enter or =.
        if (key === "Enter" || key === "=") {
            event.preventDefault();
            calculateExpression();
            return;
        }

        // Delete the last character.
        if (key === "Backspace") {
            event.preventDefault();
            deleteLastCharacter();
            return;
        }

        // Clear the calculator.
        if (key === "Escape") {
            clearCalculator();
        }
    });
}
