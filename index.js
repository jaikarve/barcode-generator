const sdk = require('kinvey-flex-sdk');
const bwipjs = require('bwip-js');
const axios = require('axios');

const util = require('util');


function storeBarcodeMetadata(png, complete) {

    let kvFileConfig = {
        headers: {
            "Authorization": "Basic a2lkX1NKQm5uQ1FYTjo0ZmIyNWM5YmY3NTQ0NGQxYTljNDhmMWY2ZjFmOThkNQ=="
        }
    }
    let kvFilePostData = {
        "_filename": "sampleBarcode.png",
        "myProperty": "some metadata",
        "someOtherProperty": "some more metadata",
        "mimeType":"image/png"
    }

    axios.post("https://baas.kinvey.com/blob/kid_SJBnnCQXN",
        kvFilePostData, kvFileConfig)
    .then((resp) => {
        console.log("Resp: " + JSON.stringify(resp));
        return complete().setBody({
            "statusCode": 200
        }).ok().done();
        
    })
    .catch((err) => {
        console.log("Error: " + JSON.stringify(err));
        return complete().setBody({
            "error":"invalid request"
        }).badRequest().done();
    })

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

            bwipjs.toBuffer({
                bcid:        'code128',       // Barcode type
                text:        '0123456789',    // Text to encode
                scale:       3,               // 3x scaling factor
                height:      10,              // Bar height, in millimeters
                includetext: true,            // Show human-readable text
                textxalign:  'center',        // Always good to set this
            }, function (err, png) {
                if (err) {
                    console.log(`Error: ${err}`);
                    return complete().setBody(new Error(err)).badRequest().done();
                } else {
                    try {
                        /*let barcodeMetaResponse = await 
                            storeBarcodeMetadata(png);*/
                        storeBarcodeMetadata(png, complete);
                        /*
                        console.log("Barcode Meta Response: " +
                            JSON.stringify(barcodeMetaResponse));
                        return complete().setBody({
                            "statusCode": 200
                        }).ok().done();*/
                    }
                    catch (err) {
                        console.log("Err: " + JSON.stringify(err));
                        return complete().setBody({
                            "error":"invalid request"
                        }).badRequest().done();
                    }
                    // `png` is a Buffer
                    // png.length           : PNG file length
                    // png.readUInt32BE(16) : PNG image width
                    // png.readUInt32BE(20) : PNG image height
                }
            });

            //console.dir("File upload: " + context.body.fileUpload);

            /*

            if(requestBody == null) {
                return complete().setBody({ "error": "must provide payload to convert"}).badRequest().done();
            }

            try {
                let downloadResp = await storeVideoFile(requestBody.videoUrl, requestBody.orderId);
                return complete().setBody({
                    "statusCode":200,
                    "downloadURL":downloadResp.data._downloadURL
                }).ok().done();
            }
            catch (error) {
                console.log("Error: " + error);
            }*/
        }
    );
});