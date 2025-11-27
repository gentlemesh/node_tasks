import mongoose from 'mongoose';

const categoryScheme = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
});

const Category = mongoose.model('Category', categoryScheme);

export default Category;