import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateTokenSetCookie } from '../lib/utils/generateToken.js';

export const signup = async (req,res)=>{
    try {
        const { fullname , username , email , password } = req.body;

        const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            console.log(email);
            console.log(emailRegex.test(email));
            return res.status(400).json({error : "Invalid email format"});
        }

        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error : "username is already taken"});
        }

        const existingEmail = await User.findOne({ email });
        if(existingEmail){
            return res.status(400).json({error : "Email is already taken"});
        }

        if(password.length < 6){
            return res.status(400).json({error : "password must be at least 6 character long"});
        }

        //1234566
        //hashpassword
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);

        const newUser = new User({
            fullname , 
            username ,
            email,
            password : hashedPassword
        })

        if(newUser){
            generateTokenSetCookie(newUser._id , res);
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullname : newUser.fullname,
                username : newUser.username,
                email : newUser.email,
                followers : newUser.followers,
                following : newUser.following,
                profileImg : newUser.profileImg,
                coverImg : newUser.coverImg,
            })
        }else{
            res.status(400).json({ error:"invalid user data " });
        }

        
    } catch (error) {
        console.log("error in signup controllers" , error.message);
        res.status(500).json({ error: "internal server error"});
    }
}

export const login = async (req,res)=>{
    try {
        const { username , password } = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password , user?.password || ""); 
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"invalid username or password"});
        }

        generateTokenSetCookie(user._id , res);

        res.status(201).json({
            _id : user._id,
            fullname : user.fullname,
            username : user.username,
            email : user.email,
            followers : user.followers,
            following : user.following,
            profileImg : user.profileImg,
            coverImg : user.coverImg,
        });

    } catch (error) {
        console.log("error in login controllers" , error.message);
        res.status(500).json({ error: "internal server error"});
    }
}

export const logout = async (req,res)=>{
    try {
        res.cookie("jwt","" ,{maxAge:0})
        res.status(200).json({message : "Logged out successfully"});
    } catch (error) {
        console.log("error in logout controllers" , error.message);
        res.status(500).json({error : 'Internal server error'});
    }
}

export const getMe = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller" , error.message);
        res.status(500).json({error:"Internal server error"});
    }
}