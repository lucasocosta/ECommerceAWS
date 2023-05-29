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
    console.log("POST /products");

    const product = JSON.parse(event.body!) as Product;
    const result = await createProduct(product);

    return result;
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    console.log(`{${method} /products/${productId}`);

    if (method === "PUT") {
      const product = JSON.parse(event.body!) as Product;
      const result = await updateProduct(productId, product);
      return result;
    }
    const result = await deleteProduct(productId);
    return result;
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Get Products Error" }),
  };
}

 async function createProduct(product: Product): Promise<APIGatewayProxyResult> {
  const productCreated = await productRepository.create(product);
  return {
    statusCode: 201,
    body: JSON.stringify(productCreated),
  };
}

async function updateProduct(
  productId: string,
  product: Product
): Promise<APIGatewayProxyResult> {
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
}
async function deleteProduct(
  productId: string
): Promise<APIGatewayProxyResult> {
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
