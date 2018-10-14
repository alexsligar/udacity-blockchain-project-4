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
 * Validation class for new requests to add a star
 */
class ValidationRequest {

    constructor(address) {
        this.address = address,
        this.requestTimestamp = new Date().getTime().toString().slice(0,-3),
        this.message = this.address + ':' + this.requestTimestamp + ':' + 'starRegistry',
        this.validationWindow = 300
    }
}

/**
 * ValidatedRequest class for after signature has been verified
 */
class ValidatedRequest {

    constructor(validationRequest) {
        this.registerStar = true,
        this.status = validationRequest,
        this.status.messageSignature = 'valid'
    }
}

/**
 * Singleton class for adding, validating, and
 * confirming eligibility to add a star
 */
class Validation {

    //function for checking if a request to add a star has expired
    expired(validationRequest) {

        let timestamp;
        //obtain timestamp based on whether validationRequest has been validated
        if ('status' in validationRequest) {
            timestamp = validationRequest.status.requestTimestamp;
        } else {
            timestamp = validationRequest.requestTimestamp;
        }
        //check if validationWindown has expired
        timestamp = parseInt(timestamp);
        return (new Date() - new Date(timestamp * 1000) > 300000);
    }

    //return the updated validationWindow on a validation request
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

    //return whether a wallet address has a current validation request
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

    //add a new ValidationRequest to the level db
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

    /**
     * Add a new validation request by ensuring one doesn't exist
     * and if one does, check whether it is expired.
     * If expired issue a new request.
     */
    addValidationRequest(address) {

        return new Promise((resolve, reject) => {

            //check first if a request already exists
            this.checkAddress(address)
            .then(JSON.parse)
            .then((validationRequest) => {

                //check if the request has expired
                let expired = this.expired(validationRequest);
                if (!expired) {
                    //return the updated validationWindow of the non-expired request
                    resolve(this.updateValidationWindow(validationRequest));
                    return;
                }

                //since it was expired, add a new request
                return this.addRequest(address);
            })
            .then((newValidation) => {

                resolve(newValidation);
                return;
            })
            .catch((err) => {

                //check if the error was because there wasn't a request
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

    //validate a message based on the address and signature provided
    validateRequest(address, signature) {

        return new Promise((resolve, reject) => {
            
            //check if a request is in db for the address
            this.checkAddress(address)
            .then(JSON.parse)
            .then((validationRequest) => {

                //confirm request isn't already expired
                if (this.expired(validationRequest)) {
                    Database.delLevelDBData(db, address);
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                return validationRequest;
            })
            .then((validationRequest) => {

                //check if address has already validated the request
                if ('status' in validationRequest) {
                    validationRequest.message = 'A request has already been validated. Please register a star.';
                    resolve(this.updateValidationWindow(validationRequest));
                    return;
                } 
                return validationRequest;
            })
            .then((validationRequest) => {

                //verify the message with signature and address
                let verified = bitcoinMessage.verify(validationRequest.message, address, signature);
                if (!verified) {
                    reject(`Incorrect signature for message: ${validationRequest.message}`);
                    return;
                }
                return new ValidatedRequest(validationRequest);
            })
            .then((validatedRequest) => {

                //add the new validated request to the db as signature was verified
                return Database.addLevelDBData(db, address, JSON.stringify(validatedRequest).toString());
            })
            .then(JSON.parse)
            .then(this.updateValidationWindow)
            .then((validatedRequest) => {

                //resolve the verified message with updated validationWindow
                resolve(validatedRequest);
            })
            .catch((err) => {

                //let the user know if a request wasn't found
                if (err.name === 'NotFoundError') {
                    reject('A validation request was not found for this address.')
                } else {
                    reject(err);
                }
            })
        });
    }

    //check that the address has eligibility to add a new star
    checkEligible(address) {

        return new Promise((resolve, reject) => {

            this.checkAddress(address)
            .then(JSON.parse)
            .then((validation) => {

                //make sure the address has validated a message
                if (!('registerStar' in validation)) {
                    reject('A valid signature must first be signed');
                    return;
                }
                return validation;
            })
            .then((validation) => {

                //then double check that request hasn't already expired
                if (this.expired(validation)) {
                    reject('This request has expired. Please request a new validation message.');
                    return;
                }
                resolve();
            })
            .catch((err) => {

                //let the user know if a request doesn't exist for the address
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

