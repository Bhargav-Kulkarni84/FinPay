const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION
});

// Function to upload a file
async function uploadToS3(fileName, fileBuffer, contentType) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
    };

    const data = await s3.upload(params).promise();
    return data.Location; // S3 URL
}

// Function to get pre-signed URL
function getPresignedUrl(key, expiresIn = 60 * 5) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: expiresIn
    };
    return s3.getSignedUrl('getObject', params);
}

// Export both
module.exports = { uploadToS3, getPresignedUrl };
