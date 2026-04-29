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
    
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${BASE_URL}/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${BASE_URL}/cancel`
        })

        console.log(session)
        
        res.status(200).json({ url: session.url, id: session.id })
    } catch(err) {
        console.error(err)
        res.status(400).json({ error: 'Error proceeding with payment' })
    }

})

paymentRouter.post('/savepayment', async (req: Request, res: Response) => {
    const { sessionId } = req.body

    console.log('session ID:', sessionId)

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