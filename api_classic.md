## Classic API

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
void bleat.startScan(foundFn, [completeFn]);
```

function foundFn(device): callback function for each device discovered.

function completeFn(): callback if/when scanning stops

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

object adData: map of advertisement data

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

Discover services for this device

```
void device.discoverServices([serviceUUIDs], completeFn)
```

string array serviceUUIDs: array of service uuids to restrict to

function completeFn(): callback once discovery complete

#### device.discoverAll

Discover all services, characteristics and descriptors for this device

```
void device.discoverAll(completeFn)
```

function completeFn(): callback once discovery complete

### Service

string uuid: uuid of service

bool primary: whether service is primary or not

object includedServices: map of included services keyed on service uuid

object characteristics: map of service characteristics keyed on characteristic uuid

#### service.discoverIncludedServices

Discover included services for this service

```
void service.discoverIncludedServices([serviceUUIDs], completeFn)
```

string array serviceUUIDs: array of service uuids to restrict to

function completeFn(): callback once discovery complete

#### service.discoverCharacteristics

Discover characteristics for this service

```
void service.discoverCharacteristics([characteristicUUIDs], completeFn)
```

string array characteristicUUIDs: array of characteristic uuids to restrict to

function completeFn(): callback once discovery complete

### Characteristic

string uuid: uuid of characteristic

object properties: map of characteristic properties

object descriptors: map of characteristic descriptors keyed on descriptor uuid

#### characteristic.read

Read value of characteristic.

```
void characteristic.read(completeFn);
```

function completeFn(DataView): callback function containing value

#### characteristic.write

Write value to characteristic.

```
void characteristic.write(dataView, completeFn);
```

DataView dataView: value to write

function completeFn(): callback function once completed

#### characteristic.enableNotify

Enable notifications when characteristic value changes.

```
void characteristic.enableNotify(notifyFn, completeFn);
```

function notifyFn(DataView): callback function containing value when changes

function completeFn(): callback function once completed

#### characteristic.disableNotify

Disable characteristic notifications.

```
void characteristic.disableNotify(completeFn);
```

function completeFn(): callback function once completed

#### characteristic.discoverDescriptors

Discover descriptors for this characteristic

```
void characteristic.discoverDescriptors([descriptorUUIDs], completeFn)
```

string array descriptorUUIDs: array of descriptor uuids to restrict to

function completeFn(): callback once discovery complete

### Descriptor

string uuid: uuid of descriptor

#### descriptor.read

Read value of descriptor.

```
void descriptor.read(completeFn);
```

function completeFn(DataView): callback function containing value

#### descriptor.write

Write value to descriptor.

```
void descriptor.write(dataView, completeFn);
```

DataView dataView: value to write
function completeFn(): callback function once completed