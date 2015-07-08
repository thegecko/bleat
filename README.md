# bleat

[![Circle CI](https://img.shields.io/circleci/project/thegecko/bleat.svg)](https://circleci.com/gh/thegecko/bleat)
[![Bower](https://img.shields.io/bower/v/bleat.svg)](http://bower.io/search/?q=bleat)
[![npm](https://img.shields.io/npm/dm/bleat.svg)](https://www.npmjs.com/package/bleat)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

Bleat (Blutooth Low Energy Abstraction Tool) provides a simplified BLE layer which uses adapters to abstract the usage of BLE in JavaScript on different platforms.

## Roadmap

#### Basic BLE layer

* <del>Central Mode</del>
    * <del>Device Scan</del>
    * <del>Advertised Service UUIDs</del>
    * <del>Connect/Disconnect</del>
    * <del>List Services/Characteristics/Descriptors</del>
    * <del>Read/Write/Notify Characteristics</del>
    * <del>Read/Write Descriptors</del>
* Peripheral Mode
    * Advertising

#### Adapters

* Central Mode
    * <del>Evothings/Cordova/PhoneGap</del> https://github.com/evothings/cordova-ble/blob/master/ble.js
    * <del>ChromeOS</del> https://developer.chrome.com/apps/bluetoothLowEnergy
    * <del>noble</del> https://github.com/sandeepmistry/noble
    * Web Bluetooth https://www.w3.org/community/web-bluetooth
* Peripheral Mode
    * bleno
    * Tessel
    * Espruino

## Installation

```
npm install bleat
      -or-
bower install bleat
```

## Usage

The main `bleat.js` file offers the BLE layer while each `bleat.<platform>.js` file represents an adapter.
The `bleat.min.js` file is a minified version of the BLE layer and all adapters.

Files follow the UMD (https://github.com/umdjs/umd), so should work with AMD (requirejs), CommonJS (node) and plain JavaScript projects.

Include (or require) the `bleat.js` file before the adapter you wish to use or include the minified file offering all adapters.

e.g.

```
<script src="path/to/bleat.js"></script>
<script src="path/to/bleat.<adapter>.js"></script>
      -or-
<script src="path/to/bleat.min.js"></script>
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
void device.connect(connectFn, disconnectFn);
```

function connectFn(): callback once connected

function disconnectFn(): callback when disconnected

#### device.disconnect

Disconnect from device.

```
void device.disconnect();
```

### Service

string uuid: uuid of service

bool primary: whether service is primary or not

object characteristics: map of service characteristics keyed on characteristic uuid

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
void characteristic.enableNotify(notifyFn);
```

function notifyFn(ArrayBuffer): callback function containing value when changes

#### characteristic.disableNotify

Disable characteristic notifications.

```
void characteristic.disableNotify(completeFn);
```

function completeFn(): callback function once completed

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