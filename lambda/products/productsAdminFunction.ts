import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ProductRepository, Product } from "/opt/nodejs/productsLayer";
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
  const method = event.httpMethod;

  console.log(
    `API Gateway RequestId ${apiRequestId} - Lambda RequestId ${lambdaRequestId}`
  );

  if (event.resource === "/products") {
    const product = JSON.parse(event.body!) as Product;
    console.log("POST /products");

    const productCreated = await productRepository.create(product);
    return {
      statusCode: 201,
      body: JSON.stringify(productCreated),
    };
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    console.log(`{${method} /products/${productId}`);
    if (method === "PUT") {
      const product = JSON.parse(event.body!) as Product;
      try {
        const productUpdated = await productRepository.updateProduct(
          productId,
          product
        );
        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated),
        };
      } catch (ConditionalCheckFailedException) {
        console.error((<Error>ConditionalCheckFailedException).message);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Product not found" }),
        };
      }
    } else if (method === "DELETE") {
      try {
        const productDeleted = await productRepository.deleteProduct(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(productDeleted),
        };
      } catch (err) {
        console.error((<Error>err).message);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: (<Error>err).message }),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Get Products Error" }),
  };
}
