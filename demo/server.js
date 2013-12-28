var express    = require('express');
var app        = express();
var db         = require('./mongooseModels');
var facultyApi = require('faculty-api');
var path       = require('path');

facultyApi.addResource({
  app: app,
  urlPrefix: 'api',
  resourceName: 'pages',
  collection: db.models.Page
});

//Set up static folder
app.use(express.static(__dirname + '/public'));
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/test', express.static(path.join(__dirname, '../test')));

app.listen(3000, function() {
  console.log("Express server listening on port " + app.get('port'));
});