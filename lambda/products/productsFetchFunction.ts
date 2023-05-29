import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API Gateway RequestId ${apiRequestId} - Lambda RequestId ${lambdaRequestId}`
  );

  if (event.resource === "/products") {
    console.log("GET /products");
    const result = await getAllProducts();
    
    return result;
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    console.log(`GET /products/${productId}`);
    const result = await getProductById(productId);

    return result;
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Error getting product" }),
  };
}

 async function getAllProducts(): Promise<APIGatewayProxyResult> {
  const products = await productRepository.getAllProducts();
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
}

async function getProductById(productId: string): Promise<APIGatewayProxyResult> {
  try {
    const product = await productRepository.getProductById(productId);
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.error((<Error>err).message);
    return {
      statusCode: 404,
      body: JSON.stringify({ message: (<Error>err).message }),
    };
  }
}