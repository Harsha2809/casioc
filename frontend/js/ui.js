/* =====================================================
   CASIOC - UI CONTROLLER
   Member 4 - Frontend UI
   ===================================================== */


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const expressionElement =
    document.getElementById("expression");

const resultElement =
    document.getElementById("result");

const themeToggle =
    document.getElementById("themeToggle");

const statusMessage =
    document.getElementById("statusMessage");

const calculator =
    document.querySelector(".calculator");

const calculatorButtons =
    document.querySelectorAll(".calculator-button");

const advancedButtons =
    document.querySelectorAll(".advanced-button");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistory");


/* =====================================================
   UI STATE
   ===================================================== */

let currentExpression = "";

let lastResult = "0";


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
   BUTTON ANIMATION
   ===================================================== */

function initializeButtonAnimations() {

    const allButtons = [
        ...calculatorButtons,
        ...advancedButtons
    ];

    allButtons.forEach(button => {

        button.addEventListener("click", () => {

            button.classList.remove("button-click");

            /*
             * Force browser reflow so the animation
             * can restart every time the button is clicked.
             */
            void button.offsetWidth;

            button.classList.add("button-click");

        });

    });
}


/* =====================================================
   DISPLAY
   ===================================================== */

function updateExpressionDisplay(expression) {

    expressionElement.textContent =
        expression || "0";
}


function updateResultDisplay(result) {

    resultElement.textContent =
        result ?? "0";

    resultElement.classList.remove("result-update");

    void resultElement.offsetWidth;

    resultElement.classList.add("result-update");
}


/* =====================================================
   STATUS MESSAGE
   ===================================================== */

function showStatus(message, isError = false) {

    statusMessage.textContent = message;

    statusMessage.classList.add("visible");

    statusMessage.classList.toggle(
        "error",
        isError
    );

    setTimeout(() => {

        statusMessage.classList.remove("visible");

    }, 2500);
}


/* =====================================================
   ERROR ANIMATION
   ===================================================== */

function showError(message = "Invalid expression") {

    showStatus(message, true);

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

    const savedTheme =
        localStorage.getItem("casioc-theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent = "☀";

    } else {

        document.body.classList.remove("dark");

        themeToggle.textContent = "☾";
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "casioc-theme",
        isDark ? "dark" : "light"
    );

    themeToggle.textContent =
        isDark ? "☀" : "☾";
}


themeToggle.addEventListener(
    "click",
    toggleTheme
);


/* =====================================================
   CALCULATOR UI INPUT
   ===================================================== */

calculatorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const value =
            button.dataset.value;

        const action =
            button.dataset.action;


        /* Number / operator / decimal */

        if (value !== undefined) {

            addToExpression(value);

            return;
        }


        /* Clear */

        if (action === "clear") {

            clearCalculator();

            return;
        }


        /* Delete */

        if (action === "delete") {

            deleteLastCharacter();

            return;
        }


        /* Negative */

        if (action === "negative") {

            toggleNegative();

            return;
        }


        /* Calculate */

        if (action === "calculate") {

            calculateExpression();

            return;
        }

    });

});


/* =====================================================
   ADVANCED BUTTONS
   ===================================================== */

