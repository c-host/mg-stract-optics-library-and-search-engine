const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const optics = new Map();

// Move this route before the catch-all route
app.post('/save-optic', (req, res) => {
    console.log('Received save-optic request');
    const { optic } = req.body;
    console.log('Optic content:', optic);
    const id = crypto.randomBytes(8).toString('hex');
    optics.set(id, optic);
    console.log('Saved optic with ID:', id);
    res.json({ id });
});

app.get('/optic/:id', (req, res) => {
    const { id } = req.params;
    console.log('Fetching optic with ID:', id);
    const optic = optics.get(id);
    if (optic) {
        res.send(optic);
    } else {
        res.status(404).send('Optic not found');
    }
});

// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
