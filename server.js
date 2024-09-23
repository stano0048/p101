const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const stripe = require('stripe')('your-stripe-secret-key'); // Replace with your Stripe secret key
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/carDealership', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Car Schema
const carSchema = new mongoose.Schema({
    model: String,
    price: Number,
    img: String
});
const Car = mongoose.model('Car', carSchema);

// Routes
app.get('/api/cars', async (req, res) => {
    const cars = await Car.find();
    res.json(cars);
});

app.post('/api/payment', async (req, res) => {
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (car) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: car.price * 100,  // Stripe expects amount in cents
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } else {
        res.status(404).json({ message: 'Car not found.' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});