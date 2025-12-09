#!/usr/bin/env tsx
/**
 * Simple reproduction script for DID creation error
 * 
 * This is the simplest possible setup:
 * - Uses default Askar SQLite storage (no PostgreSQL, no Drizzle)
 * - No special modules (no tenants, no openid4vc)
 * - Just creates a basic wallet and tries to create a DID
 * 
 * Usage:
 *   npm run reproduce:did-error
 *   or
 *   tsx src/reproduce-did-error.ts
 * 
 * Optional environment variables:
 *   - WALLET_ID: Wallet ID (default: 'test-wallet')
 *   - WALLET_KEY: Wallet key (default: 'test-key')
 *   - CREDO_LOG_LEVEL: Log level for Credo (default: 'info')
 *     Options: 'test', 'trace', 'debug', 'info', 'warn', 'error', 'fatal', 'off'
 */

import { Agent, LogLevel } from '@credo-ts/core';
import { agentDependencies } from '@credo-ts/node';
import { AskarModule } from '@credo-ts/askar';
import { askar } from '@openwallet-foundation/askar-nodejs';
import { createDidKey } from './utils/did.js';
import { SimpleLogger } from './utils/logger.js';

function getLogLevel(): LogLevel {
  const level = process.env.CREDO_LOG_LEVEL?.toLowerCase();
  switch (level) {
    case 'test':
      return LogLevel.test;
    case 'trace':
      return LogLevel.trace;
    case 'debug':
      return LogLevel.debug;
    case 'info':
      return LogLevel.info;
    case 'warn':
      return LogLevel.warn;
    case 'error':
      return LogLevel.error;
    case 'fatal':
      return LogLevel.fatal;
    case 'off':
      return LogLevel.off;
    default:
      return LogLevel.info;
  }
}

async function main() {
  const logger = new SimpleLogger();
  
  try {
    logger.info('Starting simple DID creation test');
    
    const walletId = process.env.WALLET_ID || 'test-wallet';
    const walletKey = process.env.WALLET_KEY || 'test-key';
    const logLevel = getLogLevel();
    
    logger.info(`Wallet ID: ${walletId}, Log Level: ${LogLevel[logLevel]}`);
    logger.info('Creating simple agent...');
    
    // Create the simplest possible agent - just Askar with default SQLite storage
    const agent = new Agent({
      config: {
        logger: new SimpleLogger(logLevel),
      },
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({
          askar: askar,
          store: {
            id: walletId,
            key: walletKey,
          },
          enableKms: true,
          enableStorage: true, // Use Askar's default SQLite storage
        }),
      },
    });
    
    // Step 1: Provision the store
    logger.info('Provisioning store...');
    try {
      await agent.modules.askar.provisionStore();
      logger.info('✅ Store provisioned');
    } catch (error) {
      // Store might already exist, which is fine
      if (error instanceof Error && !error.message.includes('already exists')) {
        throw error;
      }
      logger.info('Store already exists, continuing...');
    }
    
    // Step 2: Initialize agent
    logger.info('Initializing agent...');
    await agent.initialize();
    logger.info('✅ Agent initialized');
    
    // Step 3: Create DID
    logger.info('Creating DID key...');
    const didKeyInfo = await createDidKey(agent);
    logger.info(`✅ DID key created successfully`);
    logger.info(`  DID: ${didKeyInfo.did}`);
    logger.info(`  KID: ${didKeyInfo.kid}`);
    
    logger.info('✅ Script completed successfully');
    
    // Cleanup
    await agent.shutdown();
    logger.info('Agent shut down');
    
  } catch (error) {
    logger.error('❌ Script failed with error');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
