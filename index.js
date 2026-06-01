require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const OBJECT_TYPE_ID = '2-63454813';
const BASE_URL = 'https://api.hubapi.com';

const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
};

// ROUTE 1 - Homepage: fetch and display all movies
app.get('/', async (req, res) => {
    const url = `${BASE_URL}/crm/v3/objects/${OBJECT_TYPE_ID}?properties=name,director,release_year`;
    try {
        const resp = await axios.get(url, { headers });
        const data = resp.data.results;
        res.render('homepage', { title: 'Movies | HubSpot Custom Object', data });
    } catch (error) {
        console.error(error);
    }
});

// ROUTE 2 - Show form (add new OR edit existing)
app.get('/update-cobj', async (req, res) => {
    const { id } = req.query;
    let movie = null;

    if (id) {
        try {
            const resp = await axios.get(
                `${BASE_URL}/crm/v3/objects/${OBJECT_TYPE_ID}/${id}?properties=name,director,release_year`,
                { headers }
            );
            movie = resp.data;
        } catch (error) {
            console.error(error);
        }
    }

    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        movie
    });
});

// ROUTE 3 - Create or update a movie record, then redirect to homepage
app.post('/update-cobj', async (req, res) => {
    const { id, name, director, release_year } = req.body;
    const properties = { name, director, release_year };

    try {
        if (id) {
            await axios.patch(
                `${BASE_URL}/crm/v3/objects/${OBJECT_TYPE_ID}/${id}`,
                { properties },
                { headers }
            );
        } else {
            await axios.post(
                `${BASE_URL}/crm/v3/objects/${OBJECT_TYPE_ID}`,
                { properties },
                { headers }
            );
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
