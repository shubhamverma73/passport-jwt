let mongoose = require('mongoose');

let connect = mongoose.connect('mongodb://127.0.0.1:27017/passport-jwt', {
}).then(() => {
    console.log('Connected to database.');
}).catch(err => {
    console.log('Error: ' + err);
});
exports.mongoConnect = connect


// ======== Mongo DB Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    refreshToken: String,
});
exports.Users = mongoose.model('Users', userSchema);