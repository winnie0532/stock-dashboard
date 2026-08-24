// =========================
// 共用圖表設定
// =========================

function formatChartDate(date) {
    if (!date) {
        return "";
    }

    return date.slice(5);
}


function createZoomOptions() {
    return {
        pan: {
            enabled: true,
            mode: "x"
        },

        zoom: {
            wheel: {
                enabled: true
            },

            pinch: {
                enabled: true
            },

            mode: "x"
        },

        limits: {
            x: {
                min: "original",
                max: "original",
                minRange: 10
            }
        }
    };
}
function formatQuarter(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const quarter =
        Math.ceil(month / 3);

    return `${year} Q${quarter}`;
}

function formatRevenueMonth(date) {
    const [year, month] = date.split("-");

    return `${year.slice(2)}/${month}`;
}
// =========================
// Chart instances
// =========================

let trendChart = null;
let shortTermChart = null;
let volumeChart = null;
let rsiChart = null;
let macdChart = null;
let institutionalChart = null;
let creditChart = null;
let shortPositionChart = null;
let profitabilityChartInstance = null;
let valuationChart = null;
let growthChart = null;

// =========================
// 成交量趨勢圖
// 每日成交量 + 20 日平均量
// =========================

export function renderVolumeChart(data) {
    const canvas = document.getElementById("volumeChart");

    if (!canvas) {
        return;
    }

    // 完整歷史資料計算每一天的 20 日平均量
    const volumeData = data.map((item, index) => {
        let avgVolume20 = null;

        if (index >= 19) {
            const window = data.slice(index - 19, index + 1);

            const total = window.reduce(
                (sum, item) => sum + item.volume,
                0
            );

            avgVolume20 = total / 20;
        }

        return {
            date: item.date,
            volume: item.volume,
            avgVolume20
        };
    });


    // 最近 100 個交易日
    const recentData = volumeData.slice(-100);

    const labels = recentData.map(
        item => formatChartDate(item.date)
    );

    const volumes = recentData.map(
        item => item.volume
    );

    const average20 = recentData.map(
        item => item.avgVolume20
    );


    // 避免重複建立 Chart instance
    if (volumeChart) {
        volumeChart.destroy();
    }


    volumeChart = new Chart(canvas, {
        data: {
            labels,

            datasets: [
                {
                    type: "bar",
                    label: "每日成交量",
                    data: volumes
                },

                {
                    type: "line",
                    label: "20 日平均量",
                    data: average20,

                    pointRadius: 0,
                    borderWidth: 2,
                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                zoom: createZoomOptions()
            }
        }
    });
}


// =========================
// 短線趨勢圖
// 股價 + MA5
// =========================

export function renderShortTermChart(
    data,
    ma5History
) {
    const canvas =
        document.getElementById("shortTermChart");

    if (!canvas) {
        return;
    }


    const recentData = data.slice(-100);
    const recentMA5 = ma5History.slice(-100);


    const labels = recentData.map(
        item => formatChartDate(item.date)
    );

    const prices = recentData.map(
        item => item.close
    );

    const ma5 = recentMA5.map(
        item => item.value
    );


    if (shortTermChart) {
        shortTermChart.destroy();
    }


    shortTermChart = new Chart(canvas, {
        type: "line",

        data: {
            labels,

            datasets: [
                {
                    label: "股價",
                    data: prices,

                    borderColor: "#2196f3",
                    backgroundColor: "rgba(33, 150, 243, 0.10)",

                    fill: true,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    label: "MA5",
                    data: ma5,

                    borderColor: "#ff6384",

                    fill: false,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                zoom: createZoomOptions()
            }
        }
    });
}


// =========================
// 中長期趨勢圖
// 股價 + MA20 / MA60 / MA120 / MA240
// =========================

export function renderTrendChart(
    data,
    ma20History,
    ma60History,
    ma120History,
    ma240History
) {
    const canvas =
        document.getElementById("trendChart");

    if (!canvas) {
        return;
    }


    const recentData = data.slice(-250);
    const recentMA20 = ma20History.slice(-250);
    const recentMA60 = ma60History.slice(-250);
    const recentMA120 = ma120History.slice(-250);
    const recentMA240 = ma240History.slice(-250);

    const labels = recentData.map(item => formatChartDate(item.date));
    const prices = recentData.map(item => item.close);
    const ma20 = recentMA20.map(item => item.value);
    const ma60 = recentMA60.map(item => item.value);
    const ma120 = recentMA120.map(item => item.value);
    const ma240 = recentMA240.map(item => item.value);


    if (trendChart) {
        trendChart.destroy();
    }


    trendChart = new Chart(canvas, {
        type: "line",

        data: {
            labels,

            datasets: [
                {
                    label: "MA20",
                    data: ma20,

                    borderColor: "#ff6384",

                    fill: false,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    label: "MA60",
                    data: ma60,

                    borderColor: "#ff9f40",

                    fill: false,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    label: "MA120",
                    data: ma120,

                    borderColor: "#ffcd56",

                    fill: false,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    label: "MA240",
                    data: ma240,

                    borderColor: "#4bc0c0",

                    fill: false,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    label: "股價",
                    data: prices,

                    borderColor: "#2196f3",
                    backgroundColor: "rgba(33, 150, 243, 0.10)",

                    fill: true,

                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// RSI 圖
// 近 100 日 RSI + 70 / 30 參考線
// =========================

export function renderRSIChart(rsiHistory) {
    if (!rsiHistory || rsiHistory.length === 0) {
        return;
    }

    const recentData = rsiHistory.slice(-100);

    const canvas = document.getElementById("rsiChart");

    if (!canvas) {
        return;
    }

    if (rsiChart) {
        rsiChart.destroy();
    }

    rsiChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: recentData.map(
                item => formatChartDate(item.date)
            ),

            datasets: [
                {
                    label: "RSI(14)",
                    data: recentData.map(item => item.value),

                    borderColor: "#2196f3",
                    backgroundColor: "rgba(33, 150, 243, 0.08)",

                    fill: true,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    label: "70 過熱線",
                    data: recentData.map(() => 70),

                    borderColor: "#ef4444",
                    borderDash: [6, 6],

                    fill: false,
                    borderWidth: 1,
                    pointRadius: 0
                },

                {
                    label: "30 超賣線",
                    data: recentData.map(() => 30),

                    borderColor: "#10b981",
                    borderDash: [6, 6],

                    fill: false,
                    borderWidth: 1,
                    pointRadius: 0
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
                y: {
                    min: 0,
                    max: 100,

                    ticks: {
                        stepSize: 10
                    },

                    title: {
                        display: true,
                        text: "RSI"
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                },

                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// MACD 圖
// DIF + Signal + Histogram
// =========================

export function renderMACDChart(macdHistory) {
    if (!macdHistory || macdHistory.length === 0) {
        return;
    }

    const recentData = macdHistory.slice(-100);
    const canvas = document.getElementById("macdChart");

    if (!canvas) {
        return;
    }

    if (macdChart) {
        macdChart.destroy();
    }

    macdChart = new Chart(canvas, {
        data: {
            labels: recentData.map(item => formatChartDate(item.date)),

            datasets: [
                {
                    type: "bar",
                    label: "Histogram",
                    data: recentData.map(item => item.histogram),
                    yAxisID: "macdAxis"
                },
                {
                    type: "line",
                    label: "DIF",
                    data: recentData.map(item => item.dif),
                    yAxisID: "macdAxis",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    type: "line",
                    label: "Signal",
                    data: recentData.map(item => item.signal),
                    yAxisID: "macdAxis",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
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
                macdAxis: {
                    type: "linear",
                    position: "left",

                    title: {
                        display: true,
                        text: "MACD"
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                },

                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// 法人買賣超趨勢圖
// 外資 + 投信 + 自營商
// =========================

export function renderInstitutionalChart(history) {
    if (!history || history.length === 0) {
        return;
    }

    const recentData = history.slice(-100);
    const canvas = document.getElementById("institutionalChart");

    if (!canvas) {
        return;
    }

    if (institutionalChart) {
        institutionalChart.destroy();
    }

    institutionalChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: recentData.map(item => formatChartDate(item.date)),

            datasets: [
                {
                    label: "外資",
                    data: recentData.map(item => item.foreign / 1000),
                    backgroundColor: recentData.map(item =>
                        item.foreign >= 0
                            ? "rgba(220, 38, 38, 0.65)"
                            : "rgba(5, 150, 105, 0.65)"
                    )
                },
                {
                    label: "投信",
                    data: recentData.map(item => item.trust / 1000),
                    backgroundColor: recentData.map(item =>
                        item.trust >= 0
                            ? "rgba(220, 38, 38, 0.65)"
                            : "rgba(5, 150, 105, 0.65)"
                    )
                },
                {
                    label: "自營商",
                    data: recentData.map(item => item.dealer / 1000),
                    backgroundColor: recentData.map(item =>
                        item.dealer >= 0
                            ? "rgba(220, 38, 38, 0.65)"
                            : "rgba(5, 150, 105, 0.65)"
                    )
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
                y: {
                    title: {
                        display: true,
                        text: "買賣超（張）"
                    }
                }
            },

            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        pointStyle: "line"
                    }
                },

                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// 信用籌碼趨勢圖
// 股價 + 融資餘額
// =========================

export function renderCreditChart(
    priceData,
    marginData
) {
    if (!priceData || !marginData) {
        return;
    }


    const recentPrices =
        priceData.slice(-100);


    // 日期 → 融資餘額
    const marginMap = new Map(
        marginData.map(item => [
            item.date,
            item.MarginPurchaseTodayBalance
        ])
    );


    // 用日期對齊股價與融資資料
    const merged = recentPrices
        .map(item => ({
            date: item.date,
            price: item.close,
            margin: marginMap.get(item.date)
        }))
        .filter(
            item => item.margin !== undefined
        );


    if (merged.length === 0) {
        return;
    }


    const canvas =
        document.getElementById("creditChart");

    if (!canvas) {
        return;
    }


    if (creditChart) {
        creditChart.destroy();
    }


    creditChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: merged.map(
                item => formatChartDate(item.date)
            ),

            datasets: [
                {
                    label: "股價",

                    data: merged.map(
                        item => item.price
                    ),

                    yAxisID: "priceAxis",

                    borderColor: "#36a2eb",
                    backgroundColor:
                        "rgba(54, 162, 235, 0.10)",

                    fill: true,

                    tension: 0.25,
                    pointRadius: 0,
                    borderWidth: 2
                },

                {
                    label: "融資餘額",

                    data: merged.map(
                        item => item.margin
                    ),

                    yAxisID: "marginAxis",

                    borderColor: "#ff6384",

                    fill: false,

                    tension: 0.25,
                    pointRadius: 0,
                    borderWidth: 2
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
                priceAxis: {
                    type: "linear",
                    position: "left",

                    title: {
                        display: true,
                        text: "股價"
                    }
                },

                marginAxis: {
                    type: "linear",
                    position: "right",

                    title: {
                        display: true,
                        text: "融資餘額（張）"
                    },

                    grid: {
                        drawOnChartArea: false
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                },

                zoom: createZoomOptions()
            }
        }
    });
}


// =========================
// 空方籌碼趨勢圖
// 股價 + 借券賣出餘額
// =========================

export function renderShortPositionChart(
    priceData,
    shortSaleBalanceData
) {
    if (!priceData || !shortSaleBalanceData) {
        return;
    }


    const recentPrices =
        priceData.slice(-100);


    // 日期 → 借券賣出餘額
    const shortSaleMap = new Map(
        shortSaleBalanceData.map(item => [
            item.date,
            item.SBLShortSalesCurrentDayBalance
        ])
    );


    // 用日期對齊
    const merged = recentPrices
        .map(item => ({
            date: item.date,
            price: item.close,
            shortBalance:
                shortSaleMap.get(item.date)
        }))
        .filter(
            item => item.shortBalance !== undefined
        );


    if (merged.length === 0) {
        return;
    }


    const canvas =
        document.getElementById(
            "shortPositionChart"
        );

    if (!canvas) {
        return;
    }


    if (shortPositionChart) {
        shortPositionChart.destroy();
    }


    shortPositionChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: merged.map(
                item => formatChartDate(item.date)
            ),

            datasets: [
                {
                    label: "股價",

                    data: merged.map(
                        item => item.price
                    ),

                    yAxisID: "priceAxis",

                    borderColor: "#36a2eb",
                    backgroundColor:
                        "rgba(54, 162, 235, 0.10)",

                    fill: true,

                    tension: 0.25,
                    pointRadius: 0,
                    borderWidth: 2
                },

                {
                    label: "借券賣出餘額",

                    data: merged.map(
                        item => item.shortBalance / 1000
                    ),

                    yAxisID: "shortAxis",

                    borderColor: "#ff6384",

                    fill: false,

                    tension: 0.25,
                    pointRadius: 0,
                    borderWidth: 2
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
                priceAxis: {
                    type: "linear",
                    position: "left",

                    title: {
                        display: true,
                        text: "股價"
                    }
                },

                shortAxis: {
                    type: "linear",
                    position: "right",

                    title: {
                        display: true,
                        text: "借券賣出餘額（張）"
                    },

                    grid: {
                        drawOnChartArea: false
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                },

                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// TTM EPS ROE 趨勢圖
// =========================
export function renderProfitabilityChart(
    ttmEPSHistory,
    roeHistory
) {
    if (
        !ttmEPSHistory ||
        !roeHistory ||
        ttmEPSHistory.length === 0 ||
        roeHistory.length === 0
    ) {
        return;
    }

    const canvas =
        document.getElementById("profitabilityChart");

    if (!canvas) {
        return;
    }

    // ROE 日期 → ROE
    const roeMap = new Map(
        roeHistory.map(item => [
            item.date,
            item.roe
        ])
    );

    // 用日期對齊 EPS / ROE
    const merged = ttmEPSHistory
        .map(item => ({
            date: item.date,
            eps: item.eps,
            roe: roeMap.get(item.date)
        }))
        .filter(item => item.roe != null);

    if (merged.length === 0) {
        return;
    }

    if (profitabilityChartInstance) {
        profitabilityChartInstance.destroy();
    }

    profitabilityChartInstance =
        new Chart(canvas, {
            type: "bar",

            data: {
                labels: merged.map(
                    item => formatQuarter(item.date)
                ),

                datasets: [
                    {
                        label: "EPS (TTM)",
                        data: merged.map(
                            item => item.eps
                        ),

                        yAxisID: "epsAxis"
                    },

                    {
                        label: "ROE (TTM)",
                        data: merged.map(
                            item => item.roe
                        ),

                        yAxisID: "roeAxis"
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
                    epsAxis: {
                        type: "linear",
                        position: "left",

                        title: {
                            display: true,
                            text: "TTM EPS（元）"
                        }
                    },

                    roeAxis: {
                        type: "linear",
                        position: "right",

                        title: {
                            display: true,
                            text: "ROE（%）"
                        },

                        grid: {
                            drawOnChartArea: false
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

// =========================
// 估值歷史趨勢圖
// P/E + P/B + 殖利率
// =========================

export function renderValuationChart(history) {
    if (!history || history.length === 0) {
        return;
    }

    const canvas =
        document.getElementById("valuationChart");

    if (!canvas) {
        return;
    }

    const validData = history
        .filter(item =>
            item.date &&
            (
                item.PER != null ||
                item.PBR != null ||
                item.dividend_yield != null
            )
        )
        .sort(
            (a, b) =>
                new Date(a.date) - new Date(b.date)
        );

    if (validData.length === 0) {
        return;
    }

    if (valuationChart) {
        valuationChart.destroy();
    }

    valuationChart = new Chart(canvas, {

        data: {
            labels: validData.map(item => item.date),

            datasets: [
                {
                    type: "line",
                    label: "P/E",

                    data: validData.map(
                        item =>
                            item.PER > 0
                                ? item.PER
                                : null
                    ),

                    yAxisID: "valuationAxis",

                    borderColor: "#2196f3",

                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    type: "line",
                    label: "P/B",

                    data: validData.map(
                        item =>
                            item.PBR > 0
                                ? item.PBR
                                : null
                    ),

                    yAxisID: "valuationAxis",

                    borderColor: "#ff6384",

                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },

                {
                    type: "bar",

                    label: "殖利率",

                    data: validData.map(
                        item =>
                            item.dividend_yield >= 0
                                ? item.dividend_yield
                                : null
                    ),

                    yAxisID: "yieldAxis",

                    backgroundColor: "rgba(75, 192, 192, 0.18)",
                    borderColor: "rgba(75, 192, 192, 0.35)",
                    borderWidth: 0,

                    barPercentage: 1.0,
                    categoryPercentage: 1.0
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
                valuationAxis: {
                    type: "linear",
                    position: "left",

                    title: {
                        display: true,
                        text: "估值倍數"
                    }
                },

                yieldAxis: {
                    type: "linear",
                    position: "right",

                    title: {
                        display: true,
                        text: "殖利率（%）"
                    },

                    grid: {
                        drawOnChartArea: false
                    }
                }
            },

            plugins: {
                legend: {
                    display: true
                },

                zoom: createZoomOptions()
            }
        }
    });
}

// =========================
// 月營收 YoY
// =========================

export function renderGrowthChart(history) {
    if (!history || history.length === 0) return;

    const canvas = document.getElementById("growthChart");
    if (!canvas) return;

    const data = history
        .filter(item => item.date && item.yoy != null)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-18);

    if (data.length === 0) return;

    if (growthChart) {
        growthChart.destroy();
    }

    growthChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: data.map(item => formatRevenueMonth(item.date)),

            datasets: [{
                label: "月營收 YoY",
                data: data.map(item => item.yoy),

                backgroundColor: context => {
                    const value = context.raw;

                    return value >= 0
                        ? "rgba(76, 175, 80, 0.55)"
                        : "rgba(244, 67, 54, 0.55)";
                },

                borderWidth: 0,
                borderRadius: 3
            }]
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
                    grid: {
                        display: false
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "YoY（%）"
                    },

                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.raw;

                            return `YoY ${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
                        }
                    }
                },

                zoom: createZoomOptions()
            }
        }
    });
}