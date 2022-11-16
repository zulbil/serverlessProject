import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const bucketName: string = process.env.ATTACHMENT_S3_BUCKET

const XAWS = AWSXRay.captureAWS(AWS)
const s3: any = new XAWS.S3({ signatureVersion: 'v4' });


export function createAttachmentPresignedUrl(imageId: string): string {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
}