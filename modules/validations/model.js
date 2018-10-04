'use strict';

/**
 * Interacting with the database
 */
const level = require('level-mem');
const db = level();

// Add data to levelDB with key/value pair
function addLevelDBData(db, key, value) {
	return new Promise((resolve, reject) => {
		db.put(key, value, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(key);
            }
	    });
	});
}

// Add data to levelDB with value
function addDataToLevelDB(db, value) {
	return new Promise((resolve, reject) => {
		let i = 0;
	  db.createReadStream()
		.on('data', function(data) {
	  	i++;
	   })
		 .on('error', function(err) {
			 reject(err);
	   })
		 .on('close', function() {
	   		addLevelDBData(i, value)
				.then((key) => {
					resolve(key);
				})
				.catch((error) => {
					reject(error);
				});
	   });
	});
}

function getLevelDBData(db, key) {
    return new Promise((resolve, reject) => {
        db.get(key, function(err, value) {
            if (value) {
                resolve(value);
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Validation class
 */
class ValidationRequest {
    constructor(address) {
        this.address = address,
        this.requestTimestamp = new Date().getTime().toString().slice(0,-3),
        this.message = this.address + ':' + this.requestTimestamp + ':' + 'starRegistry',
        this.validationWindow = 300
    }
}


class Validation {
    checkAddress(address) {
        return new Promise((resolve, reject) => {
            getLevelDBData(db, address)
            .then((value) => {
                resolve(value);
            })
            .catch((err) => {
                reject(err);
            })
        });
    }
    
    addRequest(address) {
        return new Promise((resolve, reject) => {
            //check if address already has request
            this.checkAddress(address)
            .then((value) => {
                //check if it has been more than 300 seconds
                let validationRequest = JSON.parse(value);
                let requestTimestamp = parseInt(validationRequest.requestTimestamp);
                if (new Date() - new Date(requestTimestamp * 1000) > 300000) {
                    //create new request and add it in place of old one
                    let newValidationRequest = new ValidationRequest(address);
                    addLevelDBData(db, address, JSON.stringify(newValidationRequest).toString());
                    resolve(newValidationRequest);
                } else {
                    validationRequest.validationWindow = Math.round(300 - (new Date() - new Date(requestTimestamp * 1000)) / 1000);
                    addLevelDBData(db, address, JSON.stringify(validationRequest).toString());                    
                    resolve(validationRequest);
                }
            })
            .catch((err) => {
                if (err.name === 'NotFoundError') {
                    let newValidation = new ValidationRequest(address);
                    addLevelDBData(db, address, JSON.stringify(newValidation).toString());
                    resolve(newValidation);
                } else {
                    reject(err);
                }
            });
        });
    }
}

const validations = module.exports = new Validation;

