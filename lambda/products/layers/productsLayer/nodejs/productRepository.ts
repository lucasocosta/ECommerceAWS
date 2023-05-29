import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
  productUrl: string;
}

export class ProductRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  public async getAllProducts(): Promise<Product[]> {
    const data = await this.ddbClient
      .scan({
        TableName: this.productsDdb,
      })
      .promise();

    return data.Items as Product[];
  }

  public async getProductById(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .get({
        TableName: this.productsDdb,
        Key: { id: productId },
      })
      .promise();
    if (data.Item) return data.Item as Product;
    throw new Error(`Product ${productId} not found`);
  }

  public async create(product: Product): Promise<Product> {
    product.id = uuid();
    const data = await this.ddbClient
      .put({
        TableName: this.productsDdb,
        Item: product,
      })
      .promise();
    return product;
  }

  public async deleteProduct(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: { id: productId },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    if (data.Attributes) return data.Attributes as Product;
    throw new Error(`Product ${productId} not found`);
  }

  public async updateProduct(
    productId: string,
    product: Product
  ): Promise<Product> {
    const data = await this.ddbClient
      .update({
        TableName: this.productsDdb,
        Key: { id: productId },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "UPDATED_NEW",
        UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m, productUrl = :u",
        ExpressionAttributeValues: {
            ":n": product.productName,
            ":c": product.code,
            ":p": product.price,
            ":m": product.model,
            ":u": product.productUrl
        }
      })
      .promise();
    data.Attributes!.id = productId;
    return data.Attributes as Product;
  }
}