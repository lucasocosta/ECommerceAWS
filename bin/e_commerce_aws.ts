#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/productsApp-stack";
import { ECommerceApiStack } from "../lib/ecommerceApi-stack";

const app = new cdk.App();
const env: cdk.Environment = {
  account: "352268968433",
  region: "us-east-2",
};

const tags = {
  cost: "ECommerce",
  team: "Lucas",
};

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
});

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  tags: tags,
  env: env,
  productsFetchHandler: productsAppStack.productsFetchHandler
});

eCommerceApiStack.addDependency(productsAppStack);