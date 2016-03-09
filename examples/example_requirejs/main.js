requirejs.config({
	baseUrl: '../dist',
	paths: {
		bleat: 'api.classic',
		adapter: 'adapter.evothings'
	},
	shim: {
		bleat: {
			deps: ['adapter']
		},
		cordova: {
			exports: 'cordova'
		}
	}
});

require(['bleat'], function(bleat) {
	var statusEl = document.getElementById("status");

	function logStatus(message) {
		console.log(message);
		statusEl.innerText += message + "\n";
	}

	bleat.startScan(function(device) {

		bleat.stopScan(logStatus);
		logStatus("found device: " + device.name);

		device.connect(function() {
			logStatus("connected to: " + device.name);

			Object.keys(device.services).forEach(function(serviceID) {
				var service = device.services[serviceID];
				logStatus("\nservice: " + service.uuid);

				Object.keys(service.characteristics).forEach(function(characteristicID) {
					var characteristic = service.characteristics[characteristicID];
					logStatus("\t└characteristic: " + characteristic.uuid);

					Object.keys(characteristic.descriptors).forEach(function(descriptorID) {
						var descriptor = characteristic.descriptors[descriptorID];
						logStatus("\t\t└descriptor: " + descriptor.uuid);
					});
				});
			});

			device.disconnect(logStatus);
		}, function() {
			logStatus("disconnected from: " + device.name);
		}, logStatus);
	}, logStatus);
});