require('dotenv').config();
const express = require('express');
const packetModel = require("./models/packets");
const crypto = require('crypto');
const https = require('https');

const apiKey = "985f5a2f-be0c-48f0-b25e-d01233c20ed0";
const privateKey = "fdA/UG71dT+wpLW5myyHWMCq8hwCg0XzXz+AA8Ms46wja1zqkqtTw+yvjwiFLlMLZXkTlSu0gTu5vAsdt50H1A==";
const baseUrl = "api.btcmarkets.net";

// SERVER CONFIG
const PORT = process.env.PORT || 5000;
const app = express();
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

let priceData;
let lastPrice = 0;
let lastPurchasePrice = 0;
let activePackets = 0;
let marketId = 'ETH-AUD';

var options = {
    host: 'api.btcmarkets.net',
    path: '/v3/markets/ETH-AUD/ticker'
};

callback = function(response) {
    let marketData;

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
        marketData = JSON.parse(chunk);
    });

    //the whole response has been received, so we just print it out here
    response.on('end', function () {
        lastPrice = marketData.lastPrice;
        console.log('FreshMarketData: $'+lastPrice);
    });
}

function makeHttpCall(method, path, queryString, dataObj) {
    var data = null;
    if (dataObj) {
        data = JSON.stringify(dataObj);
    }
    const headers = buildAuthHeaders(method, path, data);
    let fullPath = path;
    if (queryString != null) {
        fullPath += '?' + queryString
    }
    const httpOptions = {host: baseUrl, path: fullPath, method: method, headers: headers};
    var req = https.request(httpOptions, function(res) {
        var output = '';
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            //console.log(output);
            priceData = JSON.parse(output);
            lastPrice = priceData.lastPrice;
        });
        console.log("response code: " + res.statusCode);
    });
    if (data) {
        req.write(data);
    }
    req.end();
}

function buildAuthHeaders(method, path, data) {
    const now = Date.now();
    let message =  method + path + now;
    if (data) {
        message += data;
    }
    const signature = signMessage(privateKey, message);
    const headers = {
        "Accept": "application/json",
        "Accept-Charset": "UTF-8",
        "Content-Type": "application/json",
        "BM-AUTH-APIKEY": apiKey,
        "BM-AUTH-TIMESTAMP": now,
        "BM-AUTH-SIGNATURE": signature
    };
    return headers;
}

function signMessage(secret, message) {
    var buffer = Buffer.from(secret, 'base64');
    var hmac = crypto.createHmac('sha512', buffer);
    var signature = hmac.update(message).digest('base64');
    return signature;
}

async function checkMarketTicker(args) {
  const { marketId } = args;

//hit the market ticker and log the result 
	let path = "/v3/markets/"+marketId+"/ticker";  
	makeHttpCall('GET', path, null, null);
/*
  console.table([{
    'Input Token': inputTokenSymbol,
    'Output Token': outputTokenSymbol,
    'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
    'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
    'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
    'Kyber Min Return': web3.utils.fromWei(kyberResult.slippageRate, 'Ether'),
    'Timestamp': moment().tz('America/Chicago').format(),
  }])
  */
}

let priceMonitor;
let monitoringPrice = false;

async function monitorPrice() {
  if(monitoringPrice) {
    return
  }

  console.log("Checking prices...");
  monitoringPrice = true;

  https.request(options, callback).end();


  try {

    await checkMarketTicker({
      marketId: marketId
    }).then(console.log("Last Price: $"+lastPrice));

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

    //Rule 1:  If no active packets, buy a packet
    if (!activePackets && (lastPrice > 0)) {
        await packetModel.create(marketId, 'ACTIVE')
            .then((response) => console.log(response));
//        console.log("Packet should be created here ... "+packet_id);
        activePackets++;
    }
    //Rule 1:  If no active packets, buy a packet and set a lastPurchasePrice
    //Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
    //Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
    //Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed

  monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000 // 5 Seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
