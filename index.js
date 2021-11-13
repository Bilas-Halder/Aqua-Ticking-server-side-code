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

        app.get('/users/role/:email', async (req, res) => {
            const email = req.params?.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.json({ role: user?.role });
        });

        // post Api
        app.post('/buyone', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(newOrder);
        });


        // updating users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };

            const update = {
                "$set": {
                    ...user
                }
            };
            const options = { "upsert": true };

            console.log(user.email, "times");
            const result = await userCollection.updateOne(query, update, options);
            res.json(user);
        });



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