/* @license
 *
 * BLE Abstraction Tool: template adapter
 * Version: 0.0.1
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Rob Moran
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
        define(['bleat', 'bluetooth.helpers'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = function(bleat) {
            return factory(bleat, require('./bluetooth.helpers'));
        };
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root.bleat, root.bleatHelpers);
    }
}(this, function(bleat, helpers) {
    "use strict";

    bleat._addAdapter("template", {
        startScan: function(serviceUUIDs, foundFn, completeFn, errorFn) {},
        stopScan: function(errorFn) {},
        connect: function(handle, connectFn, disconnectFn, errorFn) {},
        disconnect: function(handle, errorFn) {},
        discoverServices: function(handle, serviceUUIDs, completeFn, errorFn) {},
        discoverIncludedServices: function(handle, serviceUUIDs, completeFn, errorFn) {},
        discoverCharacteristics: function(handle, characteristicUUIDs, completeFn, errorFn) {},
        discoverDescriptors: function(handle, descriptorUUIDs, completeFn, errorFn) {},
        readCharacteristic: function(handle, completeFn, errorFn) {},
        writeCharacteristic: function(handle, dataView, completeFn, errorFn) {},
        enableNotify: function(handle, notifyFn, completeFn, errorFn) {},
        disableNotify: function(handle, completeFn, errorFn) {},
        readDescriptor: function(handle, completeFn, errorFn) {},
        writeDescriptor: function(handle, dataView, completeFn, errorFn) {}
    });
}));