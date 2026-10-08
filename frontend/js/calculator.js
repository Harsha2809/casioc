(function (root, factory) {
  const storageApi =
    typeof module === "object" && module.exports
      ? require("./storage.js")
      : root.CalculationStorage;
  const historyApi =
    typeof module === "object" && module.exports
      ? require("./history.js")
      : root.CalculationHistory;
  const api = factory(storageApi, historyApi);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.Calculator = api;
})(typeof globalThis === "object" ? globalThis : this, function (storageApi, historyApi) {
  const OPERATORS = {
    "+": (left, right) => left + right,
    "-": (left, right) => left - right,
    "*": (left, right) => left * right,
    "/": (left, right) => {
      if (right === 0) {
        throw new RangeError("Cannot divide by zero.");
      }
      return left / right;
    },
    "×": (left, right) => left * right,
    "÷": (left, right) => {
      if (right === 0) {
        throw new RangeError("Cannot divide by zero.");
      }
      return left / right;
    },
  };

  function calculate(leftValue, operator, rightValue) {
    const left = Number(leftValue);
    const right = Number(rightValue);
    const operation = OPERATORS[operator];

    if (
      leftValue === "" ||
      rightValue === "" ||
      !Number.isFinite(left) ||
      !Number.isFinite(right)
    ) {
      throw new TypeError("Enter two valid numbers.");
    }
    if (!operation) {
      throw new TypeError(`Unsupported operator: ${operator}`);
    }

    const value = operation(left, right);
    if (!Number.isFinite(value)) {
      throw new RangeError("The calculation result is not a finite number.");
    }

    const result = String(value);
    return {
      expression: `${String(leftValue)} ${operator} ${String(rightValue)}`,
      result,
      value,
    };
  }

  function createCalculator(options) {
    const {
      display,
      historyList,
      clearHistoryButton,
      storage,
    } = options || {};

    function updateDisplay(value) {
      if (!display) {
        return;
      }
      if ("value" in display) {
        display.value = value;
      } else {
        display.textContent = value;
      }
    }

    const history = historyList
      ? historyApi.connectHistory({
          container: historyList,
          clearButton: clearHistoryButton,
          storage,
          onSelect(entry) {
            updateDisplay(entry.result);
          },
        })
      : null;

    return {
      calculate(left, operator, right) {
        const calculation = calculate(left, operator, right);
        const entry = storageApi.saveCalculation(calculation, storage);
        updateDisplay(entry.result);
        if (history) {
          history.refresh();
        }
        return entry;
      },
      useHistory(entry) {
        if (!entry || typeof entry.result !== "string") {
          throw new TypeError("A valid history entry is required.");
        }
        updateDisplay(entry.result);
      },
      destroy() {
        if (history) {
          history.destroy();
        }
      },
    };
  }

  return { calculate, createCalculator };
});
