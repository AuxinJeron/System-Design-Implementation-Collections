import apigateway = require("@aws-cdk/aws-apigateway");
import dynamodb = require("@aws-cdk/aws-dynamodb");
import lambda = require("@aws-cdk/aws-lambda");
import cdk = require("@aws-cdk/core");

export class TinyUrlStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    // Setup the dynamodb table
    const dynamodbTable = new dynamodb.Table(this, "TinyUrls", {
      partitionKey: {
        name: "tinyUrl",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: "TinyUrls",
      // Retain will not attempt to delete the new table.
      // It will remain in your account until manually deleted.
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Setup the lambda
    const createTinyUrlLambda = new lambda.Function(this, "CreateTinyUrlLambda", {
      code: new lambda.AssetCode("src"),
      handler: "tiny_url.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamodbTable.tableName,
        PRIMARY_KEY: "tinyUrl",
      },
    });

    const tinyUrlLambda = new lambda.Function(this, "TinyUrlLambda", {
      code: new lambda.AssetCode("./output/src"),
      handler: "tiny_url.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamodbTable.tableName,
        PRIMARY_KEY: "tinyUrl",
      },
    });

    dynamodbTable.grantReadWriteData(createTinyUrlLambda);
    dynamodbTable.grantReadData(tinyUrlLambda);

    // Setup the API
    const api = new apigateway.RestApi(this, "TinyUrlApi");
    const tinyUrls = api.root.addResource("tiny_urls");
    tinyUrls.addMethod("POST", new apigateway.LambdaIntegration(createTinyUrlLambda));
    addCorsOptions(tinyUrls);

    const tinyUrl = tinyUrls.addResource("{tinyUrl}");
    tinyUrl.addMethod("GET", new apigateway.LambdaIntegration(tinyUrlLambda));
    addCorsOptions(tinyUrl);
  }
}

function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials": "'false'",
            "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}",
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}

const app = new cdk.App();
new TinyUrlStack(app, "TinyUrlStack");
app.synth();
