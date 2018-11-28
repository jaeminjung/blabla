const monk = require('monk')
const db = monk('mongodb://fkden:but0220@ds159563.mlab.com:59563/findseat-db')
db.then(()=>{
    console.log('connected to db')
}).catch(error => {
    console.log(error)
})


// const mongoose = require('mongoose')
// mongoose.connect('mongodb://fkden:but0220@ds159563.mlab.com:59563/findseat-db')
// const db = mongoose.connection

// const ObjectId = mongoose.Types.ObjectId;
// ObjectId.prototype.valueOf = function () {
// 	return this.toString();
// };

module.exports = db