import express from 'express';
import authRoute from './authRoutes.js'
import userRoute from './userRoutes.js'
import postRoute from './postRoutes.js'

const router = express.Router();

router.use(`/auth`, authRoute); //eg. localhost:8800/auth/register
router.use('/users', userRoute);//eg. localhost:8800/users/request-passwordreset
router.use('/posts', postRoute);//eg. localhost:8800/posts/request-passwordreset


export default router; 
