const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = process.env.PORT || 5200;

// Callthe packages
const app = express()
app.use(bodyParser.json());
app.use(cors());

// MongoDB database connect
const uri = "mongodb+srv://spdevtoolsUser:JtBQT390FA2T4sPD@cluster0.rc49y.mongodb.net/devProducts?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send("Hello spDevTools I'm ready for working!")
})


// MongoDB Database CRUD
client.connect(err => {
    const collection = client.db("devProducts").collection("products");
    console.log('Products Mongodb Database Connected!');
    // ...
    // POST data to mongodb cloud:
    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        collection.insertOne(newProduct)
            .then(result => {
                console.log('Result=', result);
                res.send(result.insertedCount > 0)
            })
    })

    // GET all products from MDB cloud:
    app.get('/products', (req, res) => {
        collection.find({})
            .toArray((err, products) => {
                res.send(products)
            })
    })

    // GET products form specific category of MDB clud: (categoryProduct.js)
    app.get('/product-collection/:category', (req, res) => {
        collection.find({ category: req.params.category })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // GET specific/pdp/single products form MDB clud: (productDetail.js)
    app.get('/product/category/:key', (req, res) => {
        collection.find({ key: req.params.key })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    // POST data TO Cart/MDB clud: (Review.js)
    app.post('/productsByKeys', (req, res) => {
        const productKeys = req.body;
        collection.find({ key: { $in: productKeys } })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })




    // Delete one product from MDB cloud:
    // app.delete('/productDelete', (req, res) => {
    //     const id = ObjectID(req.params.id);
    //     // console.log('Delete this product??', id);
    //     collection.findOneAndDelete({ _id: id })
    //         .then(documents =>
    //             res.send("It's Deleted")
    //         )
    // })

});

// Cart MongoDB Database CRUD
client.connect(err => {
    const collection = client.db("devProducts").collection("cartProducts");
    console.log('Carts Mongodb Database Connected!');
    // ...
    // POST data TO Cart/MDB clud: (Review.js)
    // app.post('/productsByKeys', (req, res) => {
    //     const productKeys = req.body;
    //     collection.find({ key: { $in: productKeys } })
    //         .toArray((err, documents) => {
    //             res.send(documents);
    //         })
    // })

});

app.listen(port)