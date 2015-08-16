/* @license
 *
 * BLE Abstraction Tool: core functionality
 * Version: 0.0.13
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Rob Moran
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/umdjs/umd
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory();
    } else {
        // Browser globals with support for web workers (root is window)
        root.bleat = factory();
    }
}(this, function() {
    "use strict";

    var adapter = null;
    var adapters = {};

    // Helpers
    var onError = null;
    function raiseError(msg) {
        return function(error) {
            if (onError) onError(msg + ": " + error);
        };
    }

    function executeFn(fn) {
        return function() {
            if (typeof fn === "function") {
                var args = [].slice.call(arguments);
                fn.apply(this, args);
            }
        };
    }

    // Device Object
    var Device = function(address, name, serviceUUIDs) {
        this.address = address;
        this.name = name;
        this.connected = false;
        this.serviceUUIDs = serviceUUIDs;
        this.services = {};
    };
    Device.prototype.hasService = function(serviceUUID) {
        var found = false;
        this.serviceUUIDs.some(function(uuid) {
            if (uuid === serviceUUID) {
                found = true;
                return true;
            }
        });
        return found;
    };
    Device.prototype.connect = function(connectFn, disconnectFn) {
        adapter.connect(this, executeFn(connectFn), executeFn(disconnectFn), raiseError("connect error"));
    };
    Device.prototype.disconnect = function() {
        adapter.disconnect(this, raiseError("disconnect error"));
    };

    // Service Object
    var Service = function(uuid, handle, primary) {
        this.uuid = uuid;
        this.handle = handle;
        this.primary = primary;
        this.characteristics = {};
    };

    // Characteristic Object
    var Characteristic = function(uuid, handle, properties) {
        this.uuid = uuid;
        this.handle = handle;
        this.properties = properties;
        this.descriptors = {};
    };
    Characteristic.prototype.read = function(completeFn) {
        adapter.readCharacteristic(this, executeFn(completeFn), raiseError("read characteristic error"));
    };
    Characteristic.prototype.write = function(bufferView, completeFn) {
        adapter.writeCharacteristic(this, bufferView, executeFn(completeFn), raiseError("write characteristic error"));
    };
    Characteristic.prototype.enableNotify = function(notifyFn, completeFn) {
        adapter.enableNotify(this, executeFn(notifyFn), executeFn(completeFn), raiseError("enable notify error"));
    };
    Characteristic.prototype.disableNotify = function(completeFn) {
        adapter.disableNotify(this, executeFn(completeFn), raiseError("disable notify error"));
    };

    // Descriptor Object
    var Descriptor = function(uuid, handle) {
        this.uuid = uuid;
        this.handle = handle;
    };
    Descriptor.prototype.read = function(completeFn) {
        adapter.readDescriptor(this, executeFn(completeFn), raiseError("read descriptor error"));
    };
    Descriptor.prototype.write = function(bufferView, completeFn) {
        adapter.writeDescriptor(this, bufferView, executeFn(completeFn), raiseError("write descriptor error"));
    };

    // Main Module
    return {
        raiseError: function(msg) {
            if (onError) onError(msg);
        },
        addAdapter: function(adapterName, definition) {
            adapters[adapterName] = definition;
            adapter = definition;
        },
        init: function(readyFn, errorFn, adapterName) {
            onError = errorFn;
            if (adapterName) adapter = adapters[adapterName];
            if (!adapter) raiseError("init error")("adapter not found");
            else adapter.init(executeFn(readyFn), raiseError("init error"));
        },
        startScan: function(foundFn) {
            adapter.stop(raiseError("stop scan error"));
            var devices = {};
            adapter.scan(function(device) {
                if (devices[device.address]) return;
                devices[device.address] = device;
                if (foundFn) foundFn(device);
            }.bind(this), raiseError("scan error"));
        },
        stopScan: function() {
            adapter.stop(raiseError("stop scan error"));
        },
        asyncWait: function(finishFn, errorFn) {
            var count = 0;
            var callbackAdded = false;
            this.addCallback = function(fn) {
                count++;
                callbackAdded = true;
                return function() {
                    if (fn) {
                        fn.apply(null, arguments);
                    }
                    if (--count == 0 && finishFn) {
                        finishFn();
                    }
                }
            };
            this.error = function() {
                if (errorFn) {
                    errorFn.apply(null, arguments);
                }
                if (--count == 0 && finishFn) {
                    finishFn();
                }
            };
            this.finish = function() {
                if (!callbackAdded && finishFn) {
                    finishFn();
                }
            };
        },
        Device: Device,
        Service: Service,
        Characteristic: Characteristic,
        Descriptor: Descriptor
    };
}));