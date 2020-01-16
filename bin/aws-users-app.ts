#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsUsersAppStack } from '../lib/aws-users-app-stack';

const app = new cdk.App();
new AwsUsersAppStack(app, 'AwsUsersAppStack');
