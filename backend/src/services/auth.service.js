const httpStatus = require("http-status");
const userService = require("../services/user.service");
const ApiError = require("../utils/apiError");
const { emailIpBruteLimiter, slowerBruteLimiter, emailBruteLimiter } = require("../middleware/auth.limiter");
const bcrypt = require('bcryptjs');
const TokenService = require("../services/token.service");
const nodemailer = require("nodemailer");
const tokenTypes = require("../config/token");
const config = require("../config/config");
const User = require("../models/user.schema");


const tokenService = new TokenService();

const login = async (email, password, ipAddr) => {
    try {
        console.log('Fetching user by email:', email);
        const user = await userService.getUserByEmail(email);
        console.log('User fetched:', user);

        if (!user) {
            console.log('Error: User not found for email:', email);

            try {
                await Promise.all([
                    emailIpBruteLimiter.consume(`${email}_${ipAddr}`),
                    slowerBruteLimiter.consume(ipAddr),
                    emailBruteLimiter.consume(email),
                ]);
            } catch (rateLimiterError) {
                console.error('Error applying rate limiter:', rateLimiterError);
            }

            throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email");
        }

        console.log('Comparing passwords');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Error: Incorrect password for email:', email);

            try {
                await Promise.all([
                    emailIpBruteLimiter.consume(`${email}_${ipAddr}`),
                    slowerBruteLimiter.consume(ipAddr),
                    emailBruteLimiter.consume(email),
                ]);
            } catch (rateLimiterError) {
                console.error('Error applying rate limiter:', rateLimiterError);
            }

            throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
        }

        return user;
    } catch (error) {
        console.error('Error in login function:', error);
        throw error;
    }
};



const refreshAuthToken = async (refreshToken) => {
    const user = await tokenService.verifyToken(
        refreshToken,
        tokenTypes.REFRESH
    );

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "user Not Found");
    }
    await tokenService.removeToken(user._id);
    return await tokenService.generateAuthTokens(user._id);
};

const sendEmail = async (recipientEmail, resetToken) => {

    console.log('email-password', config.companyInfo.pass)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server address
        port: 587, // Replace with your SMTP server port
        secure: false, // Set to true if using a secure connection (SSL/TLS)
        service: config.companyInfo.service,
        auth: {
            user: config.companyInfo.email,
            pass: config.companyInfo.pass,
        },
    });
    const mailOptions = {
        from: config.companyInfo.email,
        to: recipientEmail,
        subject: "Password Reset",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
                <!-- Centered container with some padding -->
                <div style="max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <img src="https://res.cloudinary.com/dso7gnmps/image/upload/v1724902955/fastX-logo-removebg-preview_oppnsb.png" alt="fastX Delivery" style="width: 200px; height: auto; margin-bottom: 20px;">
                    <h2>Password Reset</h2>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <a href="http://localhost:3000/reset-password/${resetToken}" 
                       style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #A40C0C; 
                       text-decoration: none; border-radius: 5px; margin-top: 20px;">Reset Password</a>
                    <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
                    <p>Thank you,</p>
                    <p>fastX Delivery</p>
                </div>
            </div>
        `,
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending password reset email:", error);
            // throw new ApiError(
            //     httpStatus.UNAUTHORIZED,
            //     "Incorrect email or password"
            // );
        } else {
            console.log("Password reset email sent:", info.response);
        }
    });
};


const passwordReset = async (user, pass) => {
    console.log('user', user, 'pass', pass)
    const hashedPassword = await bcrypt.hash(pass, 12);
    const result = await User.updateOne(
        { _id: user }, // Filter to match the user with the specified ID
        { $set: { password: hashedPassword } } // Update the password field with the new value
    );
    return result;
};





module.exports = {
    login,
    refreshAuthToken,
    sendEmail,
    passwordReset
};
