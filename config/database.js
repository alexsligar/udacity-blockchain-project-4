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