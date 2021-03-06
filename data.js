const axios = require("axios");
const $ = require("cheerio");
const airtmUrl = "https://rates.airtm.com";
const dolarToday = "https://s3.amazonaws.com/dolartoday/data.json";

const getAirtmRates = _ =>
    new Promise(resolve => {
        axios.get(airtmUrl).then(res => {
            let buy = $(".rate--buy", res.data).html();
            let general = $(".rate--general", res.data).html();
            let sell = $(".rate--sell", res.data).html();

            const data = {
                src: "https://rates.airtm.com",
                buy: Number(buy),
                general: Number(general),
                sell: Number(sell),
            };

            resolve(data);
        });
    });

const getDolarToday = _ =>
    new Promise(resolve => {
        axios.get(dolarToday).then(res => {
            let usd = res.data.USD;
            let eur = res.data.EUR;
            let newUsd = {},
                newEur = {};
            for (let key in usd) {
                let newKey = key.replace("_", " ");
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newUsd[newKey] = usd[key];
            }

            for (let key in eur) {
                let newKey = key.replace("_", " ");
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newEur[newKey] = eur[key];
            }

            resolve({ src: dolarToday, USD: newUsd, EUR: newEur });
        });
    });

// let monitorData = { src: "", value: 0 };

//--------------- BCV --------------------

const bcvPage = "http://www.bcv.org.ve";
const getBCVRate = _ =>
    new Promise(resolve => {
        axios.get(dolarToday).then(res => {
            let usd = res.data.USD;
            const data = {
                src: bcvPage,
                value: usd.sicad2,
            };
            resolve(data);
        });
    });

//--------------------
module.exports = {
    getAirtmRates,
    getDolarToday,
    getBCVRate,
};
