const express = require('express')
const router = express.Router()
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')
const { error } = require('console')

router.all('/:apiName/*', (req, res) => {
    const { apiName } = req.params;
    const path = req.params[0]; // Capture everything after /:apiName/

    if (registry.services[apiName]) {
        axios({
            method: req.method,
            url: `${registry.services[apiName].url}${path}`,
            data: req.body, // Forward the request body
            headers: req.headers // Forward the request headers
        })
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            res.status(error.response?.status || 500).send('API Requested Is Not Available');
        });
    } else {
        res.status(404).send('API Requested Is Not Available');
    }
});

router.post('/register', (req, res) => {
    const regInfo = req.body
    registry.services[regInfo.apiName] = {...regInfo }
    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (error) => {
        if(error){
            console.log('Could Not Register ' + regInfo.apiName + '\n' + error)
            res.send('Could Not Register ' + regInfo.apiName + '\n' + error)
        } else {
            console.log('Success, API ' + regInfo.apiName + ' has been registered.')
            res.send('Success, API ' + regInfo.apiName + ' has been registered.')
        }
    })
})

module.exports = router