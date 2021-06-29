var express = require('express');
var hbs = require('express-handlebars');
require('dotenv').config()

const { GoogleApis } = require('googleapis');
var { google } = require('googleapis')
var keys = require('./keys.json')

var parseData = {};
var parseData_1 = {};

var client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );
    
    client.authorize( (err, tokens) => {
        if(err) {
            console.log(err);
            return;
        } else {
            console.log('Connected to Google Sheets!');
            gsrun(client);
            
        }
    })
    
    async function gsrun(x){
        var api = google.sheets({
        version: 'v4',
        auth: x
    })
    
    var opt = {
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Data!A:D'
    }

    var opt_1 = {
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Events!A:F'
    }
    
    var sheetData = await api.spreadsheets.values.get(opt);
    var data = sheetData.data.values;
    // console.log(data);
    var sheetData_1 = await api.spreadsheets.values.get(opt_1);
    var data_1 = sheetData_1.data.values;
    // console.log(data_1);

    const keys = data[0];
    const values = data.slice(1);
    const objects = values.map(array => {
        const object = {};
        keys.forEach((key, i) => object[key] = array[i]);
        return object;
    });
    
    const keys_1 = data_1[0];
    const values_1 = data_1.slice(1);
    const objects_1 = values_1.map(array_1 => {
        const object_1 = {};
        keys_1.forEach((key_1, i) => object_1[key_1] = array_1[i]);
        return object_1;
    });
    
    parseData = JSON.parse(JSON.stringify(objects));
    // console.log(parseData);
    // console.log(parseData[0].EventId);
    
    parseData_1 = JSON.parse(JSON.stringify(objects_1));
    // console.log(parseData_1);
    // console.log(parseData_1[0].EventId);
    
}







var app = express();
app.set('views', (__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'index',
    layoutsDir: __dirname + '/views/layout/'
}));

app.use(express.static(__dirname, +'public'));

app.get('/id/:id', (req, res) => {
    // console.log(req.params.id);
    // console.log(parseData)
    // console.log(parseData[0].CertificateId);

    var CertificateData = []
    var EventData = []
    for (var j = 0; j < parseData.length; j++) {
            if (req.params.id == parseData[j].CertificateId) {
                CertificateData = parseData[j]
                CertificateData.CertificateLink = 'https://docs.google.com/uc?id=' + CertificateData.CertificateLink.split('=')[1]
                // console.log(CertificateData);

                for (var i = 0; i < parseData_1.length; i++) {
                    if (parseData[j].EventId == parseData_1[i].EventId) {
                        EventData = parseData_1[i]
                        // CertificateData.merge(EventData)
                        Object.assign(CertificateData, EventData)
                        console.log(CertificateData);
                    }
                }
            }
        }

    res.render('home', CertificateData);
});

app.listen(3000);