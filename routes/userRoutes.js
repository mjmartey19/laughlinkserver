import express from 'express';
import path from 'path';
import { acceptRequest, changePassword, friendRequest, getFriendRequest, getUser, profileViews, requestPasswordReset, resetPassword, suggestedFriends, updateUser, verifyEmail } from '../controllers/userController.js';
import userAuth from '../middleware/authMiddleware.js';


const router = express.Router();
const __dirname = path.resolve(path.dirname("")); //derectory, When the verification is true, we need to return something to the user


 //Verification route
router.get("/verify/:userId/:token", verifyEmail);  

//PASSWORD RESET 
//Hit on this router when a user request to reset password
router.post("/request-passwordreset", requestPasswordReset);  

//Reset password route: Use to verify the uses details and push the form to the user
router.get("/reset-password/:userId/:token", resetPassword); 

//Hit on this route when user fill form and submit
router.post("/reset-password", changePassword);  

//user routes
router.post("/get-user/:id?", userAuth, getUser); //Check whether user is authenticated before u get user. 
router.put("/update-user", userAuth, updateUser); 


//friend request
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request", userAuth, getFriendRequest);

//accept / deny friend request
router.post("/accept-request", userAuth, acceptRequest)

// view profile 
router.post("/profile-view", userAuth, profileViews)

//suggested friends
router.post("/suggested-friends", userAuth, suggestedFriends);




//Verification content for user to verify
router.get('/verified', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/build', 'index.html'))
})

//resetpassword endpoint: Resetpassword content for user to reset password
router.get('/resetpassword', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/build', 'index.html'))
})


export default router