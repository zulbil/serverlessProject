import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const bucketName: string = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration: number = 300;
const logger: any = createLogger('attachmentUtil');

const XAWS = AWSXRay.captureAWS(AWS)
const s3: any = new XAWS.S3({ signatureVersion: 'v4' });

export function createAttachmentPresignedUrl(imageId: string): string {
  logger.info('create attachment presigned url');
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}