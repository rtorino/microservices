'use strict';

var util = require('util');

var Rabbit = require('wascally');
var Rabbus = require('rabbus');

var env = process.env['NODE_ENV'] || 'dev';
var config = require('./config/config.json')[env];

function SomeSubscriber(rabbit) {
	Rabbus.Subscriber.call(this, rabbit, {
		exchange: 'pub-sub.exchange',
		queue: 'pub-sub.queue',
		routingKey: 'pub-sub.key',
		messageType: 'pub-sub.messageType'
	});
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);


Rabbit.configure({connection: config.rabbit})
	.then(function() {

		var subscriber = new SomeSubscriber(Rabbit);

		subscriber.subscribe(function(message, done) {
			console.log('hello', message.place);
			done();
		});

	})
	.then(null, function(err) {
		setImmediate(function() {
			throw err;
		});
	});
