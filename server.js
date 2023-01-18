const express = require('express');
const parseUrl = require('body-parser');
const search = require('./search');

let encodeUrl = parseUrl.urlencoded({ extended: false });

const app = express();
const port = 8081;

app.use(express.static('static'));

app.post('/search-title', encodeUrl, function(req, res) {
    console.log('Searching for: "' + req.body.keywords + '"');
    search.forTitle(req.body.keywords).then(function(data) {
        console.log('Found ' + data.length + ' results for "' + req.body.keywords + '"');
        res.json(data);
    });
});

app.post('/search-isbn', encodeUrl, function(req, res) {
    console.log('Searching for: "' + req.body.isbn + '"');
    search.forISBN(req.body.isbn).then(function(data) {
        console.log('Found ' + data.length + ' results for "' + req.body.keywords + '"');
        res.json(data);
    });
});

app.listen(port, () => {
    console.log('Server running. Access through:    http://localhost:' + port);
})