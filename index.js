const express = require('express')
const app = express()
const port = process.env.PORT || 4000

const cors = require("cors");
app.use(cors());
app.use(express.json());

require('dotenv').config()


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
        const productsCollection = database.collection("products");

        // get products
        app.get('/products', async (req, res)=>{
            const products = productsCollection.find({});
            const result = await products.toArray();
            res.send(result);
        });

        // get flash deal product
        app.get('/flashdeal', async (req, res)=>{
            const products = productsCollection.find({}).limit(5);
            const result = await products.toArray();
            res.send(result);
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
//   console.log(client)
})