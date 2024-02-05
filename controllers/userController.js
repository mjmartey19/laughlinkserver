//Verify Email
import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import Users from '../models/user.js'
import PasswordReset from "../models/passwordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

//VeryEmail
export const verifyEmail = async (req, res ) => {
    const { userId, token } = req.params; //get UserId and token from URLS

    try{
        const result = await Verification.findOne({ userId }) //Await the process, ones it is done
        //Check whether token has expired or not
        if(result){
            const {expiresAt, token: hashedToken} = result;
            //token has expires
            if(expiresAt < Date.now()){
                Verification.findOneAndDelete({ userId })//delete if expire
                .then(() => {
                    Users.findOneAndDelete({ _id: userId })//delete user
                        .then(() => {
                            const message = "Verification token has expired.";
                            res.redirect(
                                `/users/verified?status=error&message=${message}`
                            );//Redirect user to html file with a status error & message
                        }).catch((err) => {
                            res.redirect(`/users/verified?status=error&message=`)
                        });
                         
                }).catch((err) => {
                    console.log(err);
                    res.redirect(`/users/verified?status=error&message=`)
                })
            }else{
                //token valid. i.e, it hasn't expired
                compareString(token, hashedToken).then((isMatch) => {
                    if(isMatch){
                        Users.findOneAndUpdate({ _id: userId }, { verified: true }).then(() => {
                            Verification.findOneAndDelete({ userId }).then(() => {//delete data from verification model 
                                const message = 'Email verified successfully';
                                res.redirect(
                                    `/users/verified?status=success&message=${message}`
                                );
                            });
                        }).catch((err) => {
                            console.log(err);
                            const message = 'Verification failed or link is invalid';
                            res.redirect(
                                `/users/verified?status=error&message=${message}`
                            );
                        })
                    }else{
                        //invalid token
                        const message = 'Verification failed or link is invalid';
                        res.redirect(
                            `/users/verified?status=error&message=${message}`
                        );
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect(`/users/verified?message=`);
                });

            }
        }else{
            const message = 'Invalid verification link. Try again later.';
            res.redirect(
                `/users/verified?status=error&message=${message}`
            );
        }

    }catch (err){
        res.redirect(
            `/users/verified?message=`
        );
    }


}

//  Request password reset for a user.
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user with given email exists
    const user = await Users.findOne({ email: { $regex: new RegExp(email, 'i') } }); //


    if (!user) {
      // If user doesn't exist, return error response
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    // Check if there is an existing password reset request for the user
    const existingRequest = await PasswordReset.findOne({ email: { $regex: new RegExp(email, 'i') } });
    if (existingRequest) {
      // If a request exists and it hasn't expired, return pending response
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent to your email.",
        });
      }
      // If a request exists but has expired, delete it
      await PasswordReset.findOneAndDelete({ email: { $regex: new RegExp(email, 'i') } });
    }
    
    // Generate and send password reset link to user
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//Reset password
export const resetPassword = async (req, res) => {
    const { userId, token } = req.params;
  
    try {
      // find record
      const user = await Users.findById(userId);
  
      if (!user) {
        const message = "Invalid password reset link. Try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      }
  
      const resetPassword = await PasswordReset.findOne({ userId });
  
      if (!resetPassword) {
        const message = "Invalid password reset link. Try again";
        return res.redirect(
          `/users/resetpassword?status=error&message=${message}`
        );
      }
  
      const { expiresAt, token: resetToken } = resetPassword;
  
      if (expiresAt < Date.now()) {
        const message = "Reset Password link has expired. Please try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      } else {
        const isMatch = await compareString(token, resetToken);
  
        if (!isMatch) {
          const message = "Invalid reset password link. Please try again";
          res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
          res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
        }
      }
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: error.message });
    }
  };

  //Change Password
 export const changePassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hashString(password);

    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        ok: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
  
//Get User
export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

//Update User
export const updateUser = async (req, res, next ) => {
   try {
    //get field from body
    const { firstName, lastName, location, profileUrl, profession } = req.body;


    //Check if any of the field is empty
    if(!(firstName || lastName || contact || profession || location)) {
      next("Please provide all required fields");
    }

    const {userId } = req.body.user

    //Create a new object of the user
    const updateUser = {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      _id: userId,
    };

    const user = await Users.findByIdAndUpdate( userId, updateUser, {
      new: true, //If new fields are added, create them
    });

    await user.populate( { path: "friends", select: "-password" });
    
    const token = createJWT(user?._id);

    user.password = undefined;

    res.status(200).json({ //Send user back to frontend
      success:true,
      message: "User updated successfully",
      user,
      token,

    })


   } catch(error) {
    console.log(error);
    res.status(404).json({ message: error.message })
   }
}

//Friend Request
export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend Request already sent.");
      return;
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request already sent.");
      return;
    }

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      message: "Friend Request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

//Get Friend Request
export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;
    // console.log("UserID:", userId);

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(10)
      .sort({
        _id: -1,
      });
    console.log(request)
    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

//Accept or Deny request
export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId; 

    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if(!requestExist) {
      next("No Friend Request Found.");
      return;
    }

    //Find and update request
    const newRes = await FriendRequest.findByIdAndUpdate(
      {_id: rid},
      {requestStatus: status }
    );
  //  console.log(newRes);
    if(status === "Accepted"){
      //Find the user accepting or denying request
      const user = await Users.findById(id);

      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);
      console.log(friend)
      friend.friends.push(newRes?.requestTo);  

      await friend.save();

    }
    
    res.status(201).json({
      success: true,
      message: "Friend Request " + status
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    })
  }
}

//Profile Views
export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;

    const user = await Users.findById(id);

    //Push user id to views
    user.views.push(userId);


    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    })

   }catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    })
  }
}

//Suggested Friends
export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    let queryObject = {};

    //Don't fetch your friends data
    queryObject._id = { $ne: userId };

    //Don't fetch your own data
    queryObject.friends = { $nin: userId };

    let queryResult = Users.find(queryObject)
        .limit(15)
        .select("firstName lastName profileUrl profession -password");

        const suggestedFriends = await queryResult;

        res.status(200).json({
          success: true,
          data: suggestedFriends,
        });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    })
  }
}