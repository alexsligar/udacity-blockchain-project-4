'use strict';

const bitcoinMessage = require('bitcoinjs-message');

/**
 * Interacting with the database
 */
const levelup = require('levelup');
const memdown = require('memdown');
const db = levelup(memdown());
const Database = require('../../config/database');

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
    expired(validationRequest) {
        let timestamp;
        //obtain timestamp based on whether validation has been validated
        if ('status' in validationRequest) {
            timestamp = validationRequest.status.requestTimestamp;
        } else {
            timestamp = validationRequest.requestTimestamp;
        }
        //check if validationWindown has expired
        timestamp = parseInt(timestamp);
        return (new Date() - new Date(timestamp * 1000) > 300000);
    }

    updateValidationWindow(validationRequest) {
        if ('status' in validationRequest) {
            let timestamp = parseInt(validationRequest.status.requestTimestamp);
            validationRequest.status.validationWindow = (
                Math.ceil(300 - (new Date() - new Date(timestamp * 1000)) / 1000)
            );
        } else {
            let timestamp = parseInt(validationRequest.requestTimestamp);
            validationRequest.validationWindow = (
                Math.ceil(300 - (new Date() - new Date(timestamp * 1000)) / 1000)
            );
        }
        return validationRequest;
    }

    checkAddress(address) {
        return new Promise((resolve, reject) => {
            Database.getLevelDBData(db, address)
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
            let newValidation = new ValidationRequest(address);
            Database.addLevelDBData(db, address, JSON.stringify(newValidation).toString())
            .then((key) => {
                resolve(newValidation);
            })
            .catch((err) => {
                reject(err);
            })
            
        })
    }

    addValidationRequest(address) {
        return new Promise((resolve, reject) => {
            this.checkAddress(address)
            .then(JSON.parse)
            .then((validationRequest) => {
                let expired = this.expired(validationRequest);
                if (!expired) {
                    resolve(this.updateValidationWindow(validationRequest));
                    return;
                }
                return this.addRequest(address);
            })
            .then((newValidation) => {
                resolve(newValidation);
                return;
            })
            .catch((err) => {
                if (err.name === 'NotFoundError') {
                    this.addRequest(address)
                    .then((newValidation) => {
                        resolve(newValidation);
                    })
                    .catch((err) => {
                        reject(err);
                    })
                }
                else {
                    reject(err);
                }
            })
        });
    }

    validateRequest(address, signature) {
        return new Promise((resolve, reject) => {
            this.checkAddress(address)
            .then(JSON.parse)
            .then((validationRequest) => {
                if (this.expired(validationRequest)) {
                    Database.delLevelDBData(db, address);
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                return validationRequest;
            })
            .then((validationRequest) => {
                if ('status' in validationRequest) {
                    validationRequest.message = 'A request has already been validated. Please register a star.';
                    resolve(this.updateValidationWindow(validationRequest));
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
                return Database.addLevelDBData(db, address, JSON.stringify(validatedRequest).toString());
            })
            .then(JSON.parse)
            .then(this.updateValidationWindow)
            .then((validatedRequest) => {

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
            .then(JSON.parse)
            .then((validation) => {

                if (!('registerStar' in validation)) {
                    reject('A valid signature must first be signed');
                    return;
                }
                return validation;
            })
            .then((validation) => {

                if (this.expired(validation)) {
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                resolve();
            })
            .catch((err) => {

                if (err.name === 'NotFoundError') {
                    reject('A validation request was not found for this address.');
                }
                else {
                    reject(err);
                }
            })
        });
    }
}

const validations = module.exports = new Validation;

