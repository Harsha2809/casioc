(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.CalculationStorage = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  const STORAGE_KEY = "casioc.calculationHistory";
  const MAX_HISTORY = 10;

  function resolveStorage(storage) {
    const target = storage || (typeof globalThis !== "undefined" && globalThis.localStorage);
    if (!target) {
      throw new Error("Browser localStorage is not available.");
    }
    return target;
  }

  function readHistory(storage) {
    const raw = resolveStorage(storage).getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    let history;
    try {
      history = JSON.parse(raw);
    } catch (error) {
      throw new Error("Calculation history contains invalid JSON.", { cause: error });
    }

    if (
      !Array.isArray(history) ||
      history.some(
        (entry) =>
          !entry ||
          typeof entry.id !== "string" ||
          typeof entry.expression !== "string" ||
          typeof entry.result !== "string" ||
          typeof entry.timestamp !== "string"
      )
    ) {
      throw new Error("Calculation history has an invalid format.");
    }

    return history.slice(0, MAX_HISTORY);
  }

  function writeHistory(history, storage) {
    resolveStorage(storage).setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function saveCalculation(calculation, storage) {
    if (
      !calculation ||
      typeof calculation.expression !== "string" ||
      typeof calculation.result !== "string" ||
      calculation.expression.trim() === "" ||
      calculation.result.trim() === ""
    ) {
      throw new TypeError("A calculation must include a non-empty expression and result.");
    }

    const entry = {
      id:
        typeof calculation.id === "string" && calculation.id
          ? calculation.id
          : createId(),
      expression: calculation.expression,
      result: calculation.result,
      timestamp:
        typeof calculation.timestamp === "string"
          ? calculation.timestamp
          : new Date().toISOString(),
    };

    const history = [entry, ...readHistory(storage)].slice(0, MAX_HISTORY);
    writeHistory(history, storage);
    return entry;
  }

  function deleteCalculation(id, storage) {
    if (typeof id !== "string" || id === "") {
      throw new TypeError("A calculation id is required.");
    }

    const history = readHistory(storage);
    const updatedHistory = history.filter((entry) => entry.id !== id);
    writeHistory(updatedHistory, storage);
    return updatedHistory;
  }

  function clearHistory(storage) {
    writeHistory([], storage);
  }

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  return {
    MAX_HISTORY,
    STORAGE_KEY,
    clearHistory,
    deleteCalculation,
    readHistory,
    saveCalculation,
  };
});
