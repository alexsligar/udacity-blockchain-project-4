/**
 * Interacting with the database
 */
const level = require('level-mem');
const db = level();
const dbFunctions = require('./database');

/**
 * ValidationRequest class
 */
class ValidationRequest {
    constructor(address) {
        this.address = address,
        this.requestTimestamp = new Date().getTime().toString().slice(0,-3),
        this.message = this.address + ':' + this.requestTimestamp + ':' + 'starRegistry',
        this.validationWindow = 300
    }
}

const checkAddress = (address) => {
    return new Promise((resolve, reject) => {
        getLevelDBData(db, address)
        .then((value) => {
            resolve(value);
        })
        .catch((err) => {
            console.log(err);
            reject(err);
        })
    });
}

const addRequest = (address) => {
    return new Promise((resolve, reject) => {
        //check if address already has request
        this.checkAddress(address)
        .then((value) => {
            //check if it has been more than 300 seconds
            let validationRequest = JSON.parse(value);
            let requestTimestamp = parseInt(validationRequest.requestTimestamp);
            if (new Date() - new Date(requestTimestamp * 1000) > 300000) {
                //create new request and add it in place of old one
                newValidationRequest = new ValidationRequest(address);
                addLevelDBData(db, address, JSON.stringify(newValidationRequest).toString());
                resolve(newValidationRequest);
            } else {
                resolve(value);
            }
        })
        .catch((err) => {
            if (err.name === 'NotFoundError') {
                newValidationRequest = new ValidationRequest(address);
                addLevelDBData(db, address, JSON.stringify(newValidationRequest).toString());
                resolve(newValidationRequest);
            } else {
                reject(err);
            }
        });
    });
}

