// zoom 設定
const chartZoomOptions = {
    pan: {
        enabled: true,
        mode: "x"
    },

    zoom: {
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

// 成交量趨勢圖：每日成交量 + 20 日均量
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
            const total = window.reduce((sum, item) => sum + item.volume, 0);

            avgVolume20 = total / 20;
        }

        return {
            date: item.date,
            volume: item.volume,
            avgVolume20
        };
    });

    // 最後才取最近 100 個交易日
    const recentData = volumeData.slice(-100);

    const labels = recentData.map(item => formatChartDate(item.date))
    const volumes = recentData.map(item => item.volume);
    const average20 = recentData.map(item => item.avgVolume20);

    new Chart(canvas, {
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
            plugins: {zoom: chartZoomOptions}
        }
    });
}

let shortTermChart = null;

// 趨勢圖：股價 + MA20 / MA60 / MA120 / MA240
export function renderTrendChart(
    data,
    ma20History,
    ma60History,
    ma120History,
    ma240History
) {
    const canvas = document.getElementById("trendChart");

    if (!canvas) {
        return;
    }

    const recentData = data.slice(-250);
    const recentMA20 = ma20History.slice(-250);
    const recentMA60 = ma60History.slice(-250);
    const recentMA120 = ma120History.slice(-250);
    const recentMA240 = ma240History.slice(-250);

    const labels = recentData.map(item => formatChartDate(item.date))

    const prices = recentData.map(item => item.close);
    const ma20 = recentMA20.map(item => item.value);
    const ma60 = recentMA60.map(item => item.value);
    const ma120 = recentMA120.map(item => item.value);
    const ma240 = recentMA240.map(item => item.value);

    new Chart(canvas, {
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
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {zoom: chartZoomOptions}
        }
    });
}

// 短線趨勢圖：股價 + MA5
export function renderShortTermChart(data, ma5History) {
    const canvas = document.getElementById("shortTermChart");

    if (!canvas) {
        return;
    }

    const recentData = data.slice(-100);
    const recentMA5 = ma5History.slice(-100);

    const labels = recentData.map(item => formatChartDate(item.date))
    const prices = recentData.map(item => item.close);
    const ma5 = recentMA5.map(item => item.value);

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
            plugins: {zoom: chartZoomOptions}
        }
    });
}

// 趨勢圖：融資融券
let creditChart = null;

export function renderCreditChart(priceData, marginData) {
    if (!priceData || !marginData) {
        return;
    }

    const recentPrices = priceData.slice(-100);

    const marginMap = new Map(
        marginData.map(item => [
            item.date,
            item.MarginPurchaseTodayBalance
        ])
    );

    const merged = recentPrices
        .map(item => ({
            date: item.date,
            price: item.close,
            margin: marginMap.get(item.date)
        }))
        .filter(item => item.margin !== undefined);

    if (merged.length === 0) {
        return;
    }

    const canvas = document.getElementById("creditChart");
    const ctx = canvas.getContext("2d");

    if (creditChart) {
        creditChart.destroy();
    }

    creditChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: merged.map(item => formatChartDate(item.date)),

            datasets: [
                {
                    label: "股價",
                    data: merged.map(item => item.price),
                    yAxisID: "priceAxis",

                    borderColor: "#36a2eb",
                    backgroundColor: "rgba(54, 162, 235, 0.10)",

                    fill: true,

                    tension: 0.25,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "融資餘額",
                    data: merged.map(item => item.margin),
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

                zoom: {
                    pan: {
                        enabled: true,
                        mode: "x"
                    },

                    zoom: {
                        pinch: {
                            enabled: true
                        },

                        wheel: {
                            enabled: true
                        },

                        mode: "x"
                    }
                }
            }
        }
    });
}

// 借券賣出餘額圖
let shortPositionChart = null;

export function renderShortPositionChart(
    priceData,
    shortSaleBalanceData
) {
    if (!priceData || !shortSaleBalanceData) {
        return;
    }

    const recentPrices = priceData.slice(-100);

    const shortSaleMap = new Map(
        shortSaleBalanceData.map(item => [
            item.date,
            item.SBLShortSalesCurrentDayBalance
        ])
    );

    const merged = recentPrices
        .map(item => ({
            date: item.date,
            price: item.close,
            shortBalance: shortSaleMap.get(item.date)
        }))
        .filter(item => item.shortBalance !== undefined);

    if (merged.length === 0) {
        return;
    }

    const canvas =
        document.getElementById("shortPositionChart");

    const ctx = canvas.getContext("2d");

    if (shortPositionChart) {
        shortPositionChart.destroy();
    }

    shortPositionChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: merged.map(item =>
                formatChartDate(item.date)
            ),

            datasets: [
                {
                    label: "股價",
                    data: merged.map(item => item.price),
                    yAxisID: "priceAxis",

                    borderColor: "#36a2eb",
                    backgroundColor: "rgba(54, 162, 235, 0.10)",
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

                zoom: {
                    pan: {
                        enabled: true,
                        mode: "x"
                    },

                    zoom: {
                        pinch: {
                            enabled: true
                        },

                        wheel: {
                            enabled: true
                        },

                        mode: "x"
                    }
                }
            }
        }
    });
}



function formatChartDate(date) {
    if (!date) {
        return "";
    }

    return date.slice(5);
}
