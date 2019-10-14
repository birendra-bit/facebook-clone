const SignUpModel = require('./signupdata')
const Comment = require('./comment');
const PostModel = require('./postModel')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {SECRET} = require('../config/config')

const saveSignUpData  = async(req,res,data)=>{
    let existingUser
    let modeldata = new SignUpModel(data)
    existingUser = await SignUpModel.find({Email: data.Email})
    if(existingUser.length == 0){
        response = await modeldata.save()
        return res.status(200).send({msg:'User saved Successfully'})
    }
    else{
        return res.status(400).send({msg:'User already Existed'})
    }   
}

const loginUser = async(req,res)=>{
    let checkUser = await SignUpModel.find({Email: req.body.Email})
    if(checkUser.length != 0){
        let password = checkUser[0].Password
        let status = bcryptjs.compareSync(req.body.Password,password)
        if(status){
            jwt.sign({userToken: checkUser[0]._id},SECRET, (err,token)=>{
                return res.status(200).send({msg:'Login Successful',token: token})
            })
        }
        else{
            return res.status(400).send({msg:'Incorrect Login Credentials'})
        }
    }
}

const getAllPosts = async(req,res)=>{
    try{
        const data = await PostModel.find()
        return data;
    }catch(error){}
}

const checkUserToken = async(req,res)=>{
    jwt.verify(req.headers.token,SECRET,(err,authData)=>{
        if(err){
            return res.status(403).send({'msg':'Invalid Token'})
        }
        return res.status(200).send({'msg':'Valid Token'})
    })
}
const saveUserPost = async( req, res )=>{
    try{
        req.body.userId = req.headers.tokenValue;
        console.log(req.body.userId);
    let post = await PostModel.find({userId:req.body.userId});
    console.log(post);

    if ( post.length != 0 ){

        await PostModel.findOneAndUpdate({
            userId:req.body.userId
        },
        {
            $push:{
                posts:req.body.posts
            }
        });

        return {
            status:200,
            msg:'post added'
        }

    }
    else
    {
        let postData = new PostModel(req.body);
        await postData.save();
        return {
            status:200,
            msg:'post added'
            }
        }
    
    }catch(err){
        return {
            status:404,
            msg:'something went wrong',
            error:err
        }
    }
}
const userComment = async( req , res ) =>{

    try{
        let comment = new Comment(req.body);
        await comment.save();
        return {
            status:200,
            statusText:'OK',
            msg :'comments saved successfully'
        }
    }catch(err){
        console.log(err)
    }

}
const getComments = async(req , res )=>{
    try{
        let data = await Comment.find();
        return data;
    }
    catch( error ){
        console.log(error)
    }
}
module.exports = {
    saveSignUpData,
    loginUser,
    checkUserToken,
    saveUserPost,
    userComment,
    getComments,
    getAllPosts
}