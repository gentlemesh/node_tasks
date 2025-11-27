import mongoose from 'mongoose';

const articleScheme = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    magazine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Magazine',
        required: true,
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
    }],
});

const Article = mongoose.model('Article', articleScheme);

export default Article;