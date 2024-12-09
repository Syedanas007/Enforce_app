import Amplify, { API } from "aws-amplify";
import { func } from "prop-types";
import moment from 'moment';

Amplify.configure({
    API: {
        endpoints: [
            {
                name: "addfaces",
                endpoint: "https://p3evh1int9.execute-api.us-east-1.amazonaws.com/prod",
                service: 'addfaces',
                region: 'us-east-1'
            }
        ]
    }
});
async function addFaceRekognitionService(images, imageName, ExternalImageId, collection_id) {
    const apiName = "addfaces";
    const path = "/addfaces";
        const body = {
            name: imageName,
            Image: images,
            ExternalImageId: ExternalImageId,
            collection_id: collection_id
        }
        const init = {
            headers: {
                //'Accept': 'application/json',
                "X-Amz-Target": "RekognitionService.IndexFaces",
                "Content-Type": "application/x-amz-json-1.1"
            },
            body: body
        }
        return await API.post(apiName, path, init)
}

async function searchFaceImages(base64, filename, collection_id) {
    const apiName = "addfaces";
    const path = "/searchface";
    const body = {
        name: filename,
        Image: base64,
        collection_id: collection_id
    }
    const init = {
        headers: {
            'Accept': 'application/json',
            "X-Amz-Target": "RekognitionService.SearchFacesByImage",
            "Content-Type": "application/x-amz-json-1.1"
        },
        body: body
    }
    return await API.post(apiName, path, init)
}

export { addFaceRekognitionService, searchFaceImages }