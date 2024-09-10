module.exports = {
    companyInfo: {
        service: process.env.EMAIL_SERVICE,
        email: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    rateLimiter: {
        maxAttemptsPerEmail: 5,
        maxAttemptsPerDay: 10,
        maxAttemptsByIpUsername: 3,
    },
    cloudImage: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    },
    chapaPayment: {
        secretKey: process.env.CHAPA_SECRET_KEY,
        publicKey: process.env.CHAPA_PUBLIC_KEY,
        encryptionKey: process.env.CHAPA_ENCRYPTION_KEY,
        apiUrl: process.env.CHAPA_API_URL,
        baseUrl: process.env.BASE_URL
    },
}