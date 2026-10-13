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
let cursorPosition = 0;


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    initializeButtonAnimations();
    initializeExpressionCursor();
    initializeKeyboard();
    initializeHistoryUI();
});


/* =====================================================
   CURSOR POSITION MANAGEMENT
   ===================================================== */

function getCursorPosition() {
    if (
        expressionElement &&
        typeof expressionElement.selectionStart === "number"
    ) {
        return expressionElement.selectionStart;
    }

    return cursorPosition;
}


function setCursorPosition(position) {
    cursorPosition = Math.max(
        0,
        Math.min(position, currentExpression.length)
    );

    if (!expressionElement) return;

    expressionElement.focus();

    expressionElement.setSelectionRange(
        cursorPosition,
        cursorPosition
    );
}


function initializeExpressionCursor() {
    if (!expressionElement) return;

    // Track the cursor when the user clicks the expression.
    expressionElement.addEventListener("click", () => {
        cursorPosition = getCursorPosition();
    });

    // Track cursor changes and text selection.
    expressionElement.addEventListener("select", () => {
        cursorPosition = getCursorPosition();
    });

    expressionElement.addEventListener("keyup", () => {
        cursorPosition = getCursorPosition();
    });

    expressionElement.addEventListener("focus", () => {
        cursorPosition = getCursorPosition();
    });
}


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

            // Restart animation on every click.
            void button.offsetWidth;

            button.classList.add("button-click");
        });
    });
}


/* =====================================================
   DISPLAY
   ===================================================== */

function updateExpressionDisplay(expression) {
    if (!expressionElement) return;

    // An input element uses .value, not .textContent.
    expressionElement.value = expression || "0";

    cursorPosition = Math.max(
        0,
        Math.min(cursorPosition, currentExpression.length)
    );

    // Restore the intended caret position after updating the value.
    expressionElement.setSelectionRange(
        cursorPosition,
        cursorPosition
    );
}


function updateResultDisplay(result) {
    if (!resultElement) return;

    resultElement.textContent = result ?? "0";

    resultElement.classList.remove("result-update");

    // Restart result animation.
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
        savedTheme =
            localStorage.getItem("casioc-theme") || "light";
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

    const isDark =
        document.body.classList.contains("dark");

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

        // Delete at the cursor.
        if (action === "delete") {
            deleteLastCharacter();
            return;
        }

        // Change sign.
        if (action === "negative") {
            toggleNegative();
            return;
        }

        // Calculate expression.
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
   ADD INPUT AT CURSOR POSITION
   ===================================================== */

function addToExpression(value) {
    const start = getCursorPosition();

    const end =
        expressionElement &&
        typeof expressionElement.selectionEnd === "number"
            ? expressionElement.selectionEnd
            : start;

    // Replace selected text, or insert at the cursor.
    currentExpression =
        currentExpression.slice(0, start) +
        value +
        currentExpression.slice(end);

    cursorPosition = start + value.length;

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );

    setCursorPosition(cursorPosition);
}


/* =====================================================
   DELETE AT CURSOR POSITION
   ===================================================== */

function deleteLastCharacter() {
    if (!currentExpression.length) return;

    const start = getCursorPosition();

    const end =
        expressionElement &&
        typeof expressionElement.selectionEnd === "number"
            ? expressionElement.selectionEnd
            : start;

    // If a range is selected, delete the selection.
    if (start !== end) {
        currentExpression =
            currentExpression.slice(0, start) +
            currentExpression.slice(end);

        cursorPosition = start;
    } else {
        // Otherwise, delete the character before the cursor.
        if (start === 0) return;

        currentExpression =
            currentExpression.slice(0, start - 1) +
            currentExpression.slice(start);

        cursorPosition = start - 1;
    }

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );

    // Keep the caret exactly at the deletion position.
    setCursorPosition(cursorPosition);
}


/* =====================================================
   CLEAR CALCULATOR
   ===================================================== */

function clearCalculator() {
    currentExpression = "";
    lastResult = "0";
    cursorPosition = 0;

    updateExpressionDisplay("0");
    updateResultDisplay("0");

    if (statusMessage) {
        statusMessage.classList.remove("visible");
    }

    setCursorPosition(0);
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

    cursorPosition = currentExpression.length;

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );

    setCursorPosition(cursorPosition);
}


/* =====================================================
   ADVANCED OPERATIONS
   ===================================================== */

