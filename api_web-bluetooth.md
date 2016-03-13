## Web Bluetooth API

This API follows the [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) specification, but adds additional functions for use in headless situations.

### Extensions

#### bluetooth.addRequestHandler()

The ```bluetooth``` interface is extended with a ```addRequestHandler()``` function which registers a callback function called every time a device is requested using ```requestDevice()```.

```idl
interface Bluetooth {
    Promise<BluetoothDevice> requestDevice(RequestDeviceOptions options);
    Promise<void> addRequestHandler(RequestHandlerCallback function);
};
```
The ```addRequestHandler()``` function will ```resolve()``` if no errors occur. It will ```reject()``` if a requestHandler has previously been added.

When executed, the ```RequestHandlerCallback``` function passes a request context object which has the form:

```idl
interface RequestContext {
    Promise<void> scanForDevices();
    sequence<BluetoothDevice> scanResult;
    void selectDevice(BluetoothDevice device);
};
RequestContext implements EventTarget;
RequestContext implements RequestContextEventHandlers;

interface RequestContextEventHandlers {
    attribute EventHandler onscanresultchanged;
};
```

When ```addRequestHandler()``` has been called, scans for devices no longer execute automatically and must be undertaken by the request handler by using the ```scanForDevices()``` function. This allows full control of the scanning and any subsequent re-scans by the handler.

The function ```scanForDevices()``` resolves either once a scan timeout has been reached or when ```selectDevice()``` has been called.

When ```selectDevice()``` is called, the original ```requestDevice()``` promise is either ```resolved()``` (if a ```BluetoothDevice``` has been passed), or ```rejected()``` (if no device is passed).

### Example Usage

#### Synchronous device selection

This example shows how a device with name ```my-sensor``` can be automatically selected.

```js
bluetooth.addRequestHandler(context => {
    context.addEventListener('onscanresultchanged', e => {
        context.scanResult.some(device => {
            if (device.name === "my-sensor") {
                context.selectDevice(device);
                return true;
            }
        });
    });

    // Begin scanning
    context.scanForDevices();
});

bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }]
})
.then(device => ...
```

#### Asynchronous device selection with UI

This example shows how a user interface could be drawn showing nearby devices which the user could select. It also supports cancelling the search and searching again.

Also see [example_node_selector.js](examples/example_node_selector.js) for a full node command-line example.

```js
bluetooth.addRequestHandler(function(context) {

    context.addEventListener('onscanresultchanged', e => {
        // Draw UI
        context.scanResult.forEach(device => {
            ...
        });
    });

    function scan() {
        // Hide refresh button

        context.scanForDevices()
        .then(() => {
            // Show refresh button
        });
    }

    // When user searches again
    function onSearch() {
        scan();
    }

    // When device selected
    function onSelected(index) {
        var device = context.scanResult[index];
        context.selectDevice(device);
    }

    // When user cancels
    function onCancel() {
        context.selectDevice(null);
    }

    // Begin scanning
    scan();
});

bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }]
})
.then(device => ...
```

#### Continuous scanning

This example shows how it's possible to continually scan for devices.

Also see [example_node_eddystone.js](examples/example_node_eddystone.js) for a full example.

```js
bluetooth.addRequestHandler(function(context) {
    context.addEventListener('onscanresultchanged', e => {
        context.scanResult.forEach(device => {
            // Do something with device.adData
        });
    });

    function scan() {
        context.scanForDevices()
        // Recurse
        .then(scan);
    }

    // Begin scanning
    scan();
});

var eddystoneUUID = 0xFEAA;

bluetooth.requestDevice({
    filters:[{ services:[ eddystoneUUID ] }]
});
```