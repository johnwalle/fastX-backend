const express = require('express');
const router = express.Router();
const { requireSignIn, adminMiddleware, superAdminMiddleware } = require('../middleware/authmiddleware');


const {
    registerUser,
    getUserProfile,
    getUserById,
    getAllUsers,
    deleteUser,   
    updateUser,
    createAdminUser,
} = require('../controllers/user.controller');

// user registration
router.post('/register', registerUser);

// profile for logged-in user
router.get('/profile', requireSignIn, getUserProfile);

// get user by id (admin only)
router.get('/:id', requireSignIn, adminMiddleware, getUserById);

// get all users (admin only)
router.get('/', requireSignIn, adminMiddleware, getAllUsers);

// delete user (logged in only)
router.delete('/delete-user/:id', requireSignIn, deleteUser);

// update own account
router.put('/update/myaccount', requireSignIn, updateUser);

// admin only
router.post('/create-admin', requireSignIn, superAdminMiddleware, createAdminUser);

module.exports = router;
