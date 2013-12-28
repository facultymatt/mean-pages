var express = require('express');
var app = express();
var db = require('./mongooseModels');
var facultyApi = require('faculty-api');
var path = require('path');
var port = parseInt(process.env.PORT, 10) || 4567;

facultyApi.addResource({
    app: app,
    urlPrefix: 'api',
    resourceName: 'pages',
    collection: db.models.Page
});



app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
}));
app.use(app.router);

//Set up static folder
app.use(express.static(__dirname + '/public'));
app.use('/src', express.static(path.join(__dirname, '../src')));


app.listen(port, function() {
    console.log("Express server listening on port " + port);
});
