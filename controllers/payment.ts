import { Request, Response, Router } from 'express'
import Stripe from 'stripe'
import { Product } from '../types/Product'

const paymentRouter = Router()
const stripe = Stripe(process.env.STRIPE_SECRET!)

const BASE_URL = process.env.NODE_ENV === 'dev'
    ? process.env.DEVELOPMENT_URL
    : process.env.NODE_ENV === 'prod'
    ? process.env.PRODUCTION_URL
    : process.env.DEPLOYMENT_URL

paymentRouter.post('/', async (req: Request, res: Response) => {
    const products: Product[] = req.body.products

    const lineItems = products.map((product) => ({
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
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${BASE_URL}/success`,
        cancel_url: `${BASE_URL}/cancel`
    })
    
    res.json({ url: session.url, id: session.id })
})

export default paymentRouter