#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsAppStack } from '../lib/aws-app-stack';

const app = new cdk.App();
new AwsAppStack(app, 'AwsCdkAppStack');
