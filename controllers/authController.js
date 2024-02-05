import Users from "../models/user.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
    const { //Destructure info from body request
        firstName,
        lastName,
        email,
        password
    } = req.body;

    //Check for invalid fields
    if(!(firstName || email || password)){
        next("Provide Required Fields!");
        return
    }

    try {
        const userExist = await Users.findOne( { email })//Check if user exists.

        if(userExist){//If exist let middleware handle it.
            next("Email Address already exists");//Send message to user
            return;
        }
        //If it doesn't exist add to database
        //Encripted password
        const hashedPassword = await hashString(password);

        //Create new user
        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        //Send email verification to user
        sendVerificationEmail(user, res);



    }catch(err){
        console.log(err);
        res.status(404).json({message: err.message});
    }
   
}

export const login = async (req, res, next) => {
    const { email, password} = req.body;

    try {

        //Valideation
        if(!email || !password){
            next("Please Provide User Credentials");
            return;
        }
            //Find user by email
            const user = await Users.findOne({ email }).select("+password").populate({
                path: "friends",
                select: "firstName lastName location profileUrl -password",
            });

            if(!user){
                next("Invalid email or password");
                return;
            }

            //Check whether user is verified
            if(!user?.verified){
                next(
                    "User email is not verified. Check your email account and verify your email"
                );
                return;
            }

        //Comapare password
        const isMatch = await compareString(password, user?.password)
        
        if(!isMatch){
            next("Invalid email or password");
            return;
        }
  
        //If Email and password is valid
        user.password = undefined; //We don't want to send the password to the frontend
        const token = createJWT(user?._id);

        //Send feedback to frontend
        res.status(201).json({
            success: true,
            message: "Login successfully",
            user,
            token,
        });
        
    } catch(err) {
        console.log(err);
        res.status(404).json({ message: err.message });
    }

   
};