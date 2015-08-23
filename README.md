# bleat

[![Circle CI](https://img.shields.io/circleci/project/thegecko/bleat.svg)](https://circleci.com/gh/thegecko/bleat)
[![Bower](https://img.shields.io/bower/v/bleat.svg)](http://bower.io/search/?q=bleat)
[![npm](https://img.shields.io/npm/dm/bleat.svg)](https://www.npmjs.com/package/bleat)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

Bleat (Blutooth Low Energy Abstraction Tool) provides a simplified BLE layer which uses adapters to abstract the usage of BLE in JavaScript on different platforms.

## Implemented

* Central Mode
    * Device Scan
    * Advertised Service UUIDs
    * Connect/Disconnect
    * List Services/Characteristics/Descriptors
    * Read/Write/Notify Characteristics
    * Read/Write Descriptors

* Central Adapters
    * Android/iOS (using Evothings/Cordova/PhoneGap) https://github.com/evothings/cordova-ble/blob/master/ble.js
    * Mac/Linux (using noble on Node.js) https://github.com/sandeepmistry/noble
    * ChromeOS https://developer.chrome.com/apps/bluetoothLowEnergy

## Roadmap (to be implemented)

* Central Adapters
    * Web (following Web Bluetooth) https://www.w3.org/community/web-bluetooth

* Peripheral Mode
    * Advertising

* Peripheral Adapters
    * Mac/Linux (using bleno on Node.js) https://github.com/sandeepmistry/bleno
    * Tessel https://tessel.io/modules#module-ble
    * Espruino http://www.espruino.com/Bluetooth

## Installation

```
npm install bleat
      -or-
bower install bleat
```

## Usage

The main `bleat.core.js` file offers the BLE layer while each `bleat.<platform>.js` file represents an adapter.
The `bleat.js` file contains the BLE layer and all adapters concatenated together (not minified).
The `bleat.min.js` file is a minified version of the BLE layer and all adapters.

Files follow the UMD (https://github.com/umdjs/umd), so should work with AMD (requirejs), CommonJS (node) and plain JavaScript projects.

Refer to the `example_<adapter>` files for simple examples.

### Plain JavaScript (globals)

Include (or require) the `bleat.core.js` file before the adapter you wish to use or include the minified file offering all adapters.

e.g.

```
<script src="path/to/bleat.core.js"></script>
<script src="path/to/bleat.<adapter>.js"></script>
      -or-
<script src="path/to/bleat.min.js"></script>
```

### Node.js

Simply require it up!

```
var bleat = require('bleat');
```

## API

### bleat

#### bleat.init

Initialise bleat.

```
void bleat.init([readyFn], [errorFn], [adapterName]);
```

function readyFn(): callback function once init has completed

function errorFn(message): callback function for all errors while bleating

string adapterName: when multiple adapters available, specify which to use

#### bleat.startScan

Start scanning for devices.

```
void bleat.startScan(foundFn);
```

function foundFn(device): callback function for each device discovered.

#### bleat.stopScan

Stop scanning for devices.

```
void bleat.stopScan();
```

### device

string device.address: uuid of device

string device.name: name of device

bool device.connected: whether device is connected

string array device.serviceUUIDs: array of advertised services

object services: map of device services keyed on service uuid (available once connected)

#### device.hasService

Returns whether a device has the specified service.

```
bool device.hasService(serviceUUID);
```

string serviceUUID: service to search for

#### device.connect

Connect to the device.

```
void device.connect(connectFn, [disconnectFn], [suppressDiscovery]);
```

function connectFn(): callback once connected

function disconnectFn(): callback when disconnected

bool suppressDiscovery: don't undertake automatic discovery of services, characteristics and descriptors

#### device.disconnect

Disconnect from device.

```
void device.disconnect();
```

#### device.discoverServices

Discover all services for this device

```
void device.discoverServices(callbackFn)
```

function callbackFn(): callback once discovery complete

#### device.discoverAll

Discover all services, characteristics and descriptors for this device

```
void device.discoverAll(callbackFn)
```

function callbackFn(): callback once discovery complete

### Service

string uuid: uuid of service

bool primary: whether service is primary or not

object characteristics: map of service characteristics keyed on characteristic uuid

#### service.discoverCharacteristics

Discover all characteristics for this service

```
void service.discoverCharacteristics(callbackFn)
```

function callbackFn(): callback once discovery complete

### Characteristic

string uuid: uuid of characteristic

string array properties: characteristic properties

object descriptors: map of characteristic descriptors keyed on descriptor uuid

#### characteristic.read

Read value of characteristic.

```
void characteristic.read(completeFn);
```

function completeFn(ArrayBuffer): callback function containing value

#### characteristic.write

Write value to characteristic.

```
void characteristic.write(bufferView, completeFn);
```

DataView bufferView: value to write

function completeFn(): callback function once completed

#### characteristic.enableNotify

Enable notifications when characteristic value changes.

```
void characteristic.enableNotify(notifyFn, completeFn);
```

function notifyFn(ArrayBuffer): callback function containing value when changes

function completeFn(): callback function once completed

#### characteristic.disableNotify

Disable characteristic notifications.

```
void characteristic.disableNotify(completeFn);
```

function completeFn(): callback function once completed

#### characteristic.discoverDescriptors

Discover all descriptors for this characteristic

```
void characteristic.discoverDescriptors(callbackFn)
```

function callbackFn(): callback once discovery complete

### Descriptor

string uuid: uuid of descriptor

#### descriptor.read

Read value of descriptor.

```
void descriptor.read(completeFn);
```

function completeFn(ArrayBuffer): callback function containing value

#### descriptor.write

Write value to descriptor.

```
void descriptor.write(bufferView, completeFn);
```

DataView bufferView: value to write
function completeFn(): callback function once completed