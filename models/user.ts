import mongoose, { AnyObject, Document, Schema, Types } from 'mongoose'

interface ICartItem {
    productId: string,
    title: string,
    price: number,
    images: string[],
    quantity: number,
  }
  
export interface IUser extends Document {
    _id: Types.ObjectId,
    username: string,
    passwordHash: string,
    cart: ICartItem[]
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    passwordHash: String,
    cart: [{
        productId: String,
        title: String,
        price: Number,
        images: [String],
        quantity: Number
    }]
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

export default User