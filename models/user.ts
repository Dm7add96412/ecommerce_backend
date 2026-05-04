import mongoose, { AnyObject, Document, Schema, Types } from 'mongoose'

export interface ICartItem {
    id: string,
    title: string,
    price: number,
    images: string[],
    quantity: number,
  }

export interface IOrderHistoryItem {
    title: string,
    price: number,
    quantity: number
}
  
export interface IUser extends Document {
    _id: Types.ObjectId,
    username: string,
    passwordHash: string,
    cart: ICartItem[],
    orderHistory: [
        cart: IOrderHistoryItem[],
        id: string,
        date: string
    ]
}

export interface IUserResponse extends AnyObject {
    id: string,
    username: string,
    cart: ICartItem[],
    orderHistory: [
        cart: IOrderHistoryItem[],
        id: string,
        date: string
    ]
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
        id: String,
        title: String,
        price: Number,
        images: [String],
        quantity: Number,
        _id: false
    }],
    orderHistory: [{
        cart: [{
            title: String,
            price: Number,
            quantity: Number,
            date: String,
            _id: false
        }],
        id: String,
        date: String
    }]
})

userSchema.set('toJSON', {
    transform: (document: Document, returnedObject: Partial<IUserResponse>) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

export default User