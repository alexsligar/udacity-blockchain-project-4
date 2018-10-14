'use strict';

// Add data to levelDB with key/value pair
const addLevelDBData = (db, key, value) => {
	return new Promise((resolve, reject) => {
		db.put(key, value, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
	    });
	});
};

// Add data to levelDB with value
const addDataToLevelDB = (db, value) => {
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
	   		addLevelDBData(db, i, value)
				.then((key) => {
					resolve(key);
				})
				.catch((error) => {
					reject(error);
				});
	   });
	});
};

const getLevelDBData = (db, key) => {
    return new Promise((resolve, reject) => {
        db.get(key, function(err, value) {
            if (value) {
                resolve(value);
            } else {
                reject(err);
            }
        });
    });
};

const delLevelDBData = (db, key) => {
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
};

const Database = { addLevelDBData, addDataToLevelDB, getLevelDBData, delLevelDBData };

module.exports = Database;