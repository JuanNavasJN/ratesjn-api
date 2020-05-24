require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getAirtmRates, getDolarToday, getMonitor } = require('./data');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/airtm', async (req, res) => {
    const data = await getAirtmRates();
    return res.json(data);
});

app.get('/airtm/sell', async (req, res) => {
    const data = await getAirtmRates();
    return res.json({
        src: data.src,
        value: data.sell,
    });
});

app.get('/airtm/general', async (req, res) => {
    const data = await getAirtmRates();
    return res.json({
        src: data.src,
        value: data.general,
    });
});

app.get('/airtm/buy', async (req, res) => {
    const data = await getAirtmRates();
    return res.json({
        src: data.src,
        value: data.buy,
    });
});

app.get('/monitor', async (req, res) => {
    const data = await getMonitor();
    return res.json(data);
});

app.get('/dolartoday', async (req, res) => {
    const data = await getDolarToday();
    return res.json(data);
});

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT, '0.0.0.0', function () {
    console.log('Web Server listening on port ' + process.env.PORT);
});
