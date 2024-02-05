// Now let's create route for register and login.
// Now let's create a route folder,
// Inside it we create a authRoutes.js file
// Inside it we perform the various routes, i.e we create our endpoints

// import express from 'express'

// const router = express.Router();

// Ones our router is created, we can now have our endpoint
// // ENDPOINTS
// router.post("/register", register); //Post requst, endpoint register
// router.post("/login", login); //Post requst, endpoint login

// After we export for it to be use.

// Inside the routes folder we create index.js, where we use the endpoint we create,
// index.js
// -------------- 
// import express from 'router';
// import authRoute from './authRoutes.js'

// const router = express.Router();

// router.use(`/auth`, authRoute); //localhost:8800/auth/register

// export default router; 

// We now export it to the server index to be use as well
// app.use(router);

// Next is to test it using postman
// POSTMAN is one of the most used tool for testing API.Postman software which will help you to test different API. How to send GET, POST, PUT, DELETE requests, how to use query parameters, how to send files for testing and a lot of things.

// In posman we create socialmedia collection, after that we create register and login request.
// Inside the body tab, we create our register object for register request, and pass the register api or endpoint, locahost:8800/auth/register, to make reques, do the same thing for the rest.

// Next is to create endpoint for verifying email.

// ENDPOINT FOR SENDING MAIL
// --------------------------
// Inside the route folder, we create userRoutes.js file
// Inside it, we import:
// import express from 'express';
// import path from 'path';

// We don't have path dependency so we install it
// npm i path.

// So now we have to create a path
// const router = express.Router();
// const __dirname = path.resolve(path.dirname("")); //derectory, When the verification is true, we need to return something to the user.

// We have to verify token for verification, we need to create a route for that as well.
// We first need one route
// router.get("/verify/:userId/:token", verifyEmail); //get route when we send email verification

// We create a userController in the controller folder, in there we verify Email

//  /export const verifyEmail = async (req, res ) => {
//     const { userId, token } = req.params; //get UserId and token from URLS

//     try{
//         const result = await Verification.findOne({ userId }) //Await the process, ones it is done
//         //Check whether token has expired or not
//         if(result){
//             const {expiresAt, token: hashedToken} = result;
//             //token has expires
//             if(expiresAt < Date.now()){
//                 Verification.findOneAndDelete({ userId })//delete if expire
//                 .then(() => {
//                     Users.findOneAndDelete({ _id: userId })//delete user
//                         .then(() => {
//                             const message = "Verification token has expired.";
//                             res.redirect(
//                                 `/user/verified?status=error&message=${message}`
//                             );//Redirect user to html file with a status error & message
//                         }).catch((err) => {
//                             res.redirect(`/user/verified?status=error&message=`)
//                         });
                         
//                 }).catch((err) => {
//                     console.log(err);
//                     res.redirect(`/user/verified?status=error&message=`)
//                 })
//             }else{
//                 //token valid. i.e, it hasn't expired
//                 compareString(token, hashedToken).then((isMatch) => {
//                     if(isMatch){
//                         Users.findOneAndUpdate({ _id: userId }, { verified: true }).then(() => {
//                             Verification.findOneDelete({ userId }).then(() => {//delete data from verification model 
//                                 const message = 'Email verified successfully';
//                                 res.redirect(
//                                     `/users/verified?status=success&message=${message}`
//                                 );
//                             });
//                         }).catch((err) => {
//                             console.log(err);
//                             const message = 'Verification failed or link is invalid';
//                             res.redirect(
//                                 `/users/verified?status=error&message=${message}`
//                             );
//                         })
//                     }else{
//                         //invalid token
//                         const message = 'Verification failed or link is invalid';
//                         res.redirect(
//                             `/users/verified?status=error&message=${message}`
//                         );
//                     }
//                 })
//                 .catch((err) => {
//                     console.log(err);
//                     res.redirect(`/user/verified?status=error&message=`);
//                 });

//             }
//         }else{
//             const message = 'Invalid verification link. Try again later.';
//             res.redirect(
//                 `/users/verified?status=error&message=${message}`
//             );
//         }

//     }catch (err){
//         res.redirect(
//             `/users/verified?message=`
//         );
//     }


// }

// Users.findOneAndUpdate(
//     { _id: userId }, // This is the filter criteria to find the document you want to update. It filters based on the _id field matching the userId variable.
//     { verified: true } // This is the update operation. It sets the 'verified' field of the matched document to true.
//   );

//   Now we're done with the Email verification

//   Next we move to userRoutes and import the verifyimport { request } from 'http'
//  mail.
//   Anything that happens at the stage we redirect the user to `/users/verified?....`

//   Next is to create the endpoint for the verifications

//   But that one will be a get request:
//   router.get('/verified', (req, res) => {
//     res.sendFile(path.join(__dirname, '/views/verifiedpage.html'))
// }) //We will redirect the user to /verified.
// We will send the user to a particular path we are going to create named __dirname '/views/verifiedpage.html'.at
// Next is to create views folder insider the server

// So we will do some view changes to our server index.js file.
// Inside it, we import:
// import path from 'path'
// import { request } from 'http'
// After that, we include
// const __dirname = path.resolve(path.dirname(""));
// and app.use(express.static(path.join(__dirname, 'views/build')));

// Next we create a route to reset password.


//  //Verification route
//  router.get("/verify/:userId/:token", verifyEmail);  

//  //PASSWORD RESET 
//  //Hit on this router when a user request to reset password
//  router.post("/request-passwordreset", requestPasswordReset);  
 
//  //Reset password route: Use to verify the uses details and push the form to the user
//  router.get("/reset-password/:userId/:token", resetPassword); 
 
//  //Hit on this route when user fill form and submit
//  router.post("/reset-password", changePassword);  

//  router.get('/resetpassword', (req, res) => {
//     res.sendFile(path.join(__dirname, '/views/build', 'index.html'))
// })


// //After the reset password
// We work on get user and update. We include the auth middleware to handle errors
// After that, We include
// //user routes
// router.post("/get-user/:id?", userAuth, getUser); //Check whether user is authenticated before u get user. :id? - the question mark means it's optional. e.g if I try checking my profile it won't exist.
// router.put("/update-user", userAuth, UpdateUser); //Check whether user is authenticated before u update user

// const user = await Users.findById(id ?? userId).populate({
//     path: 'friends',
//     select: '-password',
//   }); // get user info from data base. If id exist we use that else we use the userId

//   After the get user and update user.
//   Next is to work on the friend request and accept or deny request

//   //friend request
// router.post("/friend-request", userAuth, friendRequest);
// router.post("/get-friend-request", userAuth, getFriendRequest);

// //accept / deny friend request
// router.post("/accept-request", userAuth, acceptRequest)


// // Next is to work on the post.
// //  Let's create post routes
// //  Inside the routes index.js we import routes, then we create the file in route
