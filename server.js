const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
//middleware: used to ensure something takes place(Authentication) before routes can be accessed
const middleware = require('./middleware/logger')
//third party middleware
const morgan = require('morgan');
// error handling middleware
const errorHandle = require('./middleware/error')
//Cookie parser Link: https://www.npmjs.com/package/cookie-parser
const cookieParser = require('cookie-parser');
//File upload package
const FileUpload = require('express-fileupload');
//load env vars
dotenv.config({path:'./config/config.env'});
// route files 
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//connection to mongodb
const connectDB = require('./config/db');
//connect to database
connectDB();
const app = express();
//request body json parser (without this req.json won't return json)
app.use(express.json());
//Cookie middleware
app.use(cookieParser());
//mount routes
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}else{
    app.use(middleware);
}
//file uploading
app.use(FileUpload());
//set 'public' a static folder
//visit: http://localhost:5000/uploads/photo_60cb27fa41997a3d2cb89318.jpg to see static folder effect
app.use(express.static(path.join(__dirname,'public'))); 

//routes
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users);
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/reviews',reviews);
/*always place the main middleware (morgan or logger) before the routes (bootcamps)
and then place the error handling middleware
*/
app.use(errorHandle);

const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
    console.log('Server running in '+process.env.NODE_ENV+'mode on PORT '+PORT)
    );

//Incase of mongoDB unhandled error
process.on('unhandledRejection',(err,promise) =>{
    console.log(err.name);
    server.close(()=>process.exit(1));
})