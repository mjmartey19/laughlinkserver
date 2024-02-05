import mongoose, { Schema } from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    postId: { type: Schema.Types.ObjectId, ref: 'Posts' }, //post we are commenting
    comment: { type: String, required: true },
    from: { type: String, required: true },
    replies: [
      {
        rid: { type: mongoose.Schema.Types.ObjectId }, // reference to 'User' model
        userId: { type: Schema.Types.ObjectId, ref: 'Users' },
        from: { type: String },
        replyAt: { type: String },
        comment: { type: String },
        created_At: { type: Date, default: Date.now() },
        updated_At: { type: Date, default: Date.now() },
        likes: [{ type: String }],
      },
    ], //reply to other comment
    likes: [{ type: String }],
  },
  { timestamps: true }
);

const Comments = mongoose.model('Comments', commentSchema);

export default Comments;
