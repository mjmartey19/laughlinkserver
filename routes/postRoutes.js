import express from 'express'
import { commentPost, createPost, deletePost, getComments, getPost, getPosts, getUserPost, likePost, likePostComment, replyPostComment } from '../controllers/postControllers.js';
import userAuth from '../middleware/authMiddleware.js';

const router = express.Router();

//create post
router.post("/create-post", userAuth, createPost);

//get posts
router.post("/", userAuth, getPosts);
//get post
router.post("/:id", userAuth, getPost);
//get user post
router.post("/get-user-post/:id", userAuth, getUserPost);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

// get comments
router.get("/comments/:postId", getComments);

//delete post
router.delete("/:id", userAuth, deletePost);



export default router;