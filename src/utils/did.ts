import {
  type Agent,
  DidKey,
  type KeyDidCreateOptions,
  type VerificationMethod,
} from '@credo-ts/core';
import { SimpleLogger } from './logger.js';

const logger = new SimpleLogger();

/**
 * DID key information returned after creating a DID
 */
export interface DidKeyInfo {
  did: string;
  didKey: DidKey;
  kid: string;
  verificationMethod: VerificationMethod;
}

/**
 * Creates a DID key and returns the DID key information
 * In Credo 0.6.x, keys are automatically generated - no secret needed
 * @param agent The agent instance
 * @returns The DID key information
 */
export async function createDidKey(agent: Agent): Promise<DidKeyInfo> {
  logger.debug('Creating DID key...');
  
  const didCreateResult = await agent.dids.create<KeyDidCreateOptions>({
    method: 'key',
    options: {
      createKey: {
        type: {
          kty: 'OKP',
          crv: 'Ed25519',
        },
      },
    },
  });

  logger.warn(`DID creation result: ${JSON.stringify(didCreateResult, null, 2)}`);

  if (!didCreateResult.didState.did) {
    const errorMessage = `DID not created, didCreateResult: ${JSON.stringify(didCreateResult, null, 2)}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const did = didCreateResult.didState.did;
  const didKey = DidKey.fromDid(did);

  // In Credo 0.6.x, the verification method ID uses the key identifier
  // The format is: did:key:... # z6Mk... (the key identifier part)
  const kid = `${did}#${did.split(':')[2]}`;

  const verificationMethod = didCreateResult.didState.didDocument?.dereferenceKey(kid, [
    'authentication',
  ]);
  
  if (!verificationMethod) {
    throw new Error('No verification method found');
  }

  return {
    did,
    didKey,
    kid,
    verificationMethod,
  };
}
