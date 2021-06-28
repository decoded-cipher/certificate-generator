var express = require('express');
var hbs = require('express-handlebars');
require('dotenv').config()

const { GoogleApis } = require('googleapis');
var { google } = require('googleapis')
var keys = require('./keys.json')

var parseData = {}
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
        // spreadsheetId: '1_hcPk66kmbzlE0hXLmkcn2u-XBCvjibqFsS29ncD1HE',
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet1!A:C'
    }
    
    var sheetData = await api.spreadsheets.values.get(opt);
    var data = sheetData.data.values;
    // console.log(data);
    
    const keys = data[0];
    const values = data.slice(1);
    const objects = values.map(array => {
        const object = {};
        
        keys.forEach((key, i) => object[key] = array[i]);
        return object;
    });
    
    parseData = JSON.parse(JSON.stringify(objects));
    // console.log(parseData);
    // console.log(parseData[0].CertificateId);
    
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
    for (var j = 0; j < parseData.length; j++){
            if (req.params.id == parseData[j].CertificateId) {
                CertificateData = parseData[j]
                CertificateData.CertificateLink = 'https://docs.google.com/uc?id=' + CertificateData.CertificateLink.split('=')[1]
                console.log(CertificateData);
            }
        }

    res.render('home', CertificateData);
});

app.listen(3000);