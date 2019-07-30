![bleat](https://thegecko.github.io/bleat/images/bleat.png)
___

[![Circle CI](https://img.shields.io/circleci/project/thegecko/bleat.svg)](https://circleci.com/gh/thegecko/bleat)
[![Bower](https://img.shields.io/bower/v/bleat.svg)](http://bower.io/search/?q=bleat)
[![npm](https://img.shields.io/npm/dm/bleat.svg)](https://www.npmjs.com/package/bleat)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

This library has been deprecated in favour of [webbluetooth](https://www.npmjs.com/package/webbluetooth).

Please upgrade your Node.js applications accordingly. Evothings users should continue to use bleat as a legacy library.

Bleat (Bluetooth Low Energy Abstraction Tool) provides a simplified BLE layer which uses adapters to abstract the usage of BLE in JavaScript on different platforms.

## APIs

Bleat has 2 APIs:

 * The [Extended Web Bluetooth API](api_web-bluetooth.md) specification developed for use in browsers
 * The [Classic API](api_classic.md), originally developed for this project

## Installation

To install the library, either clone or copy the files to your project or use a package manager:

```
$ npm install bleat
```
-or-
```
$ bower install bleat
```

## Usage

The ```bluetooth.helpers.js``` file contains general helper objects and functions.

The ```api.<api>.js``` files each offer a BLE API.

The ```adapter.<platform>.js``` files each represent an adapter targetting a specific BLE engine, the ```adapter-template.js``` file is an empty template to ease creation of a new adapter.

The ```<api>.<adapter>.min.js``` files are minified versions of the BLE APIs including the helpers and a single adapter.

Files follow the [UMDJS](https://github.com/umdjs/umd) specification, so should work with CommonJS (such as [node.js](https://nodejs.org/)), AMD (such as [RequireJS](http://requirejs.org/)) and plain JavaScript projects.

Refer to the ```example_<adapter>_<api>``` files and folders for simple examples of how to use each combination.

### CommonJS (node.js)

Simply require it up, specifying the api you wish to use:

```node
var bleat = require('bleat').classic;
```
-or-
```node
var bleat = require('bleat').webbluetooth;
```

### AMD (RequireJS)

To use bleat with [RequireJS](http://requirejs.org/), set the ```requirejs.config``` to load your API of choice as ```bleat``` and add a dependency on your adapter of choice:

```js
requirejs.config({
	baseUrl: 'path/to/bleat',
	paths: {
		bleat: 'api.classic',
		adapter: 'adapter.evothings'
	},
	shim: {
		bleat: {
			deps: ['adapter']
		}
	}
});
```

You can then use bleat as follows:

```js
require(['bleat'], function(bleat) {
	// Use bleat here
});
```

### Plain JavaScript (globals)

Include the ```bluetooth.helpers.js``` file, then the bleat api file you wish to use and finally the adapter file you wish to use:

```html
<script src="path/to/bluetooth.helpers.js"></script>
<script src="path/to/api.classic.js"></script>
<script src="path/to/adapter.evothings.js"></script>
```

Alternatively, you can just include the minified file which contains the API and adapter you wish to use:

```html
<script src="path/to/web-bluetooth.evothings.min.js"></script>
```

A global object ```root.bleat``` will then be available to use.
