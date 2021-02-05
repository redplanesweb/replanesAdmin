
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
admin.initializeApp(functions.config().firebase);

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/hello', (req, res) => {
    res.send("Received GET request!");
});

// =============================================================================
// ASSIGN A SELLER TO CUSTOMER
// =============================================================================
app.post('/assign-seller', async (req, res) => {
    let body = req.body

    // Initialize Connection
    let db = admin.firestore();

    // Weight Table
    let weightRef = await db.collection('settings').doc('level_weights').get()
    let weighted_table = weightRef.data()
    let sum_of_weights = Object.values(weighted_table).reduce((a, b) => a + b)

    // Find the level
    let random_num = Math.floor(Math.random() * sum_of_weights) + 1
    let temp = random_num
    let chosen_level = 0
    let weights = Object.values(weighted_table)
    for (var i = 0; i < weights; i++) {
        let weight = weights[i]

        if (temp < weight) {
            chosen_level = i + 1
            break
        }

        temp -= weight
    }

    // debug
    chosen_level = 10

    // Choose seller in level
    let sellersRef = await db.collection('seller_users').where('level', '==', chosen_level).get()

    if (sellersRef.empty) {
        sellersRef = await db.collection('seller_users').where('level', '==', 10).get()
    }

    let sellers = []
    sellersRef.forEach(doc => { sellers.push(doc.id) });
    let seller_count = sellers.length
    let chosen_seller = Math.floor(Math.random() * (seller_count))

    // Write to Firestore Queue
    let response = await db.collection('queue').add({
        assigned_to: sellers[chosen_seller],
        history: [],
        insurance_id: body.insurance_id,
        price: body.price,
        region: body.region,
        taken: false,
        uf: body.uf,
        contact_email: body.contact_email,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        first_name: body.first_name,
        last_name: body.last_name
    })

    console.log(response)
    res.status(200).json({ status: "success" });
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);

