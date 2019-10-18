const SignUpModel = require('./signupdata')
const Comment = require('./comment');

const commentModel = require('./commentschema')

const PostModel = require('./postModel')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
//  const userData = require('./')
const {SECRET} = require('../config/config')
// const commentSchema = require('./commentschema')
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
            jwt.sign({userToken: checkUser[0]._id},SECRET,{ expiresIn: 30},(err,token)=>{
                return res.status(200).send({msg:'Login Successful',token: token})
            })
        }
        else{
            return res.status(400).send({msg:'Incorrect Login Credentials'})
        }
    }
}

const particularUserData  = async(req,res)=>{
    try{
        debugger
        // console.log(req.query._id)
        let fetchId = await PostModel.findOne({_id: req.query._id})
        console.log(fetchId)
            if(fetchId.length!=0){
            return res.status(200).send(fetchId.data);
    }
    
        }catch(error){
            return res.status(200).send({message: 'No Posts exist for this user'})
        }
        
}


const getAllPosts = async(req,res)=>{
        try{
            const response = await PostModel.find()
            return response
        }catch(error){

        }
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
    console.log("hello")
    try{
        req.body.userId = req.headers.tokenValue;
        let post = await PostModel.find({userId:req.body.userId});
        console.log(post);


    if ( post.length != 0 ){

        await PostModel.findOneAndUpdate({
            userId: req.headers.tokenValue
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
            msg:'new user post added'
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
    let comment = await commentModel.find({userid:req.body.userid});
    //console.log(comment);
    if ( comment.length != 0 ){
        console.log(req.body)
        const status = await commentModel.findOneAndUpdate({
            userid:req.body.userid,
        },
        {
            $push:{
                comments:req.body.comments
            }
        });
        return {
            'status':200,
            'msg':'multiple comments added'
        }

    }
    else
    {
        let commentData = new commentModel(req.body);
        await commentData.save();
        return {
            'status':200,
            'msg':'new comment added'
            }
        }
    
    }catch(err){
        return {
            'status':404,
            'msg':'something went wrong',
            'error':err
        }
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
const updatePassword = async(req ,res )=>{
    //console.log("hello")
    try{
        let userId = await SignUpModel.findOne({ _id : "5da43b1a5375b43a4429cec1"})
        oldp = req.body.oldPwd
        console.log(oldp)
        newPassword = req.body.newPassword
        console.log(newPassword)
        console.log(userId)
        let hashedPwd = userId.Password
        let status = bcryptjs.compareSync(oldp,hashedPwd)
        console.log(status)
        if(status){
            await SignUpModel.findByIdAndUpdate({
                _id : "5da447225375b43a4429cec21"
            },
            {
                $set:{
                "Password" : newPassword
                }
            }
            );    
        }
    }
    catch(error){
        console.log(error)
    }
}
const updateUsername = async(req , res )=>{
    try{
        //console.log("welcome to user.updateusername")
        let userId = await SignUpModel.findOneAndUpdate({ _id : "5da43b1a5375b43a4429cec1"})
        oldEmail = req.body.existUname
        //console.log(oldEmail)
        newEmail = req.body.newUname
       // console.log(newEmail)
        let checkEmailExistence1 = await SignUpModel.find({Email:newEmail})
        if(checkEmailExistence1 == null){
            let checkEmailExistence = await SignUpModel.find({Email:oldEmail})
            //console.log(checkEmailExistence)
            
                await SignUpModel.findOneAndUpdate({
                    Email : oldEmail
                },
                {
                    $set:{
                        "Email" : newEmail
                    }
                });
                res.send({
                    status:200,
                    msg:'Email Updated'
                })
            
        }
        else{
            return res.send({
                status:409,
                msg:'edit conflict as the username already exists'
            })
        }
    }
        catch(error){
            console.log(error)
        }
        
       
}

module.exports = {
    saveSignUpData,
    loginUser,
    particularUserData,
    getAllPosts,
    checkUserToken,
    saveUserPost,
    userComment,
    getComments,
    updatePassword,
    updateUsername
}