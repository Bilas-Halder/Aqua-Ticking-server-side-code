const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { ObjectID } = require('bson');

require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

//middleWare
app.use(cors());
app.use(express.json());


const uri = process.env.DB_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Aqua-Ticking");
        const watchCollection = database.collection("watches");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");

        // Get API
        app.get('/watches', async (req, res) => {
            const cursor = watchCollection.find({});
            const watches = await cursor.toArray();
            res.json(watches);
        });
        app.get('/watches/:id', async (req, res) => {
            const id = req.params?.id;
            const query = { _id: ObjectID(id) };
            const watch = await watchCollection.findOne(query);
            res.json(watch);
        });

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        });

        app.get('/users/role/:email', async (req, res) => {
            const email = req.params?.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.json({ role: user?.role });
        });

        // get all orders
        app.get('/getOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });
        // get orders using email
        app.get('/getOrders/:email', async (req, res) => {
            const email = req.params?.email;
            const query = { email: email };

            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });


        // post Api
        app.post('/buyone', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(newOrder);
        });
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(review);
        });

        app.post('/watches', async (req, res) => {
            const watch = req.body;
            const result = await watchCollection.insertOne(watch);
            res.json(watch);
        })


        // updating users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const { role, ...rest } = user;

            const update = {
                "$set": {
                    ...rest
                }
            };
            const options = { "upsert": true };
            const result = await userCollection.updateOne(query, update, options);
            res.json(user);
        });
        // updating shipped status
        app.put('/allOrders/shipped/:id', async (req, res) => {
            const id = req.params?.id;
            const query = { _id: ObjectID(id) };

            const updateDoc = {
                $set: {
                    status: "Shipped"
                }
            };
            const result = await orderCollection.updateOne(query, updateDoc)
            res.json(result);
        })

        app.put('/makeAdmin/:email', async (req, res) => {
            const email = req.params?.email;
            const query = { email: email };
            const updateDoc = {
                $set: {
                    role: "admin"
                }
            };
            const result = await userCollection.updateMany(query, updateDoc);
            res.json(result);
        })

        // DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params?.id;
            const query = { _id: ObjectID(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params?.id;
            const query = { _id: ObjectID(id) };
            const result = await watchCollection.deleteOne(query);
            res.json(result);
        })



    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello EveryOne!');
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})