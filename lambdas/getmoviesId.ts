import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const city = event.queryStringParameters?.city;

  if (!city) {
    return { statusCode: 400, body: "Missing city query parameter" };
  }

  try {
    const result = await client.send(
      new ScanCommand({
        TableName: process.env.CinemasTable,
        FilterExpression: "#movieId = :c5002",
        ExpressionAttributeNames: {
          "#movieId": "movieId",
        },
        ExpressionAttributeValues: {
          ":c5002": city,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ movies: result.Items }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Scan failed" }) };
  }
};