function addUnaryOperation(operation) {
    if (!currentExpression) return;

    switch (operation) {
        case "sqrt":
            currentExpression = `sqrt(${currentExpression})`;
            break;

        case "square":
            currentExpression = `(${currentExpression})**2`;
            break;

        case "reciprocal":
            currentExpression = `1/(${currentExpression})`;
            break;
    }

    cursorPosition = currentExpression.length;
    updateExpressionDisplay(currentExpression);
    setCursorPosition(cursorPosition);
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

        const response = await fetch(
            "https://casioc-calculator-api-d4bcchdpf9h2f6ef.southindia-01.azurewebsites.net/api/calculate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    expression: expressionToSend
                })
            }
        );

        if (!response.ok) {
            let detail = "";

            try {
                const errorData = await response.json();
                detail = errorData.detail || "";
            } catch (_) {
                // Use the generic API error if the response isn't JSON.
            }

            throw new Error(
                detail || `API error: ${response.status}`
            );
        }

        const data = await response.json();

        if (
            data.result === undefined ||
            data.result === null
        ) {
            throw new Error("Invalid response from server");
        }

        lastResult = String(data.result);

        updateResultDisplay(lastResult);

        showStatus("Calculation completed");

        // Save successful calculation using Member 3's storage module.
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

                if (calculatorHistory) {
                    calculatorHistory.refresh();
                }
            } else {
                console.warn(
                    "CalculationStorage is not available. Check script order."
                );
            }
        } catch (historyError) {
            console.error(
                "Unable to save calculation history:",
                historyError
            );

            showStatus(
                "Calculated, but history could not be saved",
                true
            );
        }

        // Notify other UI components.
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
            error.message ||
            "Unable to calculate. Check the backend."
        );
    }
}


/* =====================================================
   HISTORY INTEGRATION - MEMBER 3
   ===================================================== */

function initializeHistoryUI() {
    if (!historyList) {
        console.warn(
            "History container #historyList was not found."
        );
        return;
    }

    if (
        typeof CalculationHistory === "undefined" ||
        typeof CalculationHistory.connectHistory !== "function"
    ) {
        console.error(
            "CalculationHistory is not available. Check index.html script order."
        );

        showStatus(
            "History module could not be loaded",
            true
        );

        return;
    }

    try {
        calculatorHistory =
            CalculationHistory.connectHistory({
                container: historyList,
                clearButton: clearHistoryButton,

                // Restore selected calculation.
                onSelect(entry) {
                    currentExpression = entry.expression;
                    lastResult = String(entry.result);

                    cursorPosition =
                        currentExpression.length;

                    updateExpressionDisplay(
                        formatExpression(currentExpression)
                    );

                    updateResultDisplay(lastResult);

                    setCursorPosition(cursorPosition);
                }
            });

        calculatorHistory.refresh();

    } catch (error) {
        console.error(
            "History initialization error:",
            error
        );

        showStatus(
            "Unable to load calculation history",
            true
        );
    }
}


/* =====================================================
   KEYBOARD SUPPORT
   ===================================================== */

function initializeKeyboard() {
    document.addEventListener("keydown", event => {
        const key = event.key;
        const target = event.target;

        // Ignore unrelated input fields.
        if (
            target &&
            (
                (
                    target.tagName === "INPUT" &&
                    target !== expressionElement
                ) ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            )
        ) {
            return;
        }

        // Synchronize cursor position when expression input is focused.
        if (target === expressionElement) {
            cursorPosition = getCursorPosition();
        }

        // Numbers.
        if (key >= "0" && key <= "9") {
            event.preventDefault();
            addToExpression(key);
            return;
        }

        // Decimal point.
        if (key === ".") {
            event.preventDefault();
            addToExpression(".");
            return;
        }

        // Mathematical operators.
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "%" ||
            key === "^"
        ) {
            event.preventDefault();
            addToExpression(key);
            return;
        }

        // Parentheses.
        if (key === "(" || key === ")") {
            event.preventDefault();
            addToExpression(key);
            return;
        }

        // Calculate.
        if (key === "Enter" || key === "=") {
            event.preventDefault();
            calculateExpression();
            return;
        }

        // Backspace deletes before the cursor.
        if (key === "Backspace") {
            event.preventDefault();
            deleteLastCharacter();
            return;
        }

        // Delete removes the character after the cursor.
        if (key === "Delete") {
            event.preventDefault();

            const start = getCursorPosition();

            const end =
                expressionElement &&
                typeof expressionElement.selectionEnd === "number"
                    ? expressionElement.selectionEnd
                    : start;

            if (start !== end) {
                currentExpression =
                    currentExpression.slice(0, start) +
                    currentExpression.slice(end);

                cursorPosition = start;
            } else if (start < currentExpression.length) {
                currentExpression =
                    currentExpression.slice(0, start) +
                    currentExpression.slice(start + 1);

                cursorPosition = start;
            }

            updateExpressionDisplay(
                formatExpression(currentExpression)
            );

            setCursorPosition(cursorPosition);
            return;
        }

        // Clear calculator.
        if (key === "Escape") {
            event.preventDefault();
            clearCalculator();
        }

        // Arrow keys are handled by the browser's native input caret.
        // Their updated position is read when the next action occurs.
    });
}