import User from "../models/user.model.js";
import Post from '../models/post.model.js';
import {v2 as cloudinary} from 'cloudinary';
import Notification from '../models/notification.model.js';

export  const createPost = async(req,res) => {
    cloudinary.config({
    cloud_name : 'dpynmf6k2',
    api_key : '511771528827698',
    api_secret : 'E-YyoiWAy5PNwWGrnmldLu7e4tw',
})
    try {
        const { text } = req.body;
        let { img } = req.body;
        const  userId = req.user._id.toString();
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message : "user not found"});

        if(!text && !img){
            return res.status(400).json({message : "Post must have image or text"});
        }

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img).catch((error)=> console.log(error));
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user : userId,
            text ,
            img
        })

        await newPost.save();
        res.status(200).json(newPost);
        
    } catch (error) {
        console.log("error in post controllers in createPost : " , error.message);
        res.status(500).json({error : "Internal server Error"});
    }
}

export const likeUnlikePost = async(req,res) =>{
    try {
        const userId = req.user._id;
        const {id : postId} = req.params;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "post not found"});
        }

        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            //unlikes
            await Post.updateOne({_id:postId} , {$pull : {likes : userId}});
            await User.updateOne({ _id:userId} , { $pull : {likedPosts : postId}});

            const updatedLikes = post.likes.filter((id) => {id.toString() !== userId.toString()});
            res.status(200).json(updatedLikes);
        }else{
            //like the post
            post.likes.push(userId);
            await User.updateOne({_id:userId} , { $push: {likedPosts : postId}});
            await post.save();

            const notification = new Notification({
                from : userId,
                to:post.user,
                type : "like",
            });
            await notification.save();

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.log("Error in likeUnlike post controller functiom : " , error.message);
        res.status(500).json({ error:"Internal server error"});
    }
}


export const commentPost = async (req,res) =>{
    try {
        const { text } = req.body;
        const postId = req.params._id;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({error:"Text field is required"});
        }
        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).json({ error:"Post not found"});
        }

        const comment = { user : userId , text};
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.log("error in commentPost controller post : " , error.message);
        res.status(500).json({ error:"Internal server error"});
    }
}

export const deletePost = async (req,res) => {
    cloudinary.config({
        cloud_name : 'dpynmf6k2',
        api_key : '511771528827698',
        api_secret : 'E-YyoiWAy5PNwWGrnmldLu7e4tw',
    })
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({ error : "Post Not Found"});
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error :"You are not authorized to delete this post"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        
        res.status(200).json({message:"Post deleted Successfully"});

    } catch (error) {
        console.log("Error in post controller in delete function : " , error.message);
        res.status(500).json({ error: "Internal server Error"});
    }
}


export const getAllPosts = async(req,res) => {
    try {
        const posts = await Post.find().sort({createAt:-1}).populate({
            path:"comment.user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        })

        if(posts.length === 0){
            return res.status(200).json([]);
        }
        // console.log(res);
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllposts in cotrollers : " ,error.message);
        res.status(500).json({error:'Internal server error'});
    }
}


export const getLikedPosts = async(req,res) =>{
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error:"User not found"});

        const likedPosts = await User.find({_id:{$in:user.likedPosts}})
        .populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts controllers" , error.message);
        res.status(500).json({error:"Internal server error"});
    }
}


export const getFollowingPosts = async (req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});

        const following = user.following;

        const feedPosts = await Post.find({user : { $in :following }})
        .sort({createdAt : -1})
        .populate({
            path:"user",
            select:"-password",
        })
        .populate({
            path:"comments.user",
            select:"-password",
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller : " , error.message);
        res.status(500).json({error:'Internal server error'});
    }
}

export const getUserPosts = async (req,res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json( { error:"User not found"});

        const posts = await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:'-password',
        }).populate({
            path:"comments.user",
            select:"-password",
        });

        res.status(200).json(posts);
        
    } catch (error) {
        console.log("error in getUserPosts in controller : " , error.message);
        res.status(500).json({error:'Interval Server error'});
    }
}