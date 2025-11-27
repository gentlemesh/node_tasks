import mongoose from 'mongoose';

const publisherScheme = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
});

const Publisher = mongoose.model('Publisher', publisherScheme);

export default Publisher;