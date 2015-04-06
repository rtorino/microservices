'use strict';

var util = require('util');

var Rabbit = require('wascally');
var Rabbus = require('rabbus');

var env = process.env['NODE_ENV'] || 'dev';
var config = require('./config/config.json')[env];

function SomeResponder(rabbit) {
	Rabbus.Responder.call(this, rabbit, {
		exchange: 'req-res.exchange',
		queue: 'req-res.queue',
		routingKey: 'req-res.key',
		messageType: 'req-res.messageType',
		limit: 1
	});
}

util.inherits(SomeResponder, Rabbus.Responder);

Rabbit.configure({connection: config.rabbit})
	.then(function() {

		var responder = new SomeResponder(Rabbit);

		responder.handle(function(message, respond) {
			respond({
				place: 'world'
			});
		});

	})
	.then(null, function(err) {
		setImmediate(function() {
			throw err;
		});
	});
