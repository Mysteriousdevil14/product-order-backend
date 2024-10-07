const express = require('express');
const axios = require('axios');
const Product = require('./Product');
const Root = require('./Root');

const router = express.Router();
// const shopifyAccessToken = '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';
let storeUrl= '';
let shopifyAccessToken='';


console.log('controller started ');

router.post('/connect', async (req, res) => {
    console.log("POST /connect route");
    console.log("Request body:", req.body); // Log the incoming request

    const { url, token } = req.body;

    if (!url || !token) {
        return res.status(400).send({ message: "Store URL and Access Token are required." });
    }

    try {
        const response = await axios.get(`${url}/admin/api/2023-10/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': token,
            }
        });
        console.log(response.data);
        storeUrl = url ;
        shopifyAccessToken = token;
        res.status(200).send({ message: "Successfully connected to the store.", shopData: response.data });
    } catch (error) {
        console.error("Error connecting to store:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).send({ message: "Failed to connect to the store. Please check your credentials." });
    }
});


router.get('/shopifyget/:id', async (req, res) => {
    console.log("GET /shopifyget/:id route");
    const id = req.params.id;
    try {
        const response = await axios.get(`${storeUrl}/admin/api/2024-07/products/${id}.json`, {
            headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Accept': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
});

router.put('/shopifyput', async (req, res) => {
    console.log("PUT /shopifyput route");
    const product = req.body;
    // console.log(product);
    const productEntity = new Product(product.id, product.title);
    const rootEntity = new Root(productEntity);

    try {
        const response = await axios.put(`${storeUrl}/admin/api/2024-07/products/${productEntity.id}.json`, rootEntity, {
            headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
});

router.put('/updateOrderTag', async (req, res) => {
    console.log("PUT /updateOrderTag route");
    const order = req.body;
    const { id, tag } = order;

    try {
        // Fetch the existing order
        const orderResponse = await axios.get(`${storeUrl}/admin/api/2024-07/orders/${id}.json`, {
            headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Accept': 'application/json'
            }
        });

        // Update the tags
        const existingOrder = orderResponse.data.order;
        existingOrder.tags = existingOrder.tags ? `${existingOrder.tags}, ${tag}` : tag;

        // Save the updated order
        const updateResponse = await axios.put(`${storeUrl}/admin/api/2024-07/orders/${id}.json`, {
            order: existingOrder
        }, {
            headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        res.json(updateResponse.data);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
});

module.exports = router;
