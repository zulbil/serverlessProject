import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://zulbil.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

/**
 * 
 * @param authHeader 
 * @returns 
 */
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt;

    const jwks = await getJwks(jwksUrl);
    const keys = await getSigningKeys(jwks);
    const secret = getSigningKey(keys, jwt.header.kid);

    return verify(token, secret, {algorithms: ['RS256']}) as JwtPayload; 
  } catch (error) {
    console.log(error.message);
    return null; 
  }
}

/**
 * 
 * @param jwkEndpoint 
 * @returns 
 */
async function getJwks(jwkEndpoint): Promise<any> {
  try {
    const response = await Axios.get(jwkEndpoint);
    const { status, data } = response;
    console.log("Response :",response);

    if (status != 200) {
      throw new Error("Http Error request ...");
    }
    return data.keys; 
  } catch (error) {
    console.log(error.message);
    return null; 
  }
}

function getSigningKeys(keys:any) : any {
  try {
    if (!keys || !keys.length) {
      throw new Error("The JWKS endpoint did not contain any keys");
    }
    const signingKeys = keys
        .filter(key => key.use === 'sig' 
                    && key.kty === 'RSA' 
                    && key.kid          
                    && ((key.x5c && key.x5c.length) || (key.n && key.e))
        ).map(key => {
          return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
        });
    if (!signingKeys.length) {
      throw new Error("The JWKS endpoint did not contain any signature verification keys");
    }

    return signingKeys;
    
  } catch (error) {
    console.log(error.message);
    return null; 
  }
}

/**
 * 
 * @param keys 
 * @param kid 
 * @returns 
 */
function getSigningKey(keys: any, kid: string) : string {
  try {
    const signingKey = keys.find(key => key.kid === kid); 

    if (!signingKey) {
      throw new Error(`Unable to find a signing key that matches ${kid}`);
    }
    return signingKey; 
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

function certToPEM(cert) : string {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

/**
 * 
 * @param authHeader 
 * @returns 
 */
function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
