'use strict';

var util = require('util');

var Hapi = require('hapi');
var Rabbit = require('wascally');
var Rabbus = require('rabbus');

var env = process.env['NODE_ENV'] || 'dev';
var config = require('./config/config.json')[env];

// Create a server with a host and port
var server = new Hapi.Server();
server.connection(config.api);

// Rabbus Sender
function SomeSender(rabbit) {
	Rabbus.Sender.call(this, rabbit, {
		exchange: 'send-rec.exchange',
		routingKey: 'send-rec.key',
		messageType: 'send-rec.messageType'
	});
}

util.inherits(SomeSender, Rabbus.Sender);

// Rabbus Publisher
function SomePublisher(rabbit) {
	Rabbus.Publisher.call(this, rabbit, {
		exchange: 'pub-sub.exchange',
		routingKey: 'pub-sub.key',
		messageType: 'pub-sub.messageType'
	});
}

util.inherits(SomePublisher, Rabbus.Publisher);

// Rabbus Requester
function SomeRequester(rabbit) {
	Rabbus.Requester.call(this, rabbit, {
		exchange: 'req-res.exchange',
		routingKey: 'req-res.key',
		messageType: 'req-res.messageType'
	});
}

util.inherits(SomeRequester, Rabbus.Requester);


Rabbit.configure({connection: config.rabbit})
	.then(function() {
		
		// Sender
		server.route({
			path: '/send',
			method: 'GET',
			handler: function(request, reply) {
				var sender = new SomeSender(Rabbit);

				var message = {
					place: 'world'
				};

				sender.send(message, function() {
					reply('sent a message');
				});
			}
		});

		// Publisher
		server.route({
			path: '/publish',
			method: 'GET',
			handler: function(request, reply) {
				var publisher = new SomePublisher(Rabbit);

				var message = {
					place: 'world'
				}

				publisher.publish(message, function() {
					reply('published an event');
				});
			}
		});

		// Requester
		server.route({
			path: '/request',
			method: 'GET',
			handler: function(request, reply) {
				var requester = new SomeRequester(Rabbit);

				var message = {};

				requester.request(message, function(response, done) {
					reply('Hello ' + response.place);
					done();
				});
			}
		});

		// Start the server
		server.start(function() {
			console.log('Server running at: ', server.info.uri);
		});
		
	})
	.then(null, function(err) {
		setImmediate(function() {
			throw err;
		});
	});