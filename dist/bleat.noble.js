/* @license
 *
 * BLE Abstraction Tool: noble adapter
 * Version: 0.0.4
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
        define(['noble', 'bleat.core'], factory);
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
        bleat._addAdapter("noble", {
            foundFn: null,
            deviceHandles: {},
            serviceHandles: {},
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
                                var device = new bleat._Device(address, deviceInfo.advertisement.localName || address, serviceUUIDs);
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
            scan: function(serviceUUIDs, foundFn, errorFn) {
                this.foundFn = foundFn;
                noble.startScanning(serviceUUIDs, false, checkForError(errorFn));
            },
            stop: function(errorFn) {
                noble.stopScanning();
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                var baseDevice = this.deviceHandles[device.address];
                baseDevice.once("connect", connectFn);
                baseDevice.once("disconnect", disconnectFn);
                baseDevice.connect(checkForError(errorFn));
            },
            disconnect: function(device, errorFn) {
                this.deviceHandles[device.address].disconnect(checkForError(errorFn));
            },
            discoverServices: function(device, completeFn, errorFn) {
                var baseDevice = this.deviceHandles[device.address];
                baseDevice.discoverServices([], checkForError(errorFn, function(services) {
                    services.forEach(function(serviceInfo) {

                        this.serviceHandles[serviceInfo.uuid] = serviceInfo;
                        var serviceUUID = expandUUID(serviceInfo.uuid);
                        var service = new bleat._Service(serviceInfo.uuid, serviceUUID, false);
                        device.services[service.uuid] = service;

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            discoverCharacteristics: function(service, completeFn, errorFn) {
                var serviceInfo = this.serviceHandles[service._handle];
                serviceInfo.discoverCharacteristics([], checkForError(errorFn, function(characteristics) {
                    characteristics.forEach(function(characteristicInfo) {

                        this.characteristicHandles[characteristicInfo.uuid] = characteristicInfo;
                        var charUUID = expandUUID(characteristicInfo.uuid);
                        var characteristic = new bleat._Characteristic(characteristicInfo.uuid, charUUID, characteristicInfo.properties);
                        service.characteristics[characteristic.uuid] = characteristic;

                        characteristicInfo.on('read', function(data, isNotification) {
                            if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                                var arrayBuffer = new Uint8Array(data).buffer;
                                this.charNotifies[charUUID](arrayBuffer);
                            }
                        }.bind(this));

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            discoverDescriptors: function(characteristic, completeFn, errorFn) {
                var characteristicInfo = this.characteristicHandles[characteristic._handle];
                characteristicInfo.discoverDescriptors(checkForError(errorFn, function(descriptors) {
                    descriptors.forEach(function(descriptorInfo) {

                        var descHandle = characteristicInfo.uuid + "-" + descriptorInfo.uuid;
                        this.descriptorHandles[descHandle] = descriptorInfo;
                        var descUUID = expandUUID(descriptorInfo.uuid);
                        var descriptor = new bleat._Descriptor(descHandle, descUUID);
                        characteristic.descriptors[descUUID] = descriptor;

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].read(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);
                }));
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.characteristicHandles[characteristic._handle].write(buffer, true, checkForError(errorFn, completeFn));
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].once("notify", function(state) {
                    if (state !== true) return errorFn("notify failed to enable");
                    this.charNotifies[characteristic.uuid] = notifyFn;
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic._handle].notify(true, checkForError(errorFn));
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].once("notify", function(state) {
                    if (state !== false) return errorFn("notify failed to disable");
                    if (this.charNotifies[characteristic.uuid]) delete this.charNotifies[characteristic.uuid];
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic._handle].notify(false, checkForError(errorFn));
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                this.descriptorHandles[descriptor._handle].readValue(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);                    
                }));
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.descriptorHandles[descriptor._handle].writeValue(buffer, checkForError(errorFn, completeFn));
            }
        });
    }
}));