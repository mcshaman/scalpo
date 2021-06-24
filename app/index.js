require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const moment = require('moment-timezone');
const numeral = require('numeral');
const _ = require('lodash');
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const apiKey = "985f5a2f-be0c-48f0-b25e-d01233c20ed0";
const privateKey = "fdA/UG71dT+wpLW5myyHWMCq8hwCg0XzXz+AA8Ms46wja1zqkqtTw+yvjwiFLlMLZXkTlSu0gTu5vAsdt50H1A==";
const baseUrl = "api.btcmarkets.net";

// SERVER CONFIG
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`));

let priceData;

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
            priceData = output;
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

  try {

    await checkMarketTicker({
      marketId: 'ETH-AUD'
    }).then(console.log("Hey"+priceData));

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

  monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000 // 5 Seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
