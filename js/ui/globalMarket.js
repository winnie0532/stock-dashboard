import {
    formatGlobalMarketChange,
    formatGlobalMarketValue,
    getGlobalMarketChangeClass
} from "../status/globalMarketStatus.js";

import { openUsdTwdDetail } from "./globalMarketDetail.js";

export function renderGlobalMarket({
    markets = [],
    source = "--"
} = {}) {
    const grid = document.getElementById("globalMarketGrid");
    const sourceElement = document.getElementById("globalMarketSource");

    if (!grid || !sourceElement) {
        return;
    }

    grid.innerHTML = "";
    sourceElement.textContent = source;

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
            `global-market-change ${
                getGlobalMarketChangeClass(market.change)
            }`;

        change.textContent =
            formatGlobalMarketChange(market);

        card.append(category, name, value, change);

        if (market.id === "usdTwd") {
            card.classList.add("global-market-card-clickable");
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            card.addEventListener("click", openUsdTwdDetail);

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openUsdTwdDetail();
                }
            });
        }

        grid.appendChild(card);
    });
}