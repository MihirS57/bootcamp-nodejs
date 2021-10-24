const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const Course = require('./Course');
const BootcampScheme = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Name is required'],
        maxlength: [50,'Name cannot have more than 50 characters'],
        unique: true,
        trim: true
    },
    slug: String,
    description:{
        type: String,
        required: true,
        maxlength: [500,'Description cannot have more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
            ,'Please enter a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20,'Phone number cannot be longer than 20 numbers']
    },
    email: {
        type: String,
        match: [
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            ,'Please add a valid email address'
        ]
    },
    address: {
        type: String,
        required: [true,'Please add an address']
    },
    location: {
        //GeoJSON point
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            
          },
          coordinates: {
            type: [Number],
            index: '2dsphere'
          },
          formattedAddress: String,
          street: String,
          city: String,
          state: String,
          zipcode: String,
          country: String
    },
    careers:{
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1,'Rating must be atleast 1'],
        max: [10,'Rating cannot exceed more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantees: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});


BootcampScheme.pre('save' , function(next){
    this.slug = slugify(this.name, {lower: true});
    console.log('Slugify ran',this.name);
    next();
});

BootcampScheme.pre('remove', async function(next)  {
    console.log('Courses deleted before bootcamp deletion')
    await Course.deleteMany({
        bootcamp: this._id
    });
    next();
});

//reverse populate using virtual
BootcampScheme.virtual('courses',{
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

//Geocode & create location field (geocoder.js)
BootcampScheme.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude,loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    //For more info: https://github.com/nchaulet/node-geocoder/blob/master/README.md
    //Do not save address
    this.address = undefined;
    next();
});

module.exports = mongoose.model('Bootcamp',BootcampScheme);