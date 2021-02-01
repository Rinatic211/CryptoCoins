const FUT_API = 'https://fapi.binance.com';
const FUT_STREAM = 'wss://fstream.binance.com';
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
layout: {
    backgroundColor: '#000000',
    textColor: 'rgba( 255, 255, 255, 0.7)',
},
grid: {
    vertLines: {   
        color: 'rgba(200, 200, 200, 0.2)',
    },
    horzLines: { 
        color: 'rgba(200, 200, 200, 0.2)',
    }
},
crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
},
timeScale: {

 timeVisible: true,
}
 });
const candlestickSeries = chart.addCandlestickSeries( {
    upColor: '#11ff11',
    downColor: '#ff1111',
    borderDownColor: '#ff1111',
    borderUpColor: '#11ff11',
    wickDownColor: '#ff1111',
    wickUpColor: '#11ff11',
});
setHistoryCandles('BTCUSDT', '5m');
streamCandles('BTCUSDT', '5m');
function setHistoryCandles(pair, interval) {
    // fetch ('${FUT_API}/fapi/v1/klines?symbol=${pair}&{interval}')
    fetch (`${FUT_API}/fapi/v1/klines?symbol=${pair}&interval=${interval}&limit=1500`)
     .then(resp => resp.json())
     .then(candlesArr => candlestickSeries.setData(
        candlesArr.map(([time, open ,high, low, close]) => ({time: time / 1000,open, high, low,  close}))
        ))
    }
    function streamCandles(pair, interval) {
        const candlesStream = new WebSocket(`${FUT_STREAM}${pair.toLowerCase()}@kline_${interval}`);
        candlesStream.onmessage = event => {
            console.log(event);
        } 
        candlesStream.onerror = event => {
            console.log(event);
        }
    }