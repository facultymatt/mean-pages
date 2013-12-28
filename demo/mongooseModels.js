/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// simple database config settings
var config = {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASS,
    host: process.env.MONGODB_HOST || 'localhost',
    port: process.env.MONGODB_PORT || '27017',
    db: process.env.MONGODB_DB || 'awesome-mean-pages'
}

var user = '';

if (process.env.MONGOLAB_URI) {
  mongoose.connect(process.env.MONGOLAB_URI);
} else {
  if (config.user && config.pass) {
    user = config.user + ':' + config.pass + '@';
  }
  mongoose.connect('mongodb://' + user + config.host + ':' + config.port + '/' + config.db);
}

/**
* Convert a string to a slug, all lowercase with spaces replaced with dashes. 
*
*/
function convertToSlug(text, maxLength) {

    maxLength = maxLength || 50;
    
    if(!text) return false;
    
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w\-]+/g, '')
        .substring(0, maxLength);
}

/**
 * Article Schema
 */
var PageSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        default: '',
        trim: true
    },
    areas: [{
		slug: String,
		content: String
    }]
});

/**
 * Statics
 */
PageSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).exec(cb);
    }
};

mongoose.model('Page', PageSchema);

module.exports = mongoose;