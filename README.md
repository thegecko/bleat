# bleat

[![Circle CI](https://img.shields.io/circleci/project/thegecko/bleat.svg)](https://circleci.com/gh/thegecko/bleat)
[![Bower](https://img.shields.io/bower/v/bleat.svg)](http://bower.io/search/?q=bleat)
[![npm](https://img.shields.io/npm/dm/bleat.svg)](https://www.npmjs.com/package/bleat)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

Bleat (Blutooth Low Energy Abstraction Tool) provides a simplified BLE layer which uses adapters to abstract the usage of BLE in JavaScript on different platforms.

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

See the [Classic API](api_classic.md) for more information.

Bleat (Blutooth Low Energy Abstraction Tool) provides a simplified BLE layer which uses adapters to abstract the usage of BLE in JavaScript on different platforms.

Follows the [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) API specification.

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
```

### Node.js

Simply require it up!

```
var bleat = require('bleat');
```

### To Do
 * Merge back to master with API/interface type; bleat.classic or bleat.web-bluetooth
 * Add requestDevice() callback hook to allow headless implementations select a device
 * Implement service filtering based on filters and optional services passed in
 * Implement BluetoothRemoteGATTService servicechanged / serviceremoved events
 * Evothings adapter
 * ChromeOS adapter

Specification Updates:
 * https://github.com/WebBluetoothCG/web-bluetooth/pull/174
 * https://github.com/WebBluetoothCG/web-bluetooth/pull/187
