const FUT_API = 'https://fapi.binance.com'
const FUT_STREAM = 'wss://fstream.binance.com/ws/';

let candlesStream;
let aggTradesStream;

const tradeListElement = document.querySelector('.trades-container__list');
const intervalSelectElement = document.getElementById('interval');
const pairvalSelectElement = document.getElementById('pair');

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
chart.timeScale().subscribeVisibleLogicalRangeChange(newVisibleLogicalRange =>{
    const barsCount = candlestickSeries.barsInLogicalRange(newVisibleLogicalRange);
    console.log(barsCount);
    if (barsCount && barsCount.barsBeFore < 100) {
        console.log('load history');
    }
});

 window.addEventListener('resize',() => {
     chart.resize (
     document.documentElement.clientWidth * 4 / 5,
     document.documentElement.clientHeight * 4 / 5,
 );
 })
const candlestickSeries = chart.addCandlestickSeries( {
    upColor: '#11ff11',
    downColor: '#ff1111',
    borderDownColor: '#ff1111',
    borderUpColor: '#11ff11',
    wickDownColor: '#ff1111',
    wickUpColor: '#11ff11',
});

setHistoryCandles('BTCUSDT', '1m');
streamCandles('BTCUSDT', '1m');
streamAggTrades('BTCUSDT');

pairvalSelectElement.addEventListener('change', () => {
    candlesStream.close();
    aggTradesStream.close();

tradeListElement.innerHTML = "";

    const pair = pairvalSelectElement.value;
    const interval = intervalSelectElement.value;

    setHistoryCandles(pair, interval);
    streamCandles(pair, interval);
    streamAggTrades(pair);
});

intervalSelectElement.addEventListener('change', () => {
    candlesStream.close();

    const pair = pairvalSelectElement.value;
    const interval = intervalSelectElement.value;

    setHistoryCandles(pair, interval);
    streamCandles(pair, interval);
});

function setHistoryCandles(pair, interval) {
    fetch (`${FUT_API}/fapi/v1/klines?symbol=${pair}&interval=${interval}&limit=1500`)
     .then(resp => resp.json())
     .then(candlesArr => candlestickSeries.setData(
        candlesArr.map(([time, open ,high, low, close]) => ({time: time / 1000,open, high, low,  close}))
        ))
    }

    function streamCandles(pair, interval) {
        candlesStream = new WebSocket(`${FUT_STREAM}${pair.toLowerCase()}@kline_${interval}`);
        candlesStream.onmessage = event => {
            const {t: time, o: open, h: high, l: low, c: close } = (JSON.parse(event.data).k);
            candlestickSeries.update({ time: time / 1000, open, high, low, close })
        }
    }

     function streamAggTrades(pair) {
        aggTradesStream = new WebSocket(`${FUT_STREAM}${pair.toLowerCase()}@aggTrade`);
        aggTradesStream.onmessage = event => {
            const {m: isBuyerMaker, p: price, q: quantity} = JSON.parse(event.data);
            const  tradeElement = document.createElement('div');
            tradeElement.classList.add('trade',isBuyerMaker ? 'sell' : 'buy');
            tradeElement.innerHTML += `
            <div>${price}</div>
            <div>${quantity}</div>
            <div>${(price * quantity).toFixed(5)}</div>
            `;
            tradeListElement.prepend(tradeElement);
            if (tradeListElement.children.length > 1000){
                tradeListElement.querySelector('.trade:last-child').remove();
            }
       }
    }