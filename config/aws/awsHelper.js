import { S3 } from 'aws-sdk';
const config = require('./config.json');

const s3Config = {
    apiVersion: '2006-03-01',
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    // LocationConstraint: config.region,
    region: config.region,
};

const s3 = new S3(s3Config); // Configuration

console.log('S3', s3.config);

/**
 * 
 * @param {*} bucketName 
 * @param {*} access - default: private
 */
module.exports.createBucket = (bucketName, access = 'private') => {
    return s3.createBucket({
        Bucket: bucketName,    
        CreateBucketConfiguration: {  
            LocationConstraint: config.region  
        },
        ACL: access,
        GrantRead: 'IAM_USERID',
        GrantWrite: 'IAM_USERID',
        GrantFullControl: 'IAM_USERID',
        GrantReadACP: 'IAM_USERID',
        GrantWriteACP: 'IAM_USERID',
        ObjectLockEnabledForBucket: false
    }).promise();
}

/**
 * 
 * @param {*} bucket 
 * @param {*} file 
 * @param {*} contentType 
 * @param {*} serverPath 
 * @param {*} filename 
 * @param {*} access - default: private
 * @returns 
 */
module.exports.uploadFile = (bucket, file, contentType, serverPath, filename, access = 'private') => {
    if (!filename) {
        filename = serverPath.split('/').pop();
    }
    
    return s3.upload({
        Bucket: bucket,
        ACL: access,
        Key: serverPath,
        Body: file,
        ContentType: contentType,
        // ContentDisposition: `attachment; filename=${filename}`,
    }).promise();
}

/**
 * 
 * @param {*} bucket 
 * @param {*} path_to_file 
 * @returns 
 */
module.exports.deleteFile = (bucket, path_to_file) => s3.deleteObject({
    Bucket: bucket,
    Key: path_to_file,
}).promise();