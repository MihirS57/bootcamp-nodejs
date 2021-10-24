const mongoose = require('mongoose');
const fs = require('fs')
const dotenv = require('dotenv');
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

dotenv.config({path: './config/config.env'});

mongoose.connect(process.env.URI_MONGODB,{
        useCreateIndex:true,
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify:false
});
console.log(`(Seeder) MongoDB connected`);

const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcampsJSON.json`,'utf-8'
    ));
//C:\Users\Mihir\Personal\NodeJS Stuff\Devcamper_API\_data
//const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcampsJSON.json`,'utf-8'));
console.log("Bootcamps loaded");

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/coursesJSON.json`,'utf-8')
);
console.log("Courses Loaded")

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/usersJSON.json`,'utf-8')
)

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviewsJSON.json`,'utf-8')
)

console.log("Users loaded")
//Import 
const importBootcampData = async () =>{
    try{
        console.log('Try Block');
        await Bootcamp.create(bootcamps);
        console.log('Bootcamps imported');
    }catch(err){
        console.log(err);
    }
}
const importCourseData = async () =>{
    try{
        await Course.create(courses);
        console.log('Courses Imported');
    }catch(err){
        console.log(err);
    }
}

const importUserData = async () => {
    try{
        await User.create(users);
        console.log('Users Imported')
    }catch(err){
        console.log(err);
    }
}

const importReviewData = async () => {
    try{
        await Review.create(reviews);
        console.log('Reviews Imported')
    }catch(err){
        console.log(err);
    }
}

//Delete 
const deleteBootcampData = async () =>{
    try{
        await Bootcamp.deleteMany();    //if passed nothing to the parameter, will delete everything
        console.log('Bootcamps Destroyed');
    }catch(err){
        console.log(err);
    }
}
const deleteCourseData = async () =>{
    try{
        await Course.deleteMany();
        console.log('Courses Deleted');
    }catch(err){
        console.log(err);
    }
}

const deleteUserData = async () =>{
    try{
        await User.deleteMany();
        console.log('Users Deleted');
    }catch(err){
        console.log(err);
    }
}

const deleteReviewData = async () =>{
    try{
        await Review.deleteMany();
        console.log('Reviews Deleted');
    }catch(err){
        console.log(err);
    }
}

const importData = async () =>{
    try{
        await Bootcamp.create(bootcamps);
        await Course.create(courses);   
        await User.create(users);
        await Review.create(reviews);
        console.log('Data Imported');
    }catch(err){
        console.log(err);
    }
}
//Delete 
const deleteData = async () =>{
    try{
        await Bootcamp.deleteMany();    //if passed nothing to the parameter, will delete everything
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed');
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] == '-ib'){
    importBootcampData();
}else if(process.argv[2] == '-db'){
    deleteBootcampData();
}else if(process.argv[2] == '-ic'){
    importCourseData();
}else if(process.argv[2] == '-dc'){
    deleteCourseData();
}else if(process.argv[2] == '-iu'){
    importUserData();
}else if(process.argv[2] == '-du'){
    deleteUserData();
}else if(process.argv[2] == '-ir'){
    importReviewData();
}else if(process.argv[2] == '-dr'){
    deleteReviewData();
}else if(process.argv[2] == '-d'){
    deleteData();
}else if(process.argv[2] == '-i'){
    importData();
}