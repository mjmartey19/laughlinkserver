import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

export const hashString = async (userValue) => {
    const salt = await bcrypt.genSalt(10);//Create salt
    const hashedPassword = await bcrypt.hash(userValue, salt)
    // console.log(hashedPassword)
    return hashedPassword;
};

//Function to compare password when we login
export const compareString = async (userPassword, password) => {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
};

//GENERATE JSON WEBTOKEN
export function createJWT(id){
    return JWT.sign({ userId: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
    })
}

