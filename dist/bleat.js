/* @license
 *
 * BLE Abstraction Tool: core functionality
 * Version: 0.0.12
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
        Device: Device,
        Service: Service,
        Characteristic: Characteristic,
        Descriptor: Descriptor
    };
}));
/* @license
 *
 * BLE Abstraction Tool: chromeos adapter
 * Version: 0.0.6
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
        define(['bleat'], factory.bind(this, root));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(root, require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root, root.bleat);
    }
}(this, function(root, bleat) {
    "use strict";

    function checkForError(errorFn, continueFn) {
        return function() {
            if (chrome.runtime.lastError) {
                errorFn(chrome.runtime.lastError.message);
                return;
            }
            if (typeof continueFn === "function") {
                var args = [].slice.call(arguments);
                continueFn.apply(this, args);
            }
        };
    }

    // https://developer.chrome.com/apps/bluetoothLowEnergy
    if (root.chrome && root.chrome.bluetooth && root.chrome.bluetoothLowEnergy) {

        bleat.addAdapter("chromeos", {
            charNotifies: {},
            deviceDisconnects: {},
            foundFn: null,
            init: function(readyFn, errorFn) {
                chrome.bluetooth.getAdapterState(checkForError(errorFn, function(adapterInfo) {
                    if (adapterInfo.available) {
                        chrome.bluetooth.onDeviceAdded.addListener(function(deviceInfo) {
                            if (this.foundFn) {
                                var device = new bleat.Device(deviceInfo.address, deviceInfo.name, deviceInfo.uuids || []);
                                this.foundFn(device);
                            }
                        }.bind(this));
                        chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(function(characteristicInfo) {
                            if (typeof this.charNotifies[characteristicInfo.instanceId] === "function") {
                                this.charNotifies[characteristicInfo.instanceId](characteristicInfo.value);
                                delete this.charNotifies[characteristicInfo.instanceId];
                            }
                        }.bind(this));
                        chrome.bluetooth.onDeviceRemoved.addListener(this.checkDisconnect.bind(this));
                        chrome.bluetooth.onDeviceChanged.addListener(function(deviceInfo) {
                            if (deviceInfo.connected === false) this.checkDisconnect(deviceInfo);
                        }.bind(this));
                        readyFn();
                    }
                    else errorFn("adapter not enabled");
                }.bind(this)));
            },
            checkDisconnect: function(deviceInfo) {
                if (typeof this.deviceDisconnects[deviceInfo.address] === "function") {
                    this.deviceDisconnects[deviceInfo.address]();
                    delete this.deviceDisconnects[deviceInfo.address];
                }
            },
            scan: function(foundFn, errorFn) {
                chrome.bluetooth.getDevices(checkForError(errorFn, function(devices) {
                    devices.forEach(function(deviceInfo) {
                        var device = new bleat.Device(deviceInfo.address, deviceInfo.name, deviceInfo.uuids || []);
                        foundFn(device);
                    });
                }));

                this.foundFn = foundFn;
                chrome.bluetooth.startDiscovery(checkForError(errorFn));
            },
            stop: function(errorFn) {
                this.foundFn = null;
                if (chrome.bluetooth.discovering) chrome.bluetooth.stopDiscovery(checkForError(errorFn));
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                chrome.bluetoothLowEnergy.connect(device.address, checkForError(errorFn, function() {

                    this.deviceDisconnects[device.address] = function() {
                        device.connected = false;
                        device.services = {};
                        disconnectFn();
                    };
                    device.connected = true;

                    chrome.bluetoothLowEnergy.getServices(device.address, checkForError(errorFn, function(services) {
                        services.forEach(function(serviceInfo) {
                            var service = new bleat.Service(serviceInfo.uuid, serviceInfo.instanceId, serviceInfo.isPrimary);
                            device.services[service.uuid] = service;
                            chrome.bluetoothLowEnergy.getCharacteristics(serviceInfo.instanceId, checkForError(errorFn, function(characteristics) {
                                characteristics.forEach(function(characteristicInfo) {
                                    var characteristic = new bleat.Characteristic(characteristicInfo.uuid, characteristicInfo.instanceId, characteristicInfo.properties);
                                    service.characteristics[characteristic.uuid] = characteristic;

                                    chrome.bluetoothLowEnergy.getDescriptors(characteristicInfo.instanceId, checkForError(errorFn, function(descriptors) {
                                        descriptors.forEach(function(descriptorInfo) {
                                            var descriptor = new bleat.Descriptor(descriptorInfo.uuid, descriptorInfo.instanceId);
                                            characteristic.descriptors[descriptor.uuid] = descriptor;
                                        });
                                    }));
                                });
                            }));
                        });
                        setTimeout(connectFn, 0);
                    }));
                }.bind(this)));
            },
            disconnect: function(device, errorFn) {
                chrome.bluetoothLowEnergy.disconnect(device.address, checkForError(errorFn));
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.readCharacteristicValue(characteristic.handle, checkForError(errorFn, function(characteristicInfo) {
                    completeFn(characteristicInfo.value);
                }));
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.writeCharacteristicValue(characteristic.handle, bufferView.buffer, checkForError(errorFn, completeFn));
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.startCharacteristicNotifications(characteristic.handle, null, checkForError(errorFn, function() {
                    this.charNotifies[characteristic.handle] = notifyFn;
                    completeFn();
                }.bind(this)));
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.stopCharacteristicNotifications(characteristic.handle, checkForError(errorFn, function() {
                    if (this.charNotifies[characteristic.handle]) delete this.charNotifies[characteristic.handle];
                    completeFn();
                }.bind(this)));
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.readDescriptorValue(descriptor.handle, checkForError(errorFn, function(descriptorInfo) {
                    completeFn(descriptorInfo.value);
                }));
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.writeDescriptorValue(descriptor.handle, bufferView.buffer, checkForError(errorFn, completeFn));
            }
        });
    }
}));
/* @license
 *
 * BLE Abstraction Tool: evothings adapter
 * Version: 0.0.6
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
        define(['bleat'], factory.bind(this, root));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(root, require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root, root.bleat);
    }
}(this, function(root, bleat) {
    "use strict";

    var BLUETOOTH_BASE_UUID = "-0000-1000-8000-00805f9b34fb";
    var CCCD_UUID = "00002902-0000-1000-8000-00805f9b34fb";

    // Advert parsing from https://github.com/evothings/evothings-examples/blob/master/resources/libs/evothings/easyble/easyble.js
    // Should be encapsulated in the native Android implementation (see issue #62)
    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ? nChr - 65
            : nChr > 96 && nChr < 123 ? nChr - 71
            : nChr > 47 && nChr < 58 ? nChr + 4
            : nChr === 43 ? 62
            : nChr === 47 ? 63
            : 0;
    }

    function base64DecToArr(sBase64, nBlocksSize) {
        var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
        var nInLen = sB64Enc.length;
        var nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
        var taBytes = new Uint8Array(nOutLen);

        for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    }

    function littleEndianToUint16(data, offset) {
        return (data[offset + 1] << 8) + data[offset];
    }

    function littleEndianToUint32(data, offset) {
        return (data[offset + 3] << 24) + (data[offset + 2] << 16) + (data[offset + 1] << 8) + data[offset];
    }

    function arrayToUUID(array, offset) {
        var uuid = "";
        var pointer = 0;
        [4, 2, 2, 2, 6].forEach(function(length) {
            uuid += '-';
            for (var i = 0; i < length; i++, pointer++) {
                uuid += ("00" + array[offset + pointer].toString(16)).slice(-2);
            }
        });
        return uuid.substr(1);
    }

    function parseAdvert(deviceInfo) {
        var advert = {
            name: deviceInfo.name,
            serviceUUIDs: []
        };

        if (deviceInfo.advertisementData) {
            if (deviceInfo.advertisementData.kCBAdvDataLocalName) advert.name = deviceInfo.advertisementData.kCBAdvDataLocalName;
            if (deviceInfo.advertisementData.kCBAdvDataServiceUUIDs) {
                deviceInfo.advertisementData.kCBAdvDataServiceUUIDs.forEach(function(serviceUUID) {
                    if (serviceUUID.length > 8) advert.serviceUUIDs.push(serviceUUID.toLowerCase());
                    else advert.serviceUUIDs.push(("00000000" + serviceUUID.toLowerCase()).slice(-8) + BLUETOOTH_BASE_UUID);
                });
            }
        } else if (deviceInfo.scanRecord) {

            var byteArray = base64DecToArr(deviceInfo.scanRecord);
            var pos = 0;
            while (pos < byteArray.length) {

                var length = byteArray[pos++];
                if (length === 0) break;
                length -= 1;
                var type = byteArray[pos++];
                var i;

                if (type == 0x02 || type == 0x03) { // 16-bit Service Class UUIDs
                    for (i = 0; i < length; i += 2) {
                        advert.serviceUUIDs.push(("0000" + littleEndianToUint16(byteArray, pos + i).toString(16)).slice(-8) + BLUETOOTH_BASE_UUID);
                    }
                } else if (type == 0x04 || type == 0x05) { // 32-bit Service Class UUIDs
                    for (i = 0; i < length; i += 4) {
                        advert.serviceUUIDs.push(("00000000" + littleEndianToUint32(byteArray, pos + i).toString(16)).slice(-8) + BLUETOOTH_BASE_UUID);
                    }
                } else if (type == 0x06 || type == 0x07) { // 128-bit Service Class UUIDs
                    for (i = 0; i < length; i += 4) {
                        advert.serviceUUIDs.push(arrayToUUID(byteArray, pos + i));
                    }
                } else if (type == 0x08 || type == 0x09) { // Local Name
                    advert.name = evothings.ble.fromUtf8(new Uint8Array(byteArray.buffer, pos, length)).replace('\0', '');
                }
                pos += length;
            }
        }
        return advert;
    }

    // https://github.com/evothings/cordova-ble/blob/master/ble.js
    if (root.cordova) {

        var platform = root.cordova.platformId;

        bleat.addAdapter("evothings", {
            deviceHandles: {},
            characteristicHandles: {},
            descriptorHandles: {},
            notifyCallbacks: {},
            init: function(readyFn, errorFn) {
                if (root.evothings && evothings.ble) readyFn();
                else document.addEventListener("deviceready", readyFn);
            },
            scan: function(foundFn, errorFn) {
                evothings.ble.startScan(function(deviceInfo) {
                    var advert = parseAdvert(deviceInfo);
                    var device = new bleat.Device(deviceInfo.address, advert.name, advert.serviceUUIDs);
                    foundFn(device);
                }, errorFn);
            },
            stop: function(errorFn) {
                evothings.ble.stopScan();
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                evothings.ble.connect(device.address, function(connectInfo) {
                    if (connectInfo.state === 0) { // Disconnected
                        device.connected = false;
                        device.services = {};

                        if (this.deviceHandles[device.address]) {
                            evothings.ble.close(this.deviceHandles[device.address]);
                            delete this.deviceHandles[device.address];
                        }
                        disconnectFn();

                    } else if (connectInfo.state === 2) { // Connected
                        device.connected = true;
                        this.deviceHandles[device.address] = connectInfo.deviceHandle;
                        evothings.ble.readAllServiceData(connectInfo.deviceHandle, function(services) {
                            services.forEach(function(serviceInfo) {
                                var service = new bleat.Service(serviceInfo.uuid, serviceInfo.handle, (serviceInfo.type === 0));
                                device.services[service.uuid] = service;

                                serviceInfo.characteristics.forEach(function(characteristicInfo) {
                                    var properties = [];// [characteristicInfo.permission + characteristicInfo.property + characteristicInfo.writeType]
                                    var characteristic = new bleat.Characteristic(characteristicInfo.uuid, characteristicInfo.handle, properties);
                                    service.characteristics[characteristic.uuid] = characteristic;
                                    this.characteristicHandles[characteristicInfo.handle] = connectInfo.deviceHandle;
                                    characteristicInfo.descriptors.forEach(function(descriptorInfo) {
                                        var descriptor = new bleat.Descriptor(descriptorInfo.uuid, descriptorInfo.handle);
                                        characteristic.descriptors[descriptor.uuid] = descriptor;
                                        this.descriptorHandles[descriptorInfo.handle] = connectInfo.deviceHandle;
                                    }, this);
                                }, this);
                            }, this);
                            connectFn();

                        }.bind(this), errorFn);
                    }
                }.bind(this), errorFn);
            },
            disconnect: function(device, errorFn) {
                if (this.deviceHandles[device.address]) evothings.ble.close(this.deviceHandles[device.address]);
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                evothings.ble.readCharacteristic(this.characteristicHandles[characteristic.handle], characteristic.handle, function(data) {
                    // Re-enable notification on iOS if there was one, see issue #61
                    if (platform === "ios" && this.notifyCallbacks[characteristic.uuid]) this.enableNotify(characteristic, this.notifyCallbacks[characteristic.uuid], null, errorFn);
                    completeFn(data);
                }.bind(this), errorFn);
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                evothings.ble.writeCharacteristic(this.characteristicHandles[characteristic.handle], characteristic.handle, bufferView, completeFn, errorFn);
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                var callbackFn = function() {
                    evothings.ble.enableNotification(this.characteristicHandles[characteristic.handle], characteristic.handle, notifyFn, errorFn);
                    if (platform === "ios") this.notifyCallbacks[characteristic.uuid] = notifyFn;
                    if (completeFn) completeFn();
                };
                if (platform === "android") {
                    // Android needs the CCCD descriptor written to for notifications
                    // Should be encapsulated in native android layer (see issue #30)
                    var descriptor = characteristic.descriptors[CCCD_UUID];
                    if (!descriptor) {
                        errorFn("cannot find notify descriptor");
                        return;
                    }
                    this.writeDescriptor(descriptor, new Uint8Array([1, 0]), callbackFn.bind(this), errorFn);
                } else callbackFn.call(this);
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                evothings.ble.disableNotification(this.characteristicHandles[characteristic.handle], characteristic.handle, completeFn, errorFn);
                if (platform === "ios") {
                    delete this.notifyCallbacks[characteristic.uuid];
                    // iOS doesn't call back after disable (see issue #65)
                    completeFn();
                }
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                evothings.ble.readDescriptor(this.descriptorHandles[descriptor.handle], descriptor.handle, completeFn, errorFn);
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                evothings.ble.writeDescriptor(this.descriptorHandles[descriptor.handle], descriptor.handle, bufferView, completeFn, errorFn);
            }
        });
    }
}));
/* @license
 *
 * BLE Abstraction Tool: noble adapter
 * Version: 0.0.1
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
                baseDevice.once("connect", function() {
                    baseDevice.discoverAllServicesAndCharacteristics(checkForError(errorFn, function(services, characteristics) {
                        services.forEach(function(serviceInfo) {
                            var service = new bleat.Service(expandUUID(serviceInfo.uuid), expandUUID(serviceInfo.uuid), false);
                            serviceInfo.characteristics.forEach(function(characteristicInfo) {
                                var charUUID = expandUUID(characteristicInfo.uuid);
                                this.characteristicHandles[charUUID] = characteristicInfo;
                                var characteristic = new bleat.Characteristic(charUUID, charUUID, characteristicInfo.properties);
                                characteristicInfo.on('read', function(data, isNotification) {
                                    if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                                        var arrayBuffer = new Uint8Array(data).buffer;
                                        this.charNotifies[charUUID](arrayBuffer);
                                    }
                                }.bind(this));
                                service.characteristics[characteristic.uuid] = characteristic;
                                characteristicInfo.discoverDescriptors(checkForError(errorFn, function(descriptors) {
                                    descriptors.forEach(function(descriptorInfo) {
                                        var descUUID = expandUUID(descriptorInfo.uuid);
                                        this.descriptorHandles[descUUID] = descriptorInfo;
                                        var descriptor = new bleat.Descriptor(descUUID, descUUID);
                                        characteristicInfo.descriptors[descriptor.uuid] = descriptor;
                                    }, this);
                                }.bind(this)));
                            }, this);
                            device.services[service.uuid] = service;
                        }, this);
                        device.connected = true;
                        connectFn();
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