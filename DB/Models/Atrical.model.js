import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    images: [
        {
            secure_url: String, // URL of the uploaded image
            public_id: String,  // Public ID for deletion if stored in Cloudinary
        },
    ],

},
    { timestamps: true }
);

export const Article =mongoose.models.Article || model("Article", articleSchema);