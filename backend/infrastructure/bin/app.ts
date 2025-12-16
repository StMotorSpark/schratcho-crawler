#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack.js';

const app = new cdk.App();

new BackendStack(app, 'SchratchoCrawlerBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  description: 'Backend infrastructure for Schratcho Crawler game'
});

app.synth();
