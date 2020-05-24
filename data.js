const axios = require('axios');
const $ = require('cheerio');
const airtmUrl = 'https://rates.airtm.com';
const dolarToday = 'https://s3.amazonaws.com/dolartoday/data.json';

// OCR
const ocrSpaceApi = require('ocr-space-api');

const options = {
    apikey: process.env.OCR_APIKEY,
    language: 'spa',
    imageFormat: 'image/jpg',
    isOverlayRequired: true,
};

const getAirtmRates = _ =>
    new Promise(resolve => {
        axios.get(airtmUrl).then(res => {
            let buy = $('.rate--buy', res.data).html();
            let general = $('.rate--general', res.data).html();
            let sell = $('.rate--sell', res.data).html();

            const data = {
                src: 'https://rates.airtm.com',
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
                let newKey = key.replace('_', ' ');
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newUsd[newKey] = usd[key];
            }

            for (let key in eur) {
                let newKey = key.replace('_', ' ');
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newEur[newKey] = eur[key];
            }

            resolve({ src: dolarToday, USD: newUsd, EUR: newEur });
        });
    });

const Instagram = require('instagram-web-api');
const username = '';
const password = '';

const client = new Instagram({ username, password });
let monitorData = { src: '', value: 0 };

const fetchMonitor = _ =>
    new Promise(resolve => {
        client
            .getPhotosByUsername({ username: 'enparalelovzla' })
            .then(async res => {
                const data = res.user.edge_owner_to_timeline_media.edges;
                // console.log(data);
                // thumbnail_src
                let result = null;
                for (let e of data) {
                    // console.log();
                    let url = e.node.thumbnail_src;
                    try {
                        const data = await ocrSpaceApi.parseImageFromUrl(
                            url,
                            options
                        );
                        let match = data.parsedText.match(/PROMEDIO Bs./gm);

                        if (match) {
                            console.log(e.node);
                            let match2 = data.parsedText.match(
                                /[0-9]+.[0-9]+[,|.]+[0-9]+/g
                            );

                            let value = String(match2[0]);
                            value = value.replace('.', '');
                            value = value.replace(',', '.');

                            result = {
                                src: url,
                                value: Number(value),
                            };
                            break;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                monitorData = result;
                console.log(
                    'monitorData updated...',
                    new Date().toLocaleString('es-VE', {
                        timeZone: 'America/Caracas',
                    })
                );
                resolve(result);
            });
    });

fetchMonitor();

const cron = require('node-cron');

cron.schedule(
    '30 9 * * *',
    () => {
        console.log('Runing a job at 09:30 at America/Caracas timezone');
        fetchMonitor();
    },
    {
        timezone: 'America/Caracas',
    }
);

cron.schedule(
    '30 13 * * *',
    () => {
        console.log('Runing a job at 13:30 at America/Caracas timezone');
        fetchMonitor();
    },
    {
        timezone: 'America/Caracas',
    }
);

const getMonitor = _ => monitorData;

module.exports = {
    getAirtmRates,
    getDolarToday,
    getMonitor,
};
