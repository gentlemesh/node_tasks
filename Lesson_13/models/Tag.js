import mongoose from 'mongoose';

const tagScheme = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
    }],
});

const Tag = mongoose.model('Tag', tagScheme);

export default Tag;