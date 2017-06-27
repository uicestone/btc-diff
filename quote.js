const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quoteSchema = new Schema({
	code: String,
	time: Date,
	currency: String,
	price: Number
});

quoteSchema.index({code: 1, time: 1});

module.exports = mongoose.model('Quote', quoteSchema);
