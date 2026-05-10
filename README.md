# E-commerce backend

A Node.js/Express/Typescript backend for a fake e-commerce shopping app.
MongoDB, JWT and Restful API. Stripe mock payment.

Backend handles user data with shopping cart, order history, Stripe payment and login functionality.

Deployed app [HERE](https://ecommerceapplication.fly.dev/)

You can sign up, login, shop and do a mock payment with Stripe, using their [test cards](https://docs.stripe.com/testing?testing-method=card-numbers#visa)

# Requirements

Create a .env file with following info:<br>
MONGODB_URI=your_mongodb_connection_string<br>
PORT=your_port<br>
SECRET=your_jwt_secret
STRIPE_SECRET=your stripe secret key

DEVELOPMENT_URL
PRODUCTION_URL
DEPLOYMENT_URL

# Setup

git clone, npm install, npm run dev :)
There's a separate frontend for this project.