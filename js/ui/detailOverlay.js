import {
    renderShortTermChart,
    renderTrendChart,
    renderCreditChart,
    renderShortPositionChart
} from "../utils/charts.js";

let detailOverlayData = null;

export function updateDetailOverlayData(data) {
    detailOverlayData = data;
}

export function setupDetailOverlay() {
    const volumeToggle = document.getElementById("volumeToggle");
    const shortTermToggle = document.getElementById("shortTermToggle");
    const trendToggle = document.getElementById("trendToggle");
    const creditToggle = document.getElementById("creditToggle");
    const shortPositionToggle = document.getElementById("shortPositionToggle");

    const detailOverlay = document.getElementById("detailOverlay");
    const closeDetail = document.getElementById("closeDetail");

    const detailTitle = document.getElementById("detailTitle");
    const detailSubtitle = document.getElementById("detailSubtitle");

    const volumeChartSection = document.getElementById("volumeChartSection");
    const shortTermChartSection = document.getElementById("shortTermChartSection");
    const trendChartSection = document.getElementById("trendChartSection");
    const creditChartSection = document.getElementById("creditChartSection");
    const shortPositionChartSection = document.getElementById("shortPositionChartSection");


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
        creditChartSection.style.display = "none";
        shortPositionChartSection.style.display = "none";

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
        creditChartSection.style.display = "none";
        shortPositionChartSection.style.display = "none";

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

        const trend = detailOverlayData.trend;

        detailTitle.textContent = "中長期趨勢";
        detailSubtitle.textContent = "近 250 個交易日｜股價與 MA20 / MA60 / MA120 / MA240";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "none";
        trendChartSection.style.display = "block";
        creditChartSection.style.display = "none";
        shortPositionChartSection.style.display = "none";
        
        const statusElement = document.getElementById("trendDetailStatus");
        statusElement.textContent = trend.status.text;
        statusElement.className = `status-value ${trend.status.type}`;

        document.getElementById("trendDetailDescription").textContent = trend.status.description;
        renderPercentValue("ma20Deviation", trend.deviations.ma20);
        renderPercentValue("ma60Deviation", trend.deviations.ma60);
        renderPercentValue("ma120Deviation", trend.deviations.ma120);
        renderPercentValue("ma240Deviation", trend.deviations.ma240);


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
    // 信用籌碼
    // =========================

    creditToggle.addEventListener("click", () => {
        if (!detailOverlayData?.credit) {
            return;
        }

        const credit = detailOverlayData.credit;

        detailTitle.textContent = "信用籌碼";
        detailSubtitle.textContent = "近 100 個交易日｜股價與融資餘額";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "none";
        trendChartSection.style.display = "none";
        creditChartSection.style.display = "block";
        shortPositionChartSection.style.display = "none";

        // 信用籌碼狀態
        const statusElement = document.getElementById("creditDetailStatus");

        statusElement.textContent = credit.status.text;
        statusElement.className = `status-value ${credit.status.type}`;

        // 狀態說明
        document.getElementById("creditDetailDescription").textContent = credit.status.description;
        // 20 日
        renderPercentValue("creditPrice20", credit.priceChange20);
        renderPercentValue("creditMargin20", credit.margin20Percent);

        // 5 日
        renderPercentValue("creditPrice5", credit.priceChange5);
        renderPercentValue("creditMargin5", credit.margin5Percent);

        renderCreditChart(
            detailOverlayData.data,
            detailOverlayData.marginData
        );

        detailOverlay.classList.add("open");
    });

    // =========================
    // 空方籌碼
    // =========================

    shortPositionToggle.addEventListener("click", () => {
        if (!detailOverlayData?.shortPosition) {
            return;
        }

        const shortPosition = detailOverlayData.shortPosition;

        detailTitle.textContent = "空方籌碼";
        detailSubtitle.textContent =
            "近 100 個交易日｜股價與借券賣出餘額";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "none";
        trendChartSection.style.display = "none";
        creditChartSection.style.display = "none";
        shortPositionChartSection.style.display = "block";


        // =========================
        // 空方籌碼摘要
        // =========================

        const statusElement =
            document.getElementById("shortPositionDetailStatus");

        statusElement.textContent =
            shortPosition.status.text;

        statusElement.className =
            `status-value ${shortPosition.status.type}`;

        document.getElementById(
            "shortPositionDetailDescription"
        ).textContent =
            shortPosition.status.description;

        // =========================
        // 20 日
        // =========================
        renderPercentValue("shortMargin20", shortPosition.marginShort20Percent);
        renderPercentValue("shortSbl20", shortPosition.sbl20Percent);

        // =========================
        // 5 日
        // =========================
        renderPercentValue("shortMargin5", shortPosition.marginShort5Percent);
        renderPercentValue("shortSbl5", shortPosition.sbl5Percent);
        
        renderShortPositionChart(
            detailOverlayData.data,
            detailOverlayData.shortSaleBalanceData
        );

        detailOverlay.classList.add("open");
    });

    // =========================
    // 關閉
    // =========================

    closeDetail.addEventListener("click", () => {detailOverlay.classList.remove("open");});
}

function formatPercent(value) {
    if (value === null || value === undefined) {
        return "--";
    }

    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function renderPercentValue(elementId, value) {
    const element = document.getElementById(elementId);

    element.textContent = formatPercent(value);
    element.classList.remove("value-up", "value-down", "value-neutral");

    if (value > 0) {
        element.classList.add("value-up");
    } else if (value < 0) {
        element.classList.add("value-down");
    } else {
        element.classList.add("value-neutral");
    }
}
