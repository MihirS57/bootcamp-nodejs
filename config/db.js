const mongoose = require('mongoose');
// usually mongoose.connect().then() is used
/* but to avoid problems, async and await keywords are used 
which waits until mongoDb is connected and the connect options are used to avoid
warnings during execution
*/
const connectDB = async () =>{
    const conn = await mongoose.connect(process.env.URI_MONGODB,{
        useCreateIndex:true,
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify:false
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
}

module.exports = connectDB;
