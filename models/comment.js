const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        firstname: String,
        lastname: String,
        picture: String
    },
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Comment", commentSchema);
