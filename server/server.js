const fs = require('fs');
const ttsUtils = require('./ttsUtils.js');
const express = require('express')
const app = express()

// The text to synthesize
//const text = 'Boo!  Happy Halloween!';
//ttsUtils.playAudioFileFromText(text);


app.get('/deviceStatusAlert/:deviceName-:deviceStatus', (req, res) => {
    const alertMessage = req.params.deviceName + " - " + req.params.deviceStatus;
    ttsUtils.playAudioFileFromText(alertMessage).then(
        () => {res.status(200).send("Played Status Alert '" + alertMessage + "' Successfully! ");},
        (err) => {res.status(500).send("Status Alert '" + alertMessage + "' Failed!\n\n\nError:\n\n" + err);});
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))