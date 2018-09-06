const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsConfig = require('./config/ttsConfig.json');
const player = require('play-sound')(opts = ttsConfig.playSoundOptions);

function getTTSKeyFilePath(keyFilename = 'HomeAutomationAuthentication.json') {
    return path.join(__dirname, 'config', keyFilename);
}

function getAudioFilePath(fileName, fileExtension) {
    return path.join(__dirname, ttsConfig.audioFilePath, fileName + '.' + fileExtension);
}

function createAudioFileDir() {
    const dir = path.join(__dirname, ttsConfig.audioFilePath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function playAudioFile(audioFilePath) {
    return new Promise((resolve,reject)=>{
        player.play(audioFilePath, ttsConfig.playOptions, function(err){
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

const utils = {
    createAudioFileFromText: function(text, audioFilePath) {
        //make sure the audio file directory exists
        createAudioFileDir();
        
        // Construct the request
        const textOptions = {
            keyFilename: ttsConfig.authenticationFilename,
            audioConfig: ttsConfig[ttsConfig.audioConfig],
            voice: ttsConfig[ttsConfig.voice],
            text: text,
            outputFile: audioFilePath
        };

        return utils.synthesizeText(textOptions);
    },
    playAudioFileFromText: function(text) {
        const filename = text.replace(/\s/g,'').replace(/[^A-Za-z0-9_]/g,'');
        const audioFilePath = getAudioFilePath(filename, ttsConfig.outputFileExtension);

        return new Promise((resolve,reject) => {
            fs.stat(audioFilePath, (err, stat) => {
                if(err == null) {
                    playAudioFile(audioFilePath).then(
                        () => {resolve();}, 
                        (err) => {reject(err);});
                } else if(err.code == 'ENOENT') {
                    utils.createAudioFileFromText(text,audioFilePath).then(
                        ()=>{ playAudioFile(audioFilePath).then(
                            () => {resolve();}, 
                            (err) => {reject(err);}); 
                        }, 
                        (err)=>{reject(err);});
                } else {
                    reject(err);
                }
            });
        });
    },
    /* 
    textOptions: {
        keyFilename - String, filename in the 'config' folder of the authentication file
        text - String, text to synthesize into speech
        voice - Object, object containing voice options (eg, languageCode, name, etc)
        audioConfig - Object, object containing audio encoding options (eg, audioEncoding, effectsProfileId, pitch, speakingRate, etc)
        outputFile - String, filename with path to the location to save the audio file
    }
    */
    synthesizeText: function (textOptions) {
        // [START tts_synthesize_text]
        return new Promise((resolve, reject) => {
            const client = new textToSpeech.TextToSpeechClient({ keyFilename: getTTSKeyFilePath(textOptions.keyFilename) });
    
            const request = {
            input: {text: textOptions.text},
            voice: textOptions.voice,
            audioConfig: textOptions.audioConfig,
            };
        
            client.synthesizeSpeech(request, (err, response) => {
                if (err) {
                    console.error('ERROR:', err);
                    reject(err);
                }
            
                fs.writeFile(textOptions.outputFile, response.audioContent, 'binary', err => {
                    if (err) {
                        console.error('ERROR:', err);
                        reject(err);
                    } else {
                        console.log(`Audio content written to file: ${textOptions.outputFile}`);
                        resolve(textOptions.outputFile);
                    }
                });
            });
            // [END tts_synthesize_text]
        });
    }
  
};

module.exports = utils;