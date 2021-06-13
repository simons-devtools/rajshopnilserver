const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = process.env.PORT || 5200;

// Callthe packages
const app = express()
app.use(bodyParser.json());
app.use(cors());

// Admin service account:
const admin = require("firebase-admin");
const serviceAccount = require("./configs/devtools-5344d-firebase-adminsdk-tmbn9-4abc21b7e5.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// MongoDB database connect
const uri = `mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASS}@cluster0.rc49y.mongodb.net/devProducts?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send("Hello spDevTools I'm ready for working!")
})


// MongoDB Database CRUD:
// ------------------------
client.connect(err => {
    // ...PRODUCTS
    const productsCollection = client.db("devProducts").collection("products");
    console.log('Products Mongodb Database Connected!');
    // ...CARTS
    const cartsCollection = client.db("devProducts").collection("cartProducts");
    console.log('Carts Mongodb Database Connected!');
    // ...ORDERS
    const ordersCollection = client.db("devProducts").collection("orders");
    console.log('Orders Mongodb Database Connected!');

    // ........................................................................
    // POST data to mongodb cloud:
    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        productsCollection.insertOne(newProduct)
            .then(result => {
                console.log('Result=', result);
                res.send(result.insertedCount > 0)
            })
    })

    // GET all products from MDB cloud:
    app.get('/products', (req, res) => {
        productsCollection.find({})
            .toArray((err, products) => {
                res.send(products)
            })
    })

    // GET products form specific category of MDB clud: (categoryProduct.js)
    app.get('/product-collection/:category', (req, res) => {
        productsCollection.find({ category: req.params.category })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // GET specific/pdp/single products form MDB clud: (productDetail.js)
    app.get('/product/:category/:key', (req, res) => {
        productsCollection.find({ key: req.params.key })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    // Search products from MDB cloud:
    app.get('/search-products', (req, res, next) => {
        const searchedField = req.query.name;
        productsCollection.find({ name: { $regex: searchedField, $options: '$i' } })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // CARTS ====================================================================================
    // POST data TO Cart/MDB clud: (ProductDetail.js)
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        cartsCollection.insertOne(newBooking)
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    // Read cart products from the mongodb database: (Review.js)
    app.get('/bookings', (req, res) => {
        const bearer = (req.headers.authorization);
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });

            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    // console.log(tokenEmail, queryEmail);

                    if (tokenEmail == queryEmail) {
                        cartsCollection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send('Unathorised access. Please try again letter!');
                    }
                })
                .catch((error) => {
                    res.status(401).send('Unathorised access. Please try again letter!');
                });
        }
        else {
            res.status(401).send('Unathorised access. Please try again letter!');
        }
    })

    // Delete one cart product from MDB cloud:
    app.delete('/deleteOne/:id', (req, res) => {
        cartsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                // console.log(result);
                res.send(result.deletedCount > 0);
            })
    })

    // Delete many cart product from MDB cloud:
    app.delete('/deleteMany/:id', (req, res) => {
        cartsCollection.deleteMany({ _id: ObjectId(req.params.id) })
            .then(result => {
                // console.log(result);
                res.send(result.deletedCount > 0);
            })
    })

    // ORDERS ====================================================================================
    // POST data TO Cart/MDB clud: (ProductDetail.js)
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0);
            })
        // console.log(newBooking);
    })
});



// User Cart Products MongoDB Database CRUD:
// --------------------------------------------
// client.connect(err => {
//     const collection = client.db("devProducts").collection("cartProducts");
//     console.log('Carts Mongodb Database Connected!');

//     // POST data TO Cart/MDB clud: (ProductDetail.js)
//     app.post('/addBooking', (req, res) => {
//         const newBooking = req.body;
//         collection.insertOne(newBooking)
//             .then(result => {
//                 // console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     // Read cart products from the mongodb database: (Review.js)
//     app.get('/bookings', (req, res) => {
//         const bearer = (req.headers.authorization);
//         if (bearer && bearer.startsWith('Bearer ')) {
//             const idToken = bearer.split(' ')[1];
//             // console.log({ idToken });

//             // idToken comes from the client app
//             admin.auth().verifyIdToken(idToken)
//                 .then((decodedToken) => {
//                     const tokenEmail = decodedToken.email;
//                     const queryEmail = req.query.email;
//                     // console.log(tokenEmail, queryEmail);

//                     if (tokenEmail == queryEmail) {
//                         collection.find({ email: queryEmail })
//                             .toArray((err, documents) => {
//                                 res.status(200).send(documents);
//                             })
//                     }
//                     else {
//                         res.status(401).send('Unathorised access. Please try again letter!');
//                     }
//                 })
//                 .catch((error) => {
//                     res.status(401).send('Unathorised access. Please try again letter!');
//                 });
//         }
//         else {
//             res.status(401).send('Unathorised access. Please try again letter!');
//         }
//     })

//     // Delete one cart product from MDB cloud:
//     app.delete('/deleteOne/:id', (req, res) => {
//         collection.deleteOne({ _id: ObjectId(req.params.id) })
//             .then(result => {
//                 // console.log(result);
//                 res.send(result.deletedCount > 0);
//             })
//     })

//     // Delete many cart product from MDB cloud:
//     app.delete('/deleteMany/:id', (req, res) => {
//         collection.deleteMany({ _id: ObjectId(req.params.id) })
//             .then(result => {
//                 // console.log(result);
//                 res.send(result.deletedCount > 0);
//             })
//     })

// });

// // User ORDERS Products MongoDB Database cloud:
// // ----------------------------------------------
// client.connect(err => {
//     const collection = client.db("devProducts").collection("orders");
//     console.log('Orders Mongodb Database Connected!');

//     // POST data TO Cart/MDB clud: (ProductDetail.js)
//     app.post('/addOrder', (req, res) => {
//         const newOrder = req.body;
//         collection.insertOne(newOrder)
//             .then(result => {
//                 // console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//         // console.log(newBooking);
//     })
// });

app.listen(port)