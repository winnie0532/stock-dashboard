let etfDetailData = null;
let etfChart = null;

export function updateETFDetailData(data) {
    etfDetailData = data;

    const trigger = document.getElementById("stockProfileTrigger");

    trigger.classList.toggle("is-available", Boolean(data));
    trigger.setAttribute("aria-disabled", String(!data));
}

export function setupETFDetailOverlay() {
    const trigger = document.getElementById("stockProfileTrigger");
    const overlay = document.getElementById("etfDetailOverlay");
    const closeButton = document.getElementById("closeETFDetail");

    trigger.addEventListener("click", () => {
        if (!etfDetailData) {
            return;
        }

        renderETFDetail();
        overlay.classList.add("open");
    });

    closeButton.addEventListener("click", () => {
        overlay.classList.remove("open");
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            overlay.classList.remove("open");
        }
    });
}

function renderETFDetail() {
    const { stockId, stockName, navData } = etfDetailData;
    const latest = navData.latest;

    document.getElementById("etfDetailTitle").textContent =
        `${stockId} ${stockName}`;

    document.getElementById("etfDetailSubtitle").textContent =
        `資料更新：${latest.date}｜TWSE ETF e添富`;

    document.getElementById("etfMarketPrice").textContent =
        latest.marketPrice.toFixed(2);

    document.getElementById("etfNav").textContent =
        latest.nav.toFixed(2);

    const premiumElement =
        document.getElementById("etfPremiumDiscount");

    premiumElement.textContent =
        `${latest.premiumDiscountPercent >= 0 ? "+" : ""}` +
        `${latest.premiumDiscountPercent.toFixed(2)}%`;

    premiumElement.className =
        `detail-summary-value ${
            latest.premiumDiscountPercent > 0
                ? "value-up"
                : latest.premiumDiscountPercent < 0
                    ? "value-down"
                    : "value-neutral"
        }`;

    renderETFChart(navData.history);
}

function renderETFChart(history) {
    if (etfChart) {
        etfChart.destroy();
    }

    etfChart = new Chart(
        document.getElementById("etfNavChart"),
        {
            data: {
                labels: history.map(item => item.date),

                datasets: [
                    {
                        type: "line",
                        label: "市價",
                        data: history.map(item => item.marketPrice),

                        borderColor: "#2563eb",
                        backgroundColor: "rgba(37, 99, 235, 0.10)",

                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.25,
                        fill: true,

                        yAxisID: "price"
                    },

                    {
                        type: "line",
                        label: "淨值 NAV",
                        data: history.map(item => item.nav),

                        borderColor: "#f59e0b",

                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.25,

                        yAxisID: "price"
                    },

                    {
                        type: "bar",
                        label: "折溢價 %",
                        data: history.map(
                            item => item.premiumDiscountPercent
                        ),

                        backgroundColor: history.map(item =>
                            item.premiumDiscountPercent >= 0
                                ? "rgba(220, 38, 38, 0.55)"
                                : "rgba(5, 150, 105, 0.55)"
                        ),

                        yAxisID: "premium"
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
                    price: {
                        position: "left",

                        title: {
                            display: true,
                            text: "元"
                        }
                    },

                    premium: {
                        position: "right",

                        title: {
                            display: true,
                            text: "折溢價 %"
                        },

                        grid: {
                            drawOnChartArea: false
                        },

                        ticks: {
                            callback: value => `${value}%`
                        }
                    },

                    x: {
                        ticks: {
                            maxTicksLimit: 8
                        }
                    }
                }
            }
        }
    );
}