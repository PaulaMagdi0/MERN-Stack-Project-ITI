const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const verfocationTokensSchema = new mongoose.Schema({
   owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User' ,
    required:true
   },
   token:{
    type:String ,
    required:true
   },
   createdAt:{
    type:Date,
    // expires:3600,
    default:Date.now()
   }
}, { timestamps: true });

verfocationTokensSchema.pre("save" , async function (next) {
    if(this.isModified("token")){
        const hash = await bcrypt.hash(this.token , 8);
        this.token = hash
    }
    next();
    
})

verfocationTokensSchema.methods.compareToken = async function (enteredToken) {
    return await bcrypt.compare(enteredToken, this.token);
};

const VerifyToken = mongoose.model('VerifyToken', verfocationTokensSchema);
module.exports = VerifyToken;

