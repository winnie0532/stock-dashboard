import {
    renderShortTermChart,
    renderTrendChart
} from "../utils/charts.js";

let detailOverlayData = null;

export function updateDetailOverlayData(data) {
    detailOverlayData = data;
}

export function setupDetailOverlay() {
    const volumeToggle = document.getElementById("volumeToggle");
    const shortTermToggle = document.getElementById("shortTermToggle");
    const trendToggle = document.getElementById("trendToggle");

    const detailOverlay = document.getElementById("detailOverlay");
    const closeDetail = document.getElementById("closeDetail");

    const detailTitle = document.getElementById("detailTitle");
    const detailSubtitle = document.getElementById("detailSubtitle");

    const volumeChartSection = document.getElementById("volumeChartSection");
    const shortTermChartSection = document.getElementById("shortTermChartSection");
    const trendChartSection = document.getElementById("trendChartSection");


    // =========================
    // 成交量
    // =========================

    volumeToggle.addEventListener("click", () => {
        if (!detailOverlayData) {
            return;
        }

        detailTitle.textContent = "成交量分析";
        detailSubtitle.textContent = "近期成交量與 20 日平均量";

        volumeChartSection.style.display = "block";
        shortTermChartSection.style.display = "none";
        trendChartSection.style.display = "none";

        detailOverlay.classList.add("open");
    });


    // =========================
    // 短線
    // =========================

    shortTermToggle.addEventListener("click", () => {
        if (!detailOverlayData) {
            return;
        }

        detailTitle.textContent = "短線趨勢";
        detailSubtitle.textContent = "近 100 個交易日｜股價與 MA5";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "block";
        trendChartSection.style.display = "none";

        detailOverlay.classList.add("open");

        renderShortTermChart(
            detailOverlayData.data,
            detailOverlayData.ma5History
        );
    });


    // =========================
    // 趨勢
    // =========================

    trendToggle.addEventListener("click", () => {
        if (!detailOverlayData) {
            return;
        }

        detailTitle.textContent = "中長期趨勢";

        detailSubtitle.textContent =
            "近 250 個交易日｜股價與 MA20 / MA60 / MA120 / MA240";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "none";
        trendChartSection.style.display = "block";

        detailOverlay.classList.add("open");

        renderTrendChart(
            detailOverlayData.data,
            detailOverlayData.ma20History,
            detailOverlayData.ma60History,
            detailOverlayData.ma120History,
            detailOverlayData.ma240History
        );
    });


    // =========================
    // 關閉
    // =========================

    closeDetail.addEventListener("click", () => {
        detailOverlay.classList.remove("open");
    });
}