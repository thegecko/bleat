var bluetooth = require('../index').webbluetooth;
var bluetoothDevices = [];

function logError(error) {
    console.log(error);
    process.exit();
}

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    var input = process.stdin.read();
    if (input === '\u0003') {
        process.exit();
    } else {
        var index = parseInt(input);
        if (index && index <= bluetoothDevices.length) {
            process.stdin.setRawMode(false);
            selectDevice(index - 1);
        }
    }
});

function enumerateGatt(server) {
    return server.getPrimaryServices()
    .then(services => {

        return services.reduce((promise, service) => {
            return promise
            .then(() => service.getCharacteristics())
            .then(characteristics => {
                console.log("\nservice: " + service.uuid);

                return characteristics.reduce((promise, characteristic) => {
                    return promise
                    .then(() => characteristic.getDescriptors())
                    .then(descriptors => {
                        console.log("\t└characteristic: " + characteristic.uuid);

                        descriptors.forEach(descriptor => {
                            console.log("\t\t└descriptor: " + descriptor.uuid);
                        });
                    });
                }, Promise.resolve());

            });
        }, Promise.resolve());

    });
}

function handleDeviceFound(bluetoothDevice, selectFn) {
    var discovered = bluetoothDevices.some(device => {
        return (device.id === bluetoothDevice.id);
    });
    if (discovered) return;

    if (bluetoothDevices.length === 0) {
        process.stdin.setRawMode(true);
        console.log("select a device:");
    }

    bluetoothDevices.push({ id: bluetoothDevice.id, select: selectFn });
    console.log(bluetoothDevices.length + ": " + bluetoothDevice.name);
}

function selectDevice(index) {
    var device = bluetoothDevices[index];
    device.select();
}

var server = null;
console.log("scanning...");

bluetooth.requestDevice({
	deviceFound: handleDeviceFound
})
.then(device => {
    console.log("connecting...");
    return device.gatt.connect();
})
.then(gattServer => {
    console.log("connected");
    server = gattServer;
    return enumerateGatt(server);
})
.then(() => server.disconnect())
.then(() => {
    console.log("\ndisconnected");
    process.exit();
})
.catch(logError);
