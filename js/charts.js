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