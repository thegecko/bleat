var bluetooth = require('./index').webbluetooth;
var eddystoneUUID = 0xFEAA;

function decodeEddystone(view) {
    var frameTypes = {
        0x00: "UID",
        0x10: "URL",
        0x20: "TLM"
    }

    var schemes = {
        0x00: "http://www.",
        0x01: "https://www.",
        0x02: "http://",
        0x03: "https://"
    }

    var expansions = {
        0x00: ".com/",
        0x01: ".org/",
        0x02: ".edu/",
        0x03: ".net/",
        0x04: ".info/",
        0x05: ".biz/",
        0x06: ".gov/",
        0x07: ".com",
        0x08: ".org",
        0x09: ".edu",
        0x0a: ".net",
        0x0b: ".info",
        0x0c: ".biz",
        0x0d: ".gov"
    }

    var type = frameTypes[view.getUint8(0)];
    if (!type) return null;

    if (type === "UID") {
        var uidArray = [];
        for (var i = 2; i < view.byteLength; i++) {
            var hex = view.getUint8(i).toString(16);
            uidArray.push(("00" + hex).slice(-2));
        }
        return {
            type: type,
            txPower: view.getInt8(1),
            namespace: uidArray.slice(0, 10).join(),
            instance: uidArray.slice(10, 16).join()
        };
    }

    if (type === "URL") {
        var url = "";
        for (var i = 2; i < view.byteLength; i++) {
            if (i === 2) {
                url += schemes[view.getUint8(i)];
            } else {
                url += expansions[view.getUint8(i)] || String.fromCharCode(view.getUint8(i));
            }
        }
        return {
            type: type,
            txPower: view.getInt8(1),
            url: url
        };
    }

    if (type === "TLM") {
        return {
            type: type,
            version: view.getUint8(1),
            battery: view.getUint16(2),
            temperature: view.getInt16(4),
            advCount: view.getUint32(6),
            secCount: view.getUint32(10)
        };
    }
}

function handleDeviceFound(bluetoothDevice) {
	var eddyData = bluetoothDevice.adData.serviceData.get(eddystoneUUID);
	if (eddyData) {
		var decoded = decodeEddystone(eddyData);
		if (decoded && decoded.type === "URL") {
			console.log(decoded.url);
		}
	}
}

// Recursively scan
function scan() {
	console.log("scanning...");
	bluetooth.requestDevice({
		filters:[{ services:[ eddystoneUUID ] }],
		deviceFound: handleDeviceFound
	})
	.then(scan)
	.catch(error => {
		console.log(error);
		process.exit();
	});
}
scan();