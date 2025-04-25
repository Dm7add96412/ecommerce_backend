import mongoose, { AnyObject, Document, Schema, Types } from 'mongoose'

interface IUser extends Document {
    _id: Types.ObjectId,
    username: string,
    passwordHash: string
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    passwordHash: String
})

userSchema.set('toJSON', {
    transform: (document: Document, returnedObject: AnyObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User