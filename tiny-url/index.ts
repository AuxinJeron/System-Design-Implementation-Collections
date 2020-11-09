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
      tableName: "TinyUrls"
    });

    // Setup the lambda
    const tinyUrlLambda = new lambda.Function(this, "TinyUrlLambda", {
      code: new lambda.AssetCode("dist"),
      handler: "packed_tiny_url.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamodbTable.tableName,
        PRIMARY_KEY: "tinyUrl",
      },
    });

    dynamodbTable.grantReadData(tinyUrlLambda);

    // Setup the API
    const api = new apigateway.RestApi(this, "TinyUrlApi", {
      deployOptions: {
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      }
    });
    const tinyUrls = api.root.addResource("tiny_urls");
    tinyUrls.addMethod("POST", new apigateway.LambdaIntegration(tinyUrlLambda));
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
