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

    const labels = recentData.map(item => item.date);
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
            maintainAspectRatio: false
        }
    });
}

let shortTermChart = null;

// 短線趨勢圖：股價 + MA5
export function renderShortTermChart(data, ma5History) {
    const canvas = document.getElementById("shortTermChart");

    if (!canvas) {
        return;
    }

    const recentData = data.slice(-100);
    const recentMA5 = ma5History.slice(-100);

    const labels = recentData.map(item => item.date);
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
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    label: "MA5",
                    data: ma5,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}