advancedButtons.forEach(button => {

    button.addEventListener("click", () => {

        const value =
            button.dataset.value;

        const action =
            button.dataset.action;


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

            return;
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

    currentExpression =
        currentExpression.slice(0, -1);

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   CLEAR
   ===================================================== */

function clearCalculator() {

    currentExpression = "";

    lastResult = "0";

    updateExpressionDisplay("0");

    updateResultDisplay("0");

    statusMessage.classList.remove("visible");
}


/* =====================================================
   NEGATIVE
   ===================================================== */

function toggleNegative() {

    if (!currentExpression) {

        currentExpression = "-";

    } else {

        /*
         * UI-level sign handling.
         * Actual mathematical interpretation remains
         * the responsibility of the calculator engine.
         */

        currentExpression =
            currentExpression.startsWith("-")
                ? currentExpression.substring(1)
                : "-" + currentExpression;
    }

    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   UNARY OPERATIONS
   ===================================================== */

function addUnaryOperation(operation) {

    if (!currentExpression) {

        showError(
            "Enter a number first"
        );

        return;
    }


    /*
     * We send operation syntax to the backend.
     * The actual calculation is NOT performed here.
     */

    if (operation === "sqrt") {

        currentExpression =
            `sqrt(${currentExpression})`;
    }


    if (operation === "square") {

        currentExpression =
            `(${currentExpression})^2`;
    }


    if (operation === "reciprocal") {

        currentExpression =
            `1/(${currentExpression})`;
    }


    updateExpressionDisplay(
        formatExpression(currentExpression)
    );
}


/* =====================================================
   EXPRESSION FORMATTING
   ===================================================== */

function formatExpression(expression) {

    return expression
        .replaceAll("*", "×")
        .replaceAll("/", "÷");
}


/* =====================================================
   BACKEND CALCULATION
   ===================================================== */

async function calculateExpression() {

    if (!currentExpression.trim()) {

        showError(
            "Enter an expression"
        );

        return;
    }


    const expressionToSend =
        currentExpression;


    try {

        showStatus(
            "Calculating..."
        );


        /*
         * FastAPI endpoint defined by the team.
         *
         * Expected request:
         *
         * {
         *     "expression": "25 * 4"
         * }
         */

        const response =
            await fetch(
                "/api/calculate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        expression:
                            expressionToSend
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `API error: ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
         * Expected response:
         *
         * {
         *     "expression": "25 * 4",
         *     "result": 100
         * }
         */

        if (data.result === undefined) {

            throw new Error(
                "Invalid response from server"
            );
        }


        lastResult =
            String(data.result);


        updateResultDisplay(
            lastResult
        );


        showStatus(
            "Calculation completed"
        );


        /*
         * Member 3 can listen for this event
         * and save the calculation in localStorage.
         */

        document.dispatchEvent(
            new CustomEvent(
                "calculationCompleted",
                {
                    detail: {
                        expression:
                            expressionToSend,

                        result:
                            lastResult,

                        timestamp:
                            new Date().toISOString()
                    }
                }
            )
        );


    } catch (error) {

        console.error(
            "Calculation error:",
            error
        );


        showError(
            "Unable to calculate. Check the backend."
        );
    }
}


/* =====================================================
   KEYBOARD SUPPORT
   ===================================================== */

function initializeKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            const key =
                event.key;


            /* Numbers */

            if (
                key >= "0" &&
                key <= "9"
            ) {

                addToExpression(key);

                return;
            }


            /* Decimal */

            if (key === ".") {

                addToExpression(".");

                return;
            }


            /* Operators */

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


            /* Brackets */

            if (
                key === "(" ||
                key === ")"
            ) {

                addToExpression(key);

                return;
            }


            /* Enter */

            if (
                key === "Enter" ||
                key === "="
            ) {

                event.preventDefault();

                calculateExpression();

                return;
            }


            /* Backspace */

            if (key === "Backspace") {

                event.preventDefault();

                deleteLastCharacter();

                return;
            }


            /* Escape */

            if (key === "Escape") {

                clearCalculator();

                return;
            }

        }
    );
}


/* =====================================================
   HISTORY UI
   ===================================================== */

/*
 * Member 3 owns the actual history/localStorage logic.
 *
 * This function only reads the history data and
 * renders it in the UI.
 */

function initializeHistoryUI() {

    renderHistory();

    document.addEventListener(
        "historyUpdated",
        renderHistory
    );
}


function renderHistory() {

    const history =
        getHistoryFromStorage();


    if (!history.length) {

        historyList.innerHTML = `
            <div class="empty-history">
                No calculations yet
            </div>
        `;

        return;
    }


    historyList.innerHTML = "";


    history
        .slice(0, 10)
        .forEach(item => {

            const historyElement =
                document.createElement("div");

            historyElement.className =
                "history-item";


            historyElement.innerHTML = `
                <div class="history-expression">
                    ${escapeHtml(
                        formatExpression(
                            item.expression
                        )
                    )}
                </div>

                <div class="history-result">
                    = ${escapeHtml(
                        String(item.result)
                    )}
                </div>
            `;


            historyElement.addEventListener(
                "click",
                () => {

                    currentExpression =
                        item.expression;

                    updateExpressionDisplay(
                        formatExpression(
                            currentExpression
                        )
                    );

                    updateResultDisplay(
                        item.result
                    );
                }
            );


            historyList.appendChild(
                historyElement
            );

        });
}


/* =====================================================
   READ HISTORY
   ===================================================== */

function getHistoryFromStorage() {

    try {

        const history =
            localStorage.getItem(
                "casioc-history"
            );


        if (!history) {

            return [];
        }


        const parsed =
            JSON.parse(history);


        return Array.isArray(parsed)
            ? parsed
            : [];


    } catch (error) {

        console.error(
            "History read error:",
            error
        );

        return [];
    }
}


/* =====================================================
   CLEAR HISTORY
   ===================================================== */

clearHistoryButton.addEventListener(
    "click",
    () => {

        /*
         * Member 3 owns history.
         *
         * This event tells the history module
         * that the user requested a clear operation.
         */

        document.dispatchEvent(
            new CustomEvent(
                "clearHistoryRequested"
            )
        );

    }
);


/* =====================================================
   HTML ESCAPING
   ===================================================== */

function escapeHtml(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}