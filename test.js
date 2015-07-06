/**
Variables
*/

// requires
var fs = require('fs');
var tfprices = require('tfprices');

// cli paramters
var args = process.argv.splice(2);

// config
var configFile = __dirname + "/configs/config.json";
var accountConfigFile = __dirname + "/configs/" + args[0] + ".json";

// bot config object
var config = [];
var account_config = [];

var admins = [];

var item_account = null;
var metal_account = null;
var crate_account = null;
var my_steamid = null;

if(fs.existsSync(configFile)) {
	var data = fs.readFileSync(configFile, 'utf8');
	if(data != undefined) {
		config = JSON.parse(data);
	} else {
		throw Error("MISTAKE: there was a problem reading the config file: " + configFile);
	}
} else {
	throw Error("MISTAKE: configFile does not exist: " + configFile);
}

if(fs.existsSync(accountConfigFile)) {
	var data = fs.readFileSync(accountConfigFile, 'utf8');
	if(data != undefined) {
		account_config = JSON.parse(data);
	} else {
		throw Error("MISTAKE: there was a problem reading the config file: " + accountConfigFile);
	}
} else {
	throw Error("MISTAKE: configFile does not exist: " + accountConfigFile);
}

// make sure there is a username defined
if(account_config.username == undefined) {
	throw new Error("Please specify username");
}

var prices = new tfprices(config.backpacktf_key);

function getPrice() {
	prices.getItemPrice('5021', function() {
		console.log("PRICE: " + prices.price);
		console.log("CURRENCY: " + prices.currency);
		console.log("NAME: " + prices.name);
	});
}

var admin_accounts = null;

if(config.admin_accounts) {
	admin_accounts = config.admin_accounts;

	getSteamIds(admin_accounts, function() {
		if(typeof(callback) == "function") {
			callback(true);
		}
	});

	getMySteamId(function(steamId) {
		console.log("Got steamid " + steamId);
	});
}

function getSteamIds(accounts, callback) {
	for(login in accounts) {
		var account = accounts[login];
		admins.push(account.id);
		console.log(config.crate_accounts.indexOf(login));
		if(config.item_account == login) {
			item_account = account.id;
		} else if(config.metal_account == login) {
			metal_account = account.id;
		} else if(config.crate_accounts.indexOf(login) >= 0) {
			if(crate_account === null && login != account_config.username) {
				crate_account = account.id;
			}
		} else if(config.username == login || config.vanity_name == login) {
			my_steamid = account.id;
		}
	}
	if(typeof(callback) == "function") {
		callback(true);
	}
}

function getMySteamId(callback) {
	if(my_steamid === null) {
		if(account_config.steamid !== undefined) {
			my_steamid = config.steamid;
			console.log("Setting my steam id from account_config: " + my_steamid);
		} else {
			if(admin_accounts[account_config.username] != undefined) {
				my_steamid = admin_accounts[account_config.username].id;
				console.log("Setting my steam id from admin_accounts: " + my_steamid);
			} else {
				console.log(account_config.username+" is not a valid admin account");
			}
		}
	}

	if(typeof(callback) == "function" && my_steamid !== null) {
		callback(my_steamid);
	}
}
