'use strict';

var util = require('util');

var Rabbit = require('wascally');
var Rabbus = require('rabbus');

var env = process.env['NODE_ENV'] || 'dev';
var config = require('./config/config.json')[env];

function SomeReceiver(rabbit) {
	Rabbus.Receiver.call(this, rabbit, {
		exchange: 'send-rec.exchange',
		queue: 'send-rec.queue',
		routingKey: 'send-rec.key',
		messageType: 'send-rec.messageType'
	});
}

util.inherits(SomeReceiver, Rabbus.Receiver);

Rabbit.configure({connection: config.rabbit})
	.then(function() {

		var receiver = new SomeReceiver(Rabbit);

		receiver.receive(function(message, done) {
			console.log('hello', message.place);
			done();
		});

	})
	.then(null, function(err) {
		setImmediate(function() {
			throw err;
		});
	});
