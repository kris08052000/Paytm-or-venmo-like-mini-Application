const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:TzgGFaFXSOFt4nLJ@cluster0.gs2h7kd.mongodb.net/")

const userschema =  new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String
})

const accountschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    balance: {
        type: Number,
        required : true
    }
});

const Account = mongoose.model('Account', accountschema)
const User = mongoose.model('User', userschema);

module.exports = {
    User,
    Account
};