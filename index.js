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

        // Get API
        app.get('/watches', async (req, res) => {
            const cursor = watchCollection.find({});
            const watches = await cursor.toArray();
            res.json(watches);
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