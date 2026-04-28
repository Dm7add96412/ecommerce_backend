import { Request, Response, Router } from 'express'
import Stripe from 'stripe'
import { Product } from '../types/Product'

const paymentRouter = Router()
const stripe = Stripe(process.env.STRIPE_SECRET!)

paymentRouter.post('/', async (req: Request, res: Response) => {
    const products: Product[] = req.body.products
    console.log(products)

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
        success_url: 'http://localhost:5173/success',
        cancel_url: 'http://localhost:5173/cancel'
    })
    
    res.json({ url: session.url, id: session.id })
})

export default paymentRouter