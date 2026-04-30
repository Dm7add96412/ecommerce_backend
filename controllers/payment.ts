import { Request, Response, Router } from 'express'
import Stripe from 'stripe'
import { userExtractor } from '../utils/middleware'
import { TokenRequest } from '../types/TokenRequest'
import { ICartItem } from '../models/user'

const paymentRouter = Router()
const stripe = Stripe(process.env.STRIPE_SECRET!)

const BASE_URL = process.env.NODE_ENV === 'dev'
    ? process.env.DEVELOPMENT_URL
    : process.env.NODE_ENV === 'prod'
    ? process.env.PRODUCTION_URL
    : process.env.DEPLOYMENT_URL

paymentRouter.post('/', userExtractor, async (req: TokenRequest, res: Response) => {
    if(!req.body) {
        res.status(400).json({ error: 'Cart is required' })
        return
    }

    const cart: ICartItem[] = req.body

    const lineItems = cart.map((product) => ({
        price_data: {
            currency: 'EUR',
            product_data: {
                name: product.title,
                images: [product.images[0]]
            },
            unit_amount: product.price * 100
        },
        quantity: product.quantity
    }))
    
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${BASE_URL}/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${BASE_URL}/cancel`
        })
        
        res.status(200).json({ url: session.url, id: session.id })
    } catch(err) {
        console.error(err)
        res.status(400).json({ error: 'Error proceeding with payment' })
    }
})

paymentRouter.post('/savepayment', userExtractor, async (req: TokenRequest, res: Response) => {    
    const sessionId = req.body.sessionId as string
    const user = req.user

    if(!sessionId) {
        res.status(400).json({ error: 'Session ID is required' })
        return
    }

    if (!sessionId) {
        res.status(400).json({ error: 'Password is required' })
        return
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId) 
        const payment = session.payment_status

        if (payment === 'paid') {

            res.status(200).json({ message: 'Payment saved successfully' })
        } else {
            res.status(400).json({ error: 'Payment was not saved' })
        }

    } catch(err) {
        console.error(err)
        res.status(400).json({ error: 'Could not save payment' })
    }
})

export default paymentRouter