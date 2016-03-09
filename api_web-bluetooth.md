## Web Bluetooth API

This API follows the [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) specification, but adds additional functions for use in headless situations.

### Extensions

#### bluetooth.cancelRequest()

The ```bluetooth``` interface is extended with a ```cancelRequest()``` function which allows any ```requestDevice()``` scan to be cancelled. In this case, the ```requestDevice()``` promise is not resolved nor rejected.

```idl
interface Bluetooth {
 	Promise<BluetoothDevice> requestDevice(RequestDeviceOptions options);
 	Promise cancelRequest();
};
```

#### requestDeviceOptions.deviceFound()

The ```requestDeviceOptions``` dictionary used with the ```bluetooth.requestDevice()``` function has an optional function which can be passed in called ```deviceFound```.

```idl
dictionary RequestDeviceOptions {
	required sequence<BluetoothScanFilter> filters;
	sequence<BluetoothServiceUUID> optionalServices = [];
	void deviceFound(BluetoothDevice device) = null;
};
```

This offers a callback function for headless implementations which is executed every time a device is discovered.

When the ```deviceFound()``` function is specified, no filters are required and a scan timeout in the ```requestDevice()``` function causes the promise to resolve with no BluetoothDevice instead of being rejected.

Returning true from the ```deviceFound()``` function selects the current BluetoothDevice as the selected one and resolves the ```requestDevice()``` promise with this device.

### Example Usage

#### Continuous scanning

See [example_node_eddystone.js](example_node_eddystone.js) for a full example.

```js
var eddystoneUUID = 0xFEAA;

function scan() {
	bluetooth.requestDevice({
	    filters:[{ services:[ eddystoneUUID ] }],
	    deviceFound: function(bluetoothDevice) {
	    	// Do something with bluetoothDevice.adData
	    }
	})
	// Recurse
	.then(scan);
}
scan();
```

#### Asynchronous device selection with UI

See [example_node_selector.js](example_node_selector.js) for a full node command-line example.

```js
var devices = [];

bluetooth.requestDevice({
    deviceFound: function(bluetoothDevice) {
    	devices.push(bluetoothDevice);
    }
})

// User selects device
var device = devices[0];

bluetooth.cancelRequest()
.then(() => device.gatt.connect())
.then(gattServer => ...
```

This could be wrapped into an implementation-specific UI function:

```js
function requestDeviceUI(filters) {
    return new Promise(function(resolve, reject) {
        var devices = [];

        bluetooth.requestDevice({
            filters: filters,
            deviceFound: deviceFoundFn
        })
        .catch(reject);

        function deviceFoundFn(device) {
            devices.push(device);
            // Update UI
        }

        // When user selects a device
        function chooseDevice(index) {
            var device = devices[index];

            bluetooth.cancelRequest()
            .then(() => resolve(device))
            .catch(reject);
        }
    });
}
```

Which could be called like this:

```js
requestDeviceUI([{ services:[ "heart_rate" ] }])
.then(device => ...
```

#### Synchronous device selection

```js
bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }],
    deviceFound: function(bluetoothDevice) {
    	if (bluetoothDevice.name === "my-sensor") {
    		// This will resolve the requestDevice promise
    		return true;
    	}
    }
})
.then(device => ...
```