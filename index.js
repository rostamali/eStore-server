const express = require('express')
const app = express()
const port = process.env.PORT || 4000

const cors = require("cors");
app.use(cors());
app.use(express.json());

require('dotenv').config()

// STRIPE CONNECTION
const stripe = require("stripe")(`${process.env.STRIPE_SECRET}`);



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kniae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    console.log('Hit the db')
});

async function run() {
    try {
        await client.connect();
        const database = client.db("eStore");
        const shopCollection = database.collection("products");
        const flashDealCollection = database.collection("flashDeal");
        const orderCollection = database.collection('orders');

        // get products
        app.get('/products', async (req, res)=>{
            const products = shopCollection.find({});
            const result = await products.toArray();
            res.send(result);
        });

        // get flashdeal products
        app.get('/flashdeal', async (req, res)=>{
            const query = { feature: "flashDeal" };
            const products = shopCollection.find(query).limit(5);
            const result = await products.toArray();
            res.send(result);
        });

        // get trends products
        app.get('/trends', async (req, res)=>{
            const query = { feature: "trends" };
            const products = shopCollection.find(query).limit(7);
            const result = await products.toArray();
            res.send(result);
        });

        // get the order from ui
        app.post('/order', async (req, res)=>{
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        })

        // order info send to the ui
        app.get('/orders/:email', async (req, res)=>{
            const email = req.params.email;
            const query = { email: email };
            const orders = orderCollection.find(query);
            const result = await orders.toArray();
            res.send(result);
        })



        // STIPE POST REQUEST
        app.post("/create-payment-intent", async (req, res) =>{

            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            });

            res.json({
                clientSecret: paymentIntent.client_secret
            });

        });
        
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
    console.log(port)
})