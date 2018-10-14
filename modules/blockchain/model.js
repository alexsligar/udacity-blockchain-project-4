'use strict';

/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== LevelDB Setup ==========================
|  Add LevelDB dependencies and functions        |
|    adding to the DB                   		 |
|  ===============================================*/

const level = require('level');
const chainDB = './chaindata';
const Database = require('../../config/database');
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data) {
  	    this.hash = "",
        this.height = 0,
        this.body = this.encodeStarStory(data),
        this.time = 0,
        this.previousBlockHash = ""
	}
	
	encodeStarStory(data) {

		if (data.star && 'story' in data.star) {
			data.star.story = new Buffer(data.star.story).toString('hex');
		}
		return data;
	}
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{

	//Check if blockchain exists or add new genesis block
	getChain() {
        return new Promise((resolve,reject) => {
            Database.getLevelDBHeight(db)
            .then((height) => {
                if(height > 0) {
                    resolve(true);
                } else {
                    this.addGenesisBlock()
                    .then(() => {
                        console.log('Blockchain empty. Added genesis block');
                        resolve(true);
                    });
                }
            })
            .catch((err) => {
                reject(err);
            });
        });
	}

	//add genesis block to a new blockchain
	addGenesisBlock() {
        return new Promise((resolve, reject) => {
			let genesisBlock = new Block('Genesis Block');
            genesisBlock.time = new Date().getTime().toString().slice(0,-3);
            genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
            Database.addDataToLevelDB(db, JSON.stringify(genesisBlock).toString())
            .then((key) => {
                resolve(key);
            })
            .catch((err) => {
                reject(err);
            });
        });
	}

    // Add new block
    addBlock(address, star){
		return new Promise((resolve, reject) => {
            let newBlock = new Block({address, star});
	        // Block height
	        Database.getLevelDBHeight(db)
			.then((height) => {
				//check if genesis block exists before adding new block
				if (height === 0) {
					this.addGenesisBlock();
					height++;
				}
				newBlock.height = height;
				return Database.getLevelDBData(db, height - 1);
			})
			.then((previousBlock) => {
				//user previousBlock to set previousBlockHash
				newBlock.previousBlockHash = JSON.parse(previousBlock).hash;
				// UTC timestamp
				newBlock.time = new Date().getTime().toString().slice(0,-3);
				// Block hash with SHA256 using newBlock and converting to a string
		        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
		        // Adding block object to chain
		  	    return Database.addDataToLevelDB(db, JSON.stringify(newBlock).toString())
			})
            .then((block) => {
                // return new block to caller
                resolve(block);
            })
			.catch((err) => {
				reject(err);
			});
		});
    }

    // get block based on height
    getBlock(blockHeight) {
		return new Promise((resolve, reject) => {
			Database.getLevelDBData(db, blockHeight)
			.then(JSON.parse)
			.then((block) => {

				if (block.body && block.body.star && 'story' in block.body.star) {
					block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'hex').toString();
				}
				resolve(block);
			})
			.catch((err) => {

				reject(err);
			})
		});
	}

	//get block based on hash
	getHash(hash) {

		return new Promise((resolve, reject) => {

			Database.getLevelDBHeight(db)
			.then(async (height) => {

				for (let i = 0; i < height; i++) {

					let block = await this.getBlock(i);
					if (block.hash === hash) {
						resolve(block);
						return;
					}
				};
				resolve({});
			})
			.catch((err) => {

				reject(err);
			})
		});
	}
	
	//get all stars for a specific wallet address
	getStars(address) {

		return new Promise((resolve, reject) => {

			let allBlocks = [];
			Database.getLevelDBHeight(db)
			.then(async (height) => {

				for (let i = 0; i < height; i++) {

					let block = await this.getBlock(i);
					if (block.body && block.body.address && block.body.address === address) {
						allBlocks.push(block);
					} 
				};
				resolve(allBlocks);
			})
			.catch((err) => {

				reject(err);
			})
		});
	}

    // validate block
    validateBlock(blockHeight) {

		return new Promise((resolve, reject) => {
			// get block object
			Database.getLevelDBData(db, blockHeight)
			.then((blockRaw) => {
				let block = JSON.parse(blockRaw);
				// get block hash
				let blockHash = block.hash;
				// remove block hash to test block integrity
				block.hash = '';
				// generate block hash
				let validBlockHash = SHA256(JSON.stringify(block)).toString();

				// Compare
		    if (blockHash === validBlockHash) {
		      resolve(true);
		    } else {
		      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
		      resolve(false);
		    }
			})
			.catch((error) => {
				console.log('Unable to validate block: ' + error);
			});
		});
    }

	//check if next block has correct hash in previousBlockHash
	validateBlockLink(blockHeight) {
		return new Promise((resolve, reject) => {
			let gatherBlocks = [];
			gatherBlocks.push(Database.getLevelDBData(db, blockHeight));
			gatherBlocks.push(Database.getLevelDBData(db, blockHeight + 1));
			Promise.all(gatherBlocks)
			.then((blocks) => {
				let firstBlockHash = JSON.parse(blocks[0]).hash;
				let secondBlockLink = JSON.parse(blocks[1]).previousBlockHash;
				if (firstBlockHash === secondBlockLink) {
					resolve(true);
				} else {
					resolve(false);
				}
			})
			.catch((error) => {
				console.log('Unable to validate block link: ' + error);
			})
		});
	}

	//validate each block hash and each link in chain
	validateChain() {
		return new Promise((resolve, reject) => {
			let all_validations = [];
			Database.getLevelDBHeight(db)
			.then((height) => {
				for(let i = 0; i < height; i++) {
					all_validations.push(this.validateBlock(i));
				}
				for(let i = 0; i < height - 1; i++) {
					all_validations.push(this.validateBlockLink(i));
				}
				Promise.all(all_validations)
				.then((results) => {
					let errorLog = [];
					for(let i = 0; i < results.length; i++) {
						if(!results[i]) {
							errorLog.push(i)
						}
					}
					if(errorLog.length === 0) {
						resolve(true);
					} else {
						console.log('Block errors = ' + errorLog.length);
						resolve(false);
					}
				});
			});
		});
	}
}

const blockchain = module.exports = new Blockchain;