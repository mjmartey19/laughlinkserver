import express from 'express'
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// ENDPOINTS
router.post("/register", register); //Post requst, endpoint register
router.post("/login", login); //Post requst, endpoint login

export default router;