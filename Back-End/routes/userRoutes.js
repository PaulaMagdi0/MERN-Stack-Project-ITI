const router = require("express").Router();
const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authenticationToken} = require("./authRoutes");

// //signup
router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password, address, phone, dateOfBirth } = req.body;
        //check username length greater than 4 
        if (username.length < 4) {
            return res.status(400).json({ message: "user name should greater than 4 !" });
        }
        //check user name is alreafy exist 
        const existusername = await user.findOne({ username: username });
        if (existusername) {
            return res.status(400).json({ message: "user name already exist !" });
        }
        //check email is alreafy exist 
        const existemail = await user.findOne({ email: email });
        if (existemail) {
            return res.status(400).json({ message: "Email already exist !" });
        }
        //check password lenght 
        if (password.length <= 5) {
            return res.status(400).json({ message: "password length should greater than 5 !" });
        }
        const hashedpass = await bcrypt.hash(password, 10);
        //check password lenght 
        if (phone.length <= 11) {
            return res.status(400).json({ message: "phone length should greater than 11 !" });
        }
        let role = "user";
        if (email === "admin@gmail.com") {
            role = "admin";
        }
        const newuser = new user({
            username: username,
            email: email,
            password: hashedpass,
            address: address,
            phone: phone,
            dateOfBirth: dateOfBirth,
            role: role
        });
        await newuser.save();
        return res.status(200).json({ message: "Signup seccesfully !" })


    } catch (error) {
        console.log("Error during signup:", error);
        res.status(500).json({ message: "Internel servel error" })
    }
})

//sigin
router.post("/sign-in", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existuser = await user.findOne({ username });
        if (!existuser) {
            res.status(400).json({ message: "Invalide credentials!" });
        }
        await bcrypt.compare(password, existuser.password, (err, data) => {
            if (data) {
                const authclamis = [{ name: existuser.username }, { role: existuser.role }]
                const token = jwt.sign({ authclamis }, "bookstore123", { expiresIn: "30d" , });
                res.status(200).json({ id: existuser._id, role: existuser.role, token: token });
            } else {
                res.status(400).json({ message: "Invalide credentials!" })
            }

        })

    } catch (error) {
        console.log("Error during signup:", error);
        res.status(500).json({ message: "Internel servel error" })
    }
})

//get-user-information
router.get("/get-user-info" ,authenticationToken ,  async (req , res)=>{
    try{
        const {id} =req.headers;
        const data = await user.findById(id).select("-password");
        return res.status(200).json(data);
    }catch(error){
        res.status(500).json({ message: "Internel servel error" });
    }
});
//update profile 
router.put("/update-profile" ,authenticationToken ,  async (req , res)=>{
   try{
    const {id} =req.headers;
    const updateData = {};

    const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    }
    //check if there is data in update
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No data provided for update" });
    }
    if (updateData.username && updateData.username.length < 4) {
        return res.status(400).json({ message: "Username should be at least 4 characters long!" });
    }
    if (updateData.username) {
        const existUsername = await user.findOne({ username: updateData.username });
        if (existUsername && existUsername._id.toString() !== id) {
            return res.status(400).json({ message: "Username already exists!" });
        }
    }
    if (updateData.email) {
        const existEmail = await user.findOne({ email: updateData.email });
        if (existEmail && existEmail._id.toString() !== id) {
            return res.status(400).json({ message: "Email already exists!" });
        }
    }
    const updatedUser = await user.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json({ message: "Profile updated successfully!", updatedUser });
    }catch(error){
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internel servel error"});
   }
});
module.exports = router