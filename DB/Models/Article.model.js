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
    Images: {
        URLs: [
            {
            secure_url: {
                type: String,
            },
            public_id: {
                type: String,
            },
        },
        ],
        customId: {
            type: String,
        }
    }

},{ timestamps: true }
);

export const Article  =mongoose.models.Article  || model("Article", articleSchema);