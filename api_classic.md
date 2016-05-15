## Classic API

### bleat

#### bleat.startScan

Start scanning for devices.

```
void bleat.startScan([serviceUUIDs], foundFn, [completeFn], [errorFn], [allowDuplicates]);
```

string array serviceUUIDs: array or service UUIDs to scan for

function foundFn(device): called for each device discovered

function completeFn(): called when scanning successfully started

function errorFn(errorMsg): called if error occurs

bool allowDuplicates: will report the same device multiple times if set to true, will report once if set to false or omitted (false is the default)

#### bleat.stopScan

Stop scanning for devices.

```
void bleat.stopScan([errorFn]);
```

function errorFn(errorMsg): callback containing error if one occurs

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
void device.connect(connectFn, [disconnectFn], [errorFn], [suppressDiscovery]);
```

function connectFn(): callback once connected

function disconnectFn(): callback when disconnected

function errorFn(errorMsg): callback containing error if one occurs

bool suppressDiscovery: don't undertake automatic discovery of services, characteristics and descriptors

#### device.disconnect

Disconnect from device.

```
void device.disconnect([errorFn]);
```

function errorFn(errorMsg): callback containing error if one occurs

#### device.discoverServices

Discover services for this device

```
void device.discoverServices([serviceUUIDs], [completeFn], [errorFn])
```

string array serviceUUIDs: array of service uuids to restrict to

function completeFn(): callback once discovery complete

function errorFn(errorMsg): callback containing error if one occurs

#### device.discoverAll

Discover all services, characteristics and descriptors for this device

```
void device.discoverAll([completeFn], [errorFn])
```

function completeFn(): callback once discovery complete

function errorFn(errorMsg): callback containing error if one occurs

### Service

string uuid: uuid of service

bool primary: whether service is primary or not

object includedServices: map of included services keyed on service uuid

object characteristics: map of service characteristics keyed on characteristic uuid

#### service.discoverIncludedServices

Discover included services for this service

```
void service.discoverIncludedServices([serviceUUIDs], [completeFn], [errorFn])
```

string array serviceUUIDs: array of service uuids to restrict to

function completeFn(): callback once discovery complete

function errorFn(errorMsg): callback containing error if one occurs

#### service.discoverCharacteristics

Discover characteristics for this service

```
void service.discoverCharacteristics([characteristicUUIDs], [completeFn], [errorFn])
```

string array characteristicUUIDs: array of characteristic uuids to restrict to

function completeFn(): callback once discovery complete

function errorFn(errorMsg): callback containing error if one occurs

### Characteristic

string uuid: uuid of characteristic

object properties: map of characteristic properties

object descriptors: map of characteristic descriptors keyed on descriptor uuid

#### characteristic.read

Read value of characteristic.

```
void characteristic.read(completeFn, [errorFn]);
```

function completeFn(DataView): callback function containing value

function errorFn(errorMsg): callback containing error if one occurs

#### characteristic.write

Write value to characteristic.

```
void characteristic.write(dataView, [completeFn], [errorFn]);
```

DataView dataView: value to write

function completeFn(): callback function once completed

function errorFn(errorMsg): callback containing error if one occurs

#### characteristic.enableNotify

Enable notifications when characteristic value changes.

```
void characteristic.enableNotify(notifyFn, [completeFn], [errorFn]);
```

function notifyFn(DataView): callback function containing value when changes

function completeFn(): callback function once completed

function errorFn(errorMsg): callback containing error if one occurs

#### characteristic.disableNotify

Disable characteristic notifications.

```
void characteristic.disableNotify([completeFn], [errorFn]);
```

function completeFn(): callback function once completed

function errorFn(errorMsg): callback containing error if one occurs

#### characteristic.discoverDescriptors

Discover descriptors for this characteristic

```
void characteristic.discoverDescriptors([descriptorUUIDs], [completeFn], [errorFn])
```

string array descriptorUUIDs: array of descriptor uuids to restrict to

function completeFn(): callback once discovery complete

function errorFn(errorMsg): callback containing error if one occurs

### Descriptor

string uuid: uuid of descriptor

#### descriptor.read

Read value of descriptor.

```
void descriptor.read(completeFn, [errorFn]);
```

function completeFn(DataView): callback function containing value

function errorFn(errorMsg): callback containing error if one occurs

#### descriptor.write

Write value to descriptor.

```
void descriptor.write(dataView, [completeFn], [errorFn]);
```

DataView dataView: value to write

function completeFn(): callback function once completed

function errorFn(errorMsg): callback containing error if one occurs