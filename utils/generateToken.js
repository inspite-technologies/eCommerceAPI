import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is missing from environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '10d' })
}

export default generateToken