from flask import Flask, jsonify
import requests

app = Flask(__name__)


@app.get("/api/stock/<stock_id>")
def get_stock(stock_id):
    url = "https://api.finmindtrade.com/api/v4/data"

    params = {
        "dataset": "TaiwanStockPrice",
        "data_id": stock_id,
        "start_date": "2026-07-01"
    }

    response = requests.get(
        url,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True, port=5000)