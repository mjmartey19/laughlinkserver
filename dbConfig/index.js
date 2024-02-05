import mongoose from "mongoose";

const dbConnection = async () => {
    try {
      const connection = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        UseUnifiedTopology: true,
      })
      //If everything goes through
      console.log("DB Connected Successfully")
    } catch (err) {
        console.log("DB Error:" + err);
       } 
}

export default dbConnection;	