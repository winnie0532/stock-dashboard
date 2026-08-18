import { renderVolumeChart } from "./charts.js";
import { analyzeTechnical } from "./analysis.js";
import {
    organizeInstitutionalData,
    analyzeInstitutional
} from "./institutional.js";
import {
    fetchStockHistory,
    fetchInstitutionalHistory,
    fetchStockInfo
} from "./api.js";
import {
    calculateMA,
    calculateAverageVolume,
    calculateRSI,
    calculateKD,
    calculateMACD,
    calculatePriceChange
} from "./indicators.js";


async function init(stockId = "2330") {
    try {
        const stockInfo = await fetchStockInfo(stockId);

        // =========================
        // 取得股票資料
        // =========================

        const data = await fetchStockHistory(stockId, "2025-05-01");

        // 取得法人資料
        
    
        const institutional = await fetchInstitutionalHistory(stockId, "2025-05-01");

        const institutionalDaily = organizeInstitutionalData(institutional);
        console.log("法人每日資料:", institutionalDaily);

        const institutionalAnalysis = analyzeInstitutional(institutionalDaily);
        console.log("籌碼分析:", institutionalAnalysis);

        const latest = data[data.length - 1];

        // =========================
        // 近期漲跌幅
        // =========================

        const priceChange5 = calculatePriceChange(data, 5);
        const priceChange20 = calculatePriceChange(data, 20);
        const priceChange60 = calculatePriceChange(data, 60);

        // =========================
        // MA 均線
        // =========================

        const ma5 = calculateMA(data, 5);
        const ma20 = calculateMA(data, 20);
        const ma60 = calculateMA(data, 60);
        const ma120 = calculateMA(data, 120);
        const ma240 = calculateMA(data, 240);


        // =========================
        // 成交量
        // =========================

        const avgVolume20 = calculateAverageVolume(data, 20);
        const volumeRatio = latest.volume / avgVolume20;


        // =========================
        // RSI
        // =========================

        const rsi14 = calculateRSI(data, 14);


        // =========================
        // KD
        // =========================

        const kdHistory = calculateKD(data);

        const todayKD = kdHistory[kdHistory.length - 1];
        const yesterdayKD = kdHistory[kdHistory.length - 2];


        // =========================
        // MACD
        // =========================

        const macdHistory = calculateMACD(data);

        const todayMACD = macdHistory[macdHistory.length - 1];
        const yesterdayMACD = macdHistory[macdHistory.length - 2];


        // =========================
        // 綜合技術分析
        // =========================

        const analysis = analyzeTechnical({
            latestPrice: latest.close,
            ma5,
            ma20,
            ma60,
            ma120,
            ma240,
            volumeRatio,
            rsi: rsi14,
            todayKD,
            yesterdayKD,
            todayMACD,
            yesterdayMACD
        });

        // 整理 Dashboard 需要的所有資料
        const stockData = {
            stockId: stockInfo.stockId,
            stockName: stockInfo.stockName,
            date: latest.date,
            price: latest.close,

            performance: {
                change5: priceChange5,
                change20: priceChange20,
                change60: priceChange60
            },

            technical: {
                ma5,
                ma20,
                ma60,
                ma120,
                ma240,
                volume: latest.volume,
                avgVolume20,
                volumeRatio,
                rsi14,

                kd: {
                    k: todayKD.k,
                    d: todayKD.d
                },

                macd: {
                    dif: todayMACD.dif,
                    signal: todayMACD.signal,
                    histogram: todayMACD.histogram
                }
            },

            institutional: institutionalAnalysis,
            analysis
        };

        // 顯示到網頁
        renderDashboard(stockData);

        // 成交量圖
        renderVolumeChart(data);

        // =========================
        // Debug
        // =========================

        console.log("5日漲跌幅:", priceChange5);
        console.log("20日漲跌幅:", priceChange20);
        console.log("60日漲跌幅:", priceChange60);

        console.log("最新股價:", latest.close);
        console.log("技術分析:", analysis);

        console.log("完整股票資料:", stockData);

    } catch (error) {
        console.error("取得股票資料失敗：", error);
    }
}
function renderDashboard(stockData) {
    // 股票基本資訊
    document.getElementById("stockId").textContent = stockData.stockId;
    document.getElementById("stockName").textContent = stockData.stockName;
    document.getElementById("latestDate").textContent = stockData.date;
    document.getElementById("latestPrice").textContent = stockData.price.toFixed(2);

    // 市場狀態
    function renderStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `status-value ${status.type}`;
    }
    renderStatus("trendStatus", stockData.analysis.trend);
    renderStatus("shortTermStatus", stockData.analysis.shortTerm);
    renderStatus("volumeStatus", stockData.analysis.volume);
    renderStatus("rsiStatus", stockData.analysis.rsi);
    renderStatus("macdStatus", stockData.analysis.macd);
    renderStatus("institutionalStatus",stockData.institutional.summary);
    // 近期表現
    function renderChange(elementId, value) {
        const element = document.getElementById(elementId);

        element.textContent = `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

        if (value > 0) {
            element.className = "status-value positive";
        } else if (value < 0) {
            element.className = "status-value danger";
        } else {
            element.className = "status-value neutral";
        }
    }

    renderChange("change5", stockData.performance.change5);
    renderChange("change20", stockData.performance.change20);
    renderChange("change60", stockData.performance.change60);

    // 今日訊號
    const signalList = document.getElementById("signalList");
    signalList.innerHTML = "";

    stockData.analysis.signals.forEach(signal => {
        const signalItem = document.createElement("p");

        signalItem.textContent = signal.text;
        signalItem.classList.add("signal-item", signal.type);

        signalList.appendChild(signalItem);
    });

    // MA
    document.getElementById("ma5").textContent = stockData.technical.ma5.toFixed(2);
    document.getElementById("ma20").textContent = stockData.technical.ma20.toFixed(2);
    document.getElementById("ma60").textContent = stockData.technical.ma60.toFixed(2);
    document.getElementById("ma120").textContent = stockData.technical.ma120.toFixed(2);
    document.getElementById("ma240").textContent = stockData.technical.ma240.toFixed(2);

    // 成交量
    document.getElementById("volume").textContent = stockData.technical.volume.toLocaleString();
    document.getElementById("avgVolume20").textContent = Math.round(stockData.technical.avgVolume20).toLocaleString();
    document.getElementById("volumeRatio").textContent = `${stockData.technical.volumeRatio.toFixed(2)}x`;

    // RSI
    document.getElementById("rsi14").textContent = stockData.technical.rsi14.toFixed(2);

    // KD
    document.getElementById("kdK").textContent = stockData.technical.kd.k.toFixed(2);
    document.getElementById("kdD").textContent = stockData.technical.kd.d.toFixed(2);

    // MACD
    document.getElementById("macdDif").textContent = stockData.technical.macd.dif.toFixed(2);
    document.getElementById("macdSignal").textContent = stockData.technical.macd.signal.toFixed(2);
    document.getElementById("macdHistogram").textContent = stockData.technical.macd.histogram.toFixed(2);

    // =========================
    // 籌碼面
    // =========================

    function renderInstitutionalValue(elementId, value) {
        const element = document.getElementById(elementId);

        const lots = value / 1000;

        element.textContent =
            `${lots >= 0 ? "+" : ""}${Math.round(lots).toLocaleString()} 張`;

        if (lots > 0) {
            element.className = "status-value positive";
        } else if (lots < 0) {
            element.className = "status-value danger";
        } else {
            element.className = "status-value neutral";
        }
    }


    function renderInstitutionalStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `status-value ${status.type}`;
    }


    // 今日法人
    renderInstitutionalValue(
        "foreignToday",
        stockData.institutional.today.foreign
    );

    renderInstitutionalValue(
        "trustToday",
        stockData.institutional.today.trust
    );

    renderInstitutionalValue(
        "dealerToday",
        stockData.institutional.today.dealer
    );


    // 法人狀態
    renderInstitutionalStatus(
        "foreignStatus",
        stockData.institutional.status.foreign
    );

    renderInstitutionalStatus(
        "trustStatus",
        stockData.institutional.status.trust
    );

    renderInstitutionalStatus(
        "dealerStatus",
        stockData.institutional.status.dealer
    );


    // =========================
    // 近期法人動向
    // =========================

    // 外資
    renderInstitutionalValue(
        "foreign5",
        stockData.institutional.recent.foreign.day5
    );

    renderInstitutionalValue(
        "foreign20",
        stockData.institutional.recent.foreign.day20
    );

    renderInstitutionalValue(
        "foreign60",
        stockData.institutional.recent.foreign.day60
    );


    // 投信
    renderInstitutionalValue(
        "trust5",
        stockData.institutional.recent.trust.day5
    );

    renderInstitutionalValue(
        "trust20",
        stockData.institutional.recent.trust.day20
    );

    renderInstitutionalValue(
        "trust60",
        stockData.institutional.recent.trust.day60
    );


    // 自營商
    renderInstitutionalValue(
        "dealer5",
        stockData.institutional.recent.dealer.day5
    );

    renderInstitutionalValue(
        "dealer20",
        stockData.institutional.recent.dealer.day20
    );

    renderInstitutionalValue(
        "dealer60",
        stockData.institutional.recent.dealer.day60
    );
}

const stockInput = document.getElementById("stockInput");
const stockSearchButton = document.getElementById("stockSearchButton");

stockSearchButton.addEventListener("click", () => {
    const stockId = stockInput.value.trim();

    if (!stockId) {
        return;
    }

    init(stockId);
});

stockInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        stockSearchButton.click();
    }
});

const volumeToggle = document.getElementById("volumeToggle");
const volumeDetail = document.getElementById("volumeDetail");
const closeVolumeDetail = document.getElementById("closeVolumeDetail");

volumeToggle.addEventListener("click", () => {
    volumeDetail.classList.add("open");
});

closeVolumeDetail.addEventListener("click", () => {
    volumeDetail.classList.remove("open");
});

init();
