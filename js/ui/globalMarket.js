import {
    formatGlobalMarketValue,
    getGlobalMarketChangeClass
} from "../status/globalMarketStatus.js";

export function renderGlobalMarket({
    markets = [],
    source = "--",
    updatedAt = "--"
} = {}) {
    const grid = document.getElementById("globalMarketGrid");
    const sourceElement = document.getElementById("globalMarketSource");
    const updatedAtElement = document.getElementById("globalMarketUpdatedAt");

    if (!grid || !sourceElement || !updatedAtElement) {
        return;
    }

    grid.innerHTML = "";
    sourceElement.textContent = source;
    updatedAtElement.textContent = `更新：${updatedAt}`;

    if (markets.length === 0) {
        const empty = document.createElement("p");

        empty.className = "global-market-empty";
        empty.textContent = "目前無法取得國際市場資料";

        grid.appendChild(empty);
        return;
    }

    markets.forEach(market => {
        const card = document.createElement("article");
        card.className = "global-market-card";

        const category = document.createElement("span");
        category.className = "global-market-category";
        category.textContent = market.category;

        const name = document.createElement("h3");
        name.className = "global-market-name";
        name.textContent = market.name;

        const value = document.createElement("strong");
        value.className = "global-market-value";
        value.textContent = formatGlobalMarketValue(market);

        const change = document.createElement("span");
        change.className =
            `global-market-change ${getGlobalMarketChangeClass(market.change)}`;

        change.textContent =
            `${market.change >= 0 ? "+" : ""}${market.change.toFixed(2)}%`;

        card.append(category, name, value, change);
        grid.appendChild(card);
    });
}