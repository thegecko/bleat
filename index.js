module.exports = {
	helpers: require('./dist/bluetooth.helpers'),
	get classic() {
		var bluetooth = require('./dist/api.classic');
		require('./dist/adapter.noble')(bluetooth);
		return bluetooth;
	},
	get webBluetooth() {
		var bluetooth = require('./dist/api.web-bluetooth');
		require('./dist/adapter.noble')(bluetooth);
		return bluetooth;
	}
};