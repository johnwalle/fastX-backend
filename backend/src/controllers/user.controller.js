const User = require('../models/user.schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require("http-status");
const userService = require('../services/user.service');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { validatePasswordStrength } = require('../utils/passwordUtils');

// REGISTER NEW USER
// UNPROTECTED ROUTE
// POST /api/users/register

const registerUser = catchAsync(async (req, res) => {

    const { fullName, email, password, phoneNumber } = req.body;

    // Check if the fields are empty
    if (!email || !password || !fullName || !phoneNumber) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please fill all the fields");
    }

    // Check if user already exists
    const userExists = await userService.getUserByEmail(email);
    if (userExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email is already taken");
    }

    // Check if the fullname contains both the first name and last name
    if (fullName.split(' ').length < 2) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please enter both first name and last name");
    }

    // Check if the phone number starts with +251
    if (!phoneNumber.startsWith('+251')) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Phone number must start with +251");
    }


    // Check if the rest of the number is numeric and has the correct length
    const phoneWithoutCountryCode = phoneNumber.slice(4); // Remove +251
    if (!/^\d{9}$/.test(phoneWithoutCountryCode)) {
        throw new ApiError(400, 'Invalid phone number');
    }


    // Validate password strength
    const passwordValidation = await validatePasswordStrength(password);
    if (!passwordValidation.valid) {
        throw new ApiError(httpStatus.BAD_REQUEST, passwordValidation.errors);
    }


    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = {
        fullName,
        email,
        password: hashedPassword,
        phoneNumber
    };

    await userService.createUser(user);

    // Send response
    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'User created successfully'
    });
});

// GET USER PROFILE
// PROTECTED ROUTE
// GET /api/users/profile

const getUserProfile = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user._id);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
});

// GET USER BY ID
// UNPROTECTED ROUTE
// GET /api/users/:id

const getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
});

// GET ALL USERS
// UNPROTECTED ROUTE
// GET /api/users

const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getUser();
    res.status(httpStatus.OK).json(users);
});

// DELETE USER
// PROTECTED ROUTE
// DELETE /api/users/:id

const deleteUser = catchAsync(async (req, res) => {
    const userId = req.user._id.toString();
    const { id } = req.params;

    if (userId !== id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to delete this user");
    }

    const user = await userService.deleteUser(id);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json({ message: "User deleted successfully" });
});

// UPDATE USER DATA
// PROTECTED ROUTE
// PATCH /api/users/:id

const updateUser = catchAsync(async (req, res) => {
    const userId = req.user._id.toString();
    const { id } = req.params;
    const { fullName, email, phoneNumber } = req.body;

    if (userId !== id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to update this user");
    }

    const user = await userService.getUserById(id);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Check if the fullName contains both the first name and last name
    const isFullNameValid = fullName && fullName.split(' ').length >= 2;
    if (fullName && !isFullNameValid) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Full name must contain both first and last name");
    }

    // Check if the phone number starts with +251
    if (phoneNumber && !phoneNumber.startsWith('+251')) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Phone number must start with +251");
    }

    // Check if the email is already taken
    const userExists = await userService.getUserByEmail(email);
    if (userExists && userExists._id.toString() !== id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email is already taken");
    }

    const userData = {
        fullName,
        email,
        phoneNumber
    };

    const updatedUser = await userService.updateUser(id, userData);

    res.status(httpStatus.OK).json({
        message: "User updated successfully",
        updatedUser: updatedUser
    });
});

module.exports = {
    registerUser,
    getUserProfile,
    getUserById,
    getAllUsers,
    deleteUser,
    updateUser
};
