import AWS from 'aws-sdk';
// define constants
export const ACCESS_S3_KEY = `AKIAVJGKIFPF4TGPCBX5`;
export const SECRET_ACCESS_KEY = `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`;
export const REGION = 'ap-northeast-1';
export const SIGNATURE_VERSION = 'v4';
export const DOMAIN_ACCESS =
  'https://genba-star-bucket.s3.ap-northeast-1.amazonaws.com/';
export const DOMAIN_ACCESS2 =
  'https://genba-star-bucket.s3-ap-northeast-1.amazonaws.com/';
export const BUCKET_PARAMS = 'genba-star-bucket';

export const useS3 = () => {
  const s3 = new AWS.S3({
    accessKeyId: ACCESS_S3_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
    signatureVersion: SIGNATURE_VERSION,
  });
  const getSignedUrl = (url: string) => {
    if (url) {
      let key = url.split(DOMAIN_ACCESS)[1] || url.split(DOMAIN_ACCESS2)[1];
      if (key) {
        let params = {
          Bucket: BUCKET_PARAMS,
          Key: key,
          // Expires: 60 * 60 * 24 * 365, // expires in 60 seconds * 60 minutes * 24 hour * 365 day = 1 year
          Expires: 60 * 60,
        };

        let signedUrlRead = s3.getSignedUrl('getObject', params);
        // console.log('uri getSignedUrl', signedUrlRead);
        // console.log(signedUrlRead);
        return signedUrlRead;
      }
    }
    return url;
  };
  return {getSignedUrl};
};
