/* @license
 *
 * BLE Abstraction Tool: noble adapter
 * Version: 0.0.2
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
        define(['noble', 'bleat'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(require('noble'), require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root.noble, root.bleat);
    }
}(this, function(noble, bleat) {
    "use strict";

    function checkForError(errorFn, continueFn) {
        return function(error) {
            if (error) errorFn(error);
            else if (typeof continueFn === "function") {
                var args = [].slice.call(arguments, 1);
                continueFn.apply(this, args);
            }
        };
    }

    function expandUUID(uuid) {
        var BLUETOOTH_BASE_UUID = "-0000-1000-8000-00805f9b34fb";
        if (uuid.length > 8) return uuid.toLowerCase();
        else return ("00000000" + uuid.toLowerCase()).slice(-8) + BLUETOOTH_BASE_UUID;
    }

    // https://github.com/sandeepmistry/noble
    if (noble) {
        bleat.addAdapter("noble", {
            foundFn: null,
            deviceHandles: {},
            characteristicHandles: {},
            descriptorHandles: {},
            charNotifies: {},
            init: function(readyFn, errorFn) {
                function stateCB(state) {
                    if (state === "poweredOn") {
                        noble.on('discover', function(deviceInfo) {
                            if (this.foundFn) {
                                var address = (deviceInfo.address && deviceInfo.address !== "unknown") ? deviceInfo.address : deviceInfo.uuid;
                                this.deviceHandles[address] = deviceInfo;
                                var serviceUUIDs = [];
                                deviceInfo.advertisement.serviceUuids.forEach(function(serviceUUID) {
                                    serviceUUIDs.push(expandUUID(serviceUUID));
                                });
                                var device = new bleat.Device(address, deviceInfo.advertisement.localName || address, serviceUUIDs);
                                this.foundFn(device);
                            }
                        }.bind(this));
                        readyFn();
                    }
                    else errorFn("adapter not enabled");
                }
                if (noble.state === "unknown") noble.once('stateChange', stateCB.bind(this));
                else stateCB(noble.state);
            },
            scan: function(foundFn, errorFn) {
                this.foundFn = foundFn;
                noble.startScanning([], false, checkForError(errorFn));
            },
            stop: function(errorFn) {
                noble.stopScanning();
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                var baseDevice = this.deviceHandles[device.address];
                var wait = new bleat.asyncWait(function() {
                    device.connected = true;
                    connectFn();
                });
                baseDevice.once("connect", function() {

                    baseDevice.discoverServices([], checkForError(errorFn, function(services) {
                        services.forEach(function(serviceInfo) {

                            var serviceUUID = expandUUID(serviceInfo.uuid);
                            var service = new bleat.Service(serviceUUID, serviceInfo.uuid, false);
                            device.services[service.uuid] = service;

                            serviceInfo.discoverCharacteristics([], wait.addCallback(checkForError(errorFn, function(characteristics) {
                                characteristics.forEach(function(characteristicInfo) {

                                    var charUUID = expandUUID(characteristicInfo.uuid);
                                    var characteristic = new bleat.Characteristic(charUUID, characteristicInfo.uuid, characteristicInfo.properties);
                                    service.characteristics[characteristic.uuid] = characteristic;
                                    this.characteristicHandles[characteristicInfo.uuid] = characteristicInfo;

                                    characteristicInfo.on('read', function(data, isNotification) {
                                        if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                                            var arrayBuffer = new Uint8Array(data).buffer;
                                            this.charNotifies[charUUID](arrayBuffer);
                                        }
                                    }.bind(this));

                                    characteristicInfo.discoverDescriptors(wait.addCallback(checkForError(errorFn, function(descriptors) {
                                        descriptors.forEach(function(descriptorInfo) {

                                            var descUUID = expandUUID(descriptorInfo.uuid);
                                            var descHandle = characteristicInfo.uuid + "-" + descriptorInfo.uuid;
                                            var descriptor = new bleat.Descriptor(descUUID, descHandle);
                                            characteristic.descriptors[descUUID] = descriptor;
                                            this.descriptorHandles[descHandle] = descriptorInfo;

                                        }, this);
                                    }.bind(this))));
                                }, this);
                            }.bind(this))));
                            wait.finish();
                        }, this);
                    }.bind(this)));
                }.bind(this));

                baseDevice.once("disconnect", function() {
                    device.connected = false;
                    disconnectFn();
                }.bind(this));

                baseDevice.connect(checkForError(errorFn));
            },
            disconnect: function(device, errorFn) {
                this.deviceHandles[device.address].disconnect(checkForError(errorFn));
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic.handle].read(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);
                }));
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.characteristicHandles[characteristic.handle].write(buffer, true, checkForError(errorFn, completeFn));
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                this.characteristicHandles[characteristic.handle].once("notify", function(state) {
                    if (state !== true) return errorFn("notify failed to enable");
                    this.charNotifies[characteristic.uuid] = notifyFn;
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic.handle].notify(true, checkForError(errorFn));
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic.handle].once("notify", function(state) {
                    if (state !== false) return errorFn("notify failed to disable");
                    if (this.charNotifies[characteristic.uuid]) delete this.charNotifies[characteristic.uuid];
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic.handle].notify(false, checkForError(errorFn));
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                this.descriptorHandles[descriptor.handle].readValue(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);                    
                }));
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.descriptorHandles[descriptor.handle].writeValue(buffer, checkForError(errorFn, completeFn));
            }
        });
    }
}));
