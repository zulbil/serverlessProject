import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createLogger } from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('database');

const dynamoDBClient = (): DocumentClient => {
  if (process.env.IS_OFFLINE) {
    logger.info('Local database started....');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:4000'
    });
  }
  logger.info('AWS DynamoDB database started');
  return new XAWS.DynamoDB.DocumentClient();
};

export default dynamoDBClient; 