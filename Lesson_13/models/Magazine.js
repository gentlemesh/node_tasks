import mongoose from 'mongoose';

const magazineScheme = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    issueNumber: {
        type: Number,
        required: true,
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publisher',
        required: true,
    },
});

const Magazine = mongoose.model('Magazine', magazineScheme);

export default Magazine;