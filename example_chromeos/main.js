var statusEl = document.getElementById("status");

function logStatus(message) {
	console.log(message);
	statusEl.innerText += message + "\n";
}

bleat.init(function() {
	logStatus("bluetooth ready");
	bleat.startScan(function(device) {

		bleat.stopScan();
	  	logStatus("found device: " + device.name);

		device.connect(function() {
			logStatus("connected to: " + device.name);

			Object.keys(device.services).forEach(function(serviceID) {
				var service = device.services[serviceID];
				logStatus("found service: " + service.uuid + " (with " + Object.keys(service.characteristics).length + " characteristics)");
			});

			device.disconnect();
			logStatus("disconnected from: " + device.name);
		});
	});
}, logStatus);