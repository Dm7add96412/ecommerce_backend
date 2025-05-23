import { HydratedDocument } from 'mongoose'
import { Request } from 'express'
import { ICartItem, IUser } from '../models/user'

export interface TokenRequest extends Request {
  token?: string | null,
  user?: HydratedDocument<IUser> | null,
  cartItem?: ICartItem
}