/* @license
 *
 * BLE Abstraction Tool: template adapter
 * Version: 0.0.1
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015
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
        define(['bleat.core'], factory.bind(this));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root.bleat);
    }
}(this, function(bleat) {
    "use strict";

    if (adapter_exists) {
        bleat._addAdapter("adapter_name", {
            init: function(readyFn, errorFn) {
            },
            scan: function(foundFn, errorFn) {
            },
            stop: function(errorFn) {
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
            },
            disconnect: function(device, errorFn) {
            },
            discoverServices: function(device, completeFn, errorFn) {
            },
            discoverCharacteristics: function(service, completeFn, errorFn) {
            },
            discoverDescriptors: function(characteristic, completeFn, errorFn) {
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
            }
        });
    }
}));