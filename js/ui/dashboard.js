export function renderDashboard(stockData) {
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
    renderStatus("trendStatus", stockData.marketStatus.trend);
    renderStatus("shortTermStatus", stockData.marketStatus.shortTerm);
    renderStatus("volumeStatus", stockData.marketStatus.volume);
    renderStatus("rsiStatus", stockData.marketStatus.rsi);
    renderStatus("macdStatus", stockData.marketStatus.macd);
    renderStatus("institutionalStatus", stockData.marketStatus.institutional);
    renderStatus("creditStatus", stockData.marketStatus.credit);
    renderStatus("shortPositionStatus",stockData.marketStatus.shortPosition);
    
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

    const events = stockData.technicalStatus.events;

    if (events.length === 0) {
        const signalItem = document.createElement("p");

        signalItem.textContent = "今日無特殊技術訊號";
        signalItem.classList.add("signal-item");

        signalList.appendChild(signalItem);
    } else {
        events.forEach(event => {
            const signalItem = document.createElement("p");

            signalItem.textContent = event.text;
            signalItem.classList.add("signal-item", event.type);

            signalList.appendChild(signalItem);
        });
    }

    // 均線狀態
    function renderMAStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `ma-light ${status.type}`;
    }

    renderMAStatus(
        "ma5Status",
        stockData.technicalStatus.movingAverages.ma5
    );

    renderMAStatus(
        "ma20Status",
        stockData.technicalStatus.movingAverages.ma20
    );

    renderMAStatus(
        "ma60Status",
        stockData.technicalStatus.movingAverages.ma60
    );

    renderMAStatus(
        "ma120Status",
        stockData.technicalStatus.movingAverages.ma120
    );

    renderMAStatus(
        "ma240Status",
        stockData.technicalStatus.movingAverages.ma240
    );

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