const sdk = require('kinvey-flex-sdk');
const bwipjs = require('bwip-js');
const axios = require('axios');
const fs = require('fs');

const BLOB_URI = "https://baas.kinvey.com/blob/kid_SJBnnCQXN";
const KINVEY_BASIC_AUTH = "Basic a2lkX1NKQm5uQ1FYTjo0ZmIyNWM5YmY3NTQ0NGQxYTljNDhmMWY2ZjFmOThkNQ==";

async function storeBarcodeMetadata(eventName, eventDate) {

    let kvFileMetadataConfig = {
        headers: {
            "Authorization": KINVEY_BASIC_AUTH,
            "X-Kinvey-Content-Type":"image/png",
            "Content-Type":"application/json"
        }
    }

    let kvFileMetadata = {
        "_filename": `${eventName}-barcode.png`,
        "eventName": eventName,
        "eventDate": eventDate,
        "mimeType":"image/png"
    }

    return await axios.post(BLOB_URI, kvFileMetadata, kvFileMetadataConfig);
}

async function storeBarcodeInGCS(uploadUrl, rawBarcodePng) {
    let gcsFileConfig = {
        headers: {
            "Content-Length": rawBarcodePng.length,
            "Content-Type":"image/png"
        }
    }

    return await axios.put(uploadUrl, rawBarcodePng, gcsFileConfig);
}

async function getBarcodePngUrl(fileId) {
    let pngUrl = `${BLOB_URI}/${fileId}`;
    let kvGetFileConfig = {
        headers: {
            "Authorization": KINVEY_BASIC_AUTH
        }
    }

    return await axios.get(pngUrl, kvGetFileConfig);
}

sdk.service((err, flex) => {
    if(err){
        console.log("could not initialize flex!");
        return;
    }

    let f = flex.functions;
    f.register('generateBarcode', 
        function(context, complete, modules){
            let requestBody = context.body;

            console.log("Request body: " + JSON.stringify(requestBody));
            
            bwipjs.toBuffer({
                bcid:        'qrcode',       // Barcode type
                text:        requestBody.eventName
            }, 
            async function (err, png) {
                if (err) {
                    console.log(`Error: ${err}`);
                    return complete().setBody(new Error(err)).badRequest().done();
                } 
                try {
                    let metadataResp = await storeBarcodeMetadata(requestBody.eventName, requestBody.eventDate);
                    await storeBarcodeInGCS(metadataResp.data._uploadURL, png);
                    let pngGCSUrl = await getBarcodePngUrl(metadataResp.data._id);
                    console.log("Download URL: " + pngGCSUrl.data._downloadURL);
                    return complete().setBody({
                        "statusCode":200,
                        "downloadURL":pngGCSUrl.data._downloadURL
                    }).ok().done();
                }
                catch (error) {
                    console.dir("Error: " + error);
                    return complete().setBody({
                        "error": "invalid request"
                    }).badRequest().done();
                }                
            });
        }
    );
});