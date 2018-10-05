'use strict';

const bitcoinMessage = require('bitcoinjs-message');

/**
 * Interacting with the database
 */
const levelup = require('levelup');
const memdown = require('memdown');
const db = levelup(memdown());

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

function delLevelDBData(db, key) {
    return new Promise((resolve, reject) => {
        db.del(key, function(err) {
            if (err) {
                reject(err);
            } 
            else {
                resolve();
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

class ValidatedRequest {
    constructor(validationRequest) {
        this.registerStar = true,
        this.status = validationRequest,
        this.status.messageSignature = 'valid'
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
                if ('status' in validationRequest) {
                    reject('A validated message is active for this address. Please register a star.')
                    return;
                }
                return validationRequest;
            })
            .then((validationRequest) => {
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

    validateRequest(address, signature) {
        return new Promise((resolve, reject) => {
            this.checkAddress(address)
            .then((value) => {
                let validationRequest = JSON.parse(value);
                if ('status' in validationRequest) {
                    validationRequest.message = 'A request has already been validated. Please register a star.';
                    let requestTimestamp = parseInt(validationRequest.status.requestTimestamp);
                    validationRequest.status.validationWindow = Math.round(300 - (new Date() - new Date(requestTimestamp * 1000)) / 1000);
                    resolve(validationRequest);
                    return;
                } 
                return validationRequest;
            })
            .then((validationRequest) => {
                let requestTimestamp = parseInt(validationRequest.requestTimestamp);
                if (new Date() - new Date(requestTimestamp * 1000) > 300000) {
                    delLevelDBData(db, address)
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                return validationRequest;
            })
            .then((validationRequest) => {
                let verified = bitcoinMessage.verify(validationRequest.message, address, signature);
                if (!verified) {
                    reject(`Incorrect signature for message: ${validationRequest.message}`);
                    return;
                }
                return new ValidatedRequest(validationRequest);
            })
            .then((validatedRequest) => {
                let requestTimestamp = parseInt(validatedRequest.status.requestTimestamp);
                validatedRequest.status.validationWindow = Math.round(300 - (new Date() - new Date(requestTimestamp * 1000)) / 1000);
                addLevelDBData(db, address, JSON.stringify(validatedRequest).toString());
                resolve(validatedRequest);
            })
            .catch((err) => {
                if (err.name === 'NotFoundError') {
                    reject('A validation request was not found for this address.')
                } else {
                    reject(err);
                }
            })
        });
    }

    checkEligible(address) {

        return new Promise((resolve, reject) => {

            this.checkAddress(address)
            .then((value) => {

                let validation = JSON.parse(value);
                if (!('registerStar' in validation)) {
                    reject('A valid signature must first be signed');
                    return;
                }
                return validation;
            })
            .then((validation) => {

                let requestTimestamp = parseInt(validation.status.requestTimestamp);
                if (new Date() - new Date(requestTimestamp * 1000) > 300000) {
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                resolve();
            })
            .catch((err) => {
                if (err.name === 'NotFoundError') {
                    reject('A validation request was not found for this address.');
                } else {
                    reject(err);
                }
            })
        });
    }

    removeValidation(address) {

        return new Promise((resolve, reject) => {

            delLevelDBData(db, address)
            .then(() => {

                resolve()
            })
            .catch((err) => {
                
                reject(err);
            })
        });
    }
}

const validations = module.exports = new Validation;

