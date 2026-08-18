export function renderVolumeChart(data) {
    const canvas = document.getElementById("volumeChart");

    if (!canvas) {
        return;
    }

    const recentData = data.slice(-60);

    const labels = recentData.map(item => item.date);
    const volumes = recentData.map(item => item.volume);

    const average20 = recentData.map((_, index) => {
        if (index < 19) {
            return null;
        }

        const window = recentData.slice(index - 19, index + 1);
        const total = window.reduce((sum, item) => sum + item.volume, 0);

        return total / 20;
    });

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