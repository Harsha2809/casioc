(function (root, factory) {
  const storageApi =
    typeof module === "object" && module.exports
      ? require("./storage.js")
      : root.CalculationStorage;
  const api = factory(storageApi);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.CalculationHistory = api;
})(typeof globalThis === "object" ? globalThis : this, function (storageApi) {
  function renderHistory(container, entries) {
    if (!container || typeof container.replaceChildren !== "function") {
      throw new TypeError("A history list element is required.");
    }

    const fragment = container.ownerDocument.createDocumentFragment();
    for (const entry of entries) {
      const item = container.ownerDocument.createElement("li");
      item.dataset.historyId = entry.id;

      const selectButton = container.ownerDocument.createElement("button");
      selectButton.type = "button";
      selectButton.dataset.historySelect = "";
      selectButton.textContent = `${entry.expression} = ${entry.result}`;

      const timestamp = container.ownerDocument.createElement("time");
      timestamp.dateTime = entry.timestamp;
      const parsedTimestamp = new Date(entry.timestamp);
      timestamp.textContent = Number.isNaN(parsedTimestamp.getTime())
        ? entry.timestamp
        : parsedTimestamp.toLocaleString();

      const deleteButton = container.ownerDocument.createElement("button");
      deleteButton.type = "button";
      deleteButton.dataset.historyDelete = "";
      deleteButton.setAttribute("aria-label", `Delete ${entry.expression}`);
      deleteButton.textContent = "Delete";

      item.append(selectButton, timestamp, deleteButton);
      fragment.append(item);
    }

    container.replaceChildren(fragment);
  }

  function connectHistory(options) {
    const { container, clearButton, onSelect, storage } = options || {};
    if (!container || typeof container.addEventListener !== "function") {
      throw new TypeError("A history list element is required.");
    }
    if (typeof onSelect !== "function") {
      throw new TypeError("An onSelect callback is required.");
    }

    function refresh() {
      const entries = storageApi.readHistory(storage);
      renderHistory(container, entries);
      return entries;
    }

    function handleHistoryClick(event) {
      const target = event.target;
      if (!target || typeof target.closest !== "function") {
        return;
      }

      const button = target.closest("[data-history-select], [data-history-delete]");
      const item = button && button.closest("[data-history-id]");
      if (!button || !item) {
        return;
      }

      const id = item.dataset.historyId;
      if (button.hasAttribute("data-history-delete")) {
        storageApi.deleteCalculation(id, storage);
        refresh();
        return;
      }

      const entry = storageApi.readHistory(storage).find((candidate) => candidate.id === id);
      if (entry) {
        onSelect(entry);
      }
    }

    function handleClear() {
      storageApi.clearHistory(storage);
      refresh();
    }

    container.addEventListener("click", handleHistoryClick);
    if (clearButton) {
      clearButton.addEventListener("click", handleClear);
    }

    const entries = refresh();
    return {
      refresh,
      destroy() {
        container.removeEventListener("click", handleHistoryClick);
        if (clearButton) {
          clearButton.removeEventListener("click", handleClear);
        }
      },
    };
  }

  return { connectHistory, renderHistory };
});
