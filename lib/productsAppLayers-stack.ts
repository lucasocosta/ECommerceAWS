import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";


export class ProductsAppLayersStack extends cdk.Stack {
    readonly productsLayers: lambda.LayerVersion;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.productsLayers = new lambda.LayerVersion(this, "ProductsLayer", {
            code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            layerVersionName: "ProductsLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });
        new ssm.StringParameter(this, "ProductsLayerVersionArn", {
            parameterName: "ProductsLayerVersionArn",
            stringValue: this.productsLayers.layerVersionArn
        });
    }
}