var bluetooth = require('../index').webbluetooth;
var gattServer;
var heartChar;

function log(message) {
	console.log(message);
}

log('Requesting Bluetooth Devices...');
bluetooth.requestDevice({
	filters:[{ services:[ "heart_rate" ] }]
})
.then(device => {
	log('Found device: ' + device.name);
	return device.gatt.connect();
})
.then(server => {
	gattServer = server;
	log('Gatt server connected: ' + gattServer.connected);
	return gattServer.getPrimaryService("heart_rate");
})
.then(service => {
	log('Primary service: ' + service.uuid);
	return service.getCharacteristic("heart_rate_measurement");
})
.then(characteristic => {
	log('Characteristic: ' + characteristic.uuid);
	heartChar = characteristic;
	return heartChar.getDescriptors();
})
.then(descriptors => {
	descriptors.forEach(descriptor => {
		log('Descriptor: ' + descriptor.uuid);
	});

	return Array.apply(null, Array(10)).reduce(sequence => {
		return sequence.then(() => {
			return heartChar.readValue();
		}).then(value => {
			log('Value: ' + value.getUint16(0));
		});
	}, Promise.resolve());
})
.then(() => {
	gattServer.disconnect();
	log('Gatt server connected: ' + gattServer.connected);
	process.exit();
})
.catch(error => {
	log(error);
	process.exit();
});