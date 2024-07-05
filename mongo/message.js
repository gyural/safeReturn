const mongoose = require('mongoose');

const {Schema} = mongoose;
const messageSchema= new Schema({
   sent_time : {
        type : Date,
        required : true,
       
    },
    name : {
        type : String,
    },

    age : {
        type : Number,
        required : true,
    },
    details : {
        type : String,
        required : true,
    }

},{collection : 'safeReturn'});

module.exports = mongoose.model('Message',messageSchema);
