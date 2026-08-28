import { getUsdTwdHistoryByPeriod } from "../indicators/globalMarket.js";

let usdTwdData = null;
let usdTwdChart = null;
let activePeriod = "6M";

export function updateGlobalMarketDetailData(data) {
    usdTwdData = data;
}

export function setupGlobalMarketDetail() {
    const overlay = document.getElementById("globalDetailOverlay");
    const closeButton = document.getElementById("closeGlobalDetail");
    const periodButtons = document.querySelectorAll(
        "[data-usd-twd-period]"
    );

    if (!overlay || !closeButton) {
        return;
    }

    closeButton.addEventListener("click", () => {
        overlay.classList.remove("open");
    });

    periodButtons.forEach(button => {
        button.addEventListener("click", () => {
            activePeriod = button.dataset.usdTwdPeriod;

            periodButtons.forEach(item => {
                item.classList.toggle(
                    "active",
                    item.dataset.usdTwdPeriod === activePeriod
                );
            });

            renderUsdTwdDetail();
        });
    });
}

export function openUsdTwdDetail() {
    const overlay = document.getElementById("globalDetailOverlay");

    if (!overlay || !usdTwdData) {
        return;
    }

    overlay.classList.add("open");
    renderUsdTwdDetail();
}

function renderUsdTwdDetail() {
    if (!usdTwdData) {
        return;
    }

    const history = getUsdTwdHistoryByPeriod(
        usdTwdData.history,
        activePeriod
    );

    document.getElementById("usdTwdLatest").textContent =
        usdTwdData.latest.toFixed(3);

    renderChange(
        "usdTwdChange1M",
        usdTwdData.changes.oneMonth
    );

    renderChange(
        "usdTwdChange3M",
        usdTwdData.changes.threeMonths
    );

    renderChange(
        "usdTwdChange6M",
        usdTwdData.changes.sixMonths
    );

    renderRange(usdTwdData.range);

    document.getElementById("usdTwdDetailDescription").textContent =
        `美元／台幣即期賣出匯率｜${activePeriod} 趨勢與 MA20 / MA60`;

    renderUsdTwdChart(history);
}

function renderChange(elementId, change) {
    const element = document.getElementById(elementId);

    if (change == null) {
        element.textContent = "--";
        element.className = "";
        return;
    }

    element.textContent =
        `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

    element.className =
        change > 0
            ? "value-up"
            : change < 0
                ? "value-down"
                : "value-neutral";
}

function renderRange(range) {
    if (!range) {
        return;
    }

    document.getElementById("usdTwdRangeLow").textContent =
        range.low.toFixed(3);

    document.getElementById("usdTwdRangeHigh").textContent =
        range.high.toFixed(3);

    document.getElementById("usdTwdRangePosition").style.width =
        `${range.position.toFixed(1)}%`;

    document.getElementById("usdTwdRangeText").textContent =
        `目前位於近一年區間 ${range.position.toFixed(0)}%`;
}

function renderUsdTwdChart(history) {
    const canvas = document.getElementById("usdTwdChart");

    if (!canvas || history.length === 0) {
        return;
    }

    if (usdTwdChart) {
        usdTwdChart.destroy();
    }

    usdTwdChart = new Chart(canvas, {
        type: "line",

        data: {
            datasets: [
                {
                    label: "美元／台幣",

                    data: history.map(item => ({
                        x: new Date(
                            `${item.date}T00:00:00`
                        ).getTime(),
                        y: item.value
                    })),

                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.10)",

                    fill: true,
                    tension: 0.2,
                    pointRadius: 0,
                    borderWidth: 2
                },

                {
                    label: "MA20",

                    data: history
                        .filter(item => item.ma20 != null)
                        .map(item => ({
                            x: new Date(
                                `${item.date}T00:00:00`
                            ).getTime(),
                            y: item.ma20
                        })),

                    borderColor: "#f59e0b",
                    tension: 0.2,
                    pointRadius: 0,
                    borderWidth: 1.5
                },

                {
                    label: "MA60",

                    data: history
                        .filter(item => item.ma60 != null)
                        .map(item => ({
                            x: new Date(
                                `${item.date}T00:00:00`
                            ).getTime(),
                            y: item.ma60
                        })),

                    borderColor: "#8b5cf6",
                    tension: 0.2,
                    pointRadius: 0,
                    borderWidth: 1.5
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            scales: {
                x: {
                    type: "time",

                    time: {
                        unit: "month",
                        tooltipFormat: "yyyy-MM-dd",

                        displayFormats: {
                            month: "yyyy-MM"
                        }
                    },

                    ticks: {
                        maxTicksLimit: 6
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "匯率"
                    },

                    ticks: {
                        callback: value =>
                            Number(value).toFixed(2)
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}