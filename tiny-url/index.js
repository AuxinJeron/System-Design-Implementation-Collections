"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apigateway = require("@aws-cdk/aws-apigateway");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const lambda = require("@aws-cdk/aws-lambda");
const cdk = require("@aws-cdk/core");
class TinyUrlStack extends cdk.Stack {
    constructor(app, id) {
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
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: dynamodbTable.tableName,
                PRIMARY_KEY: "tinyUrl",
            },
        });
        const describeTinyUrlLambda = new lambda.Function(this, "DescribeTinyUrlLambda", {
            code: new lambda.AssetCode("src"),
            handler: "tiny_url.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: dynamodbTable.tableName,
                PRIMARY_KEY: "tinyUrl",
            },
        });
        dynamodbTable.grantReadWriteData(createTinyUrlLambda);
        dynamodbTable.grantReadData(describeTinyUrlLambda);
        // Setup the API
        const api = new apigateway.RestApi(this, "TinyUrlApi");
        const tinyUrls = api.root.addResource("tiny_urls");
        tinyUrls.addMethod("POST", new apigateway.LambdaIntegration(createTinyUrlLambda));
        addCorsOptions(tinyUrls);
        const tinyUrl = tinyUrls.addResource("{tinyUrl}");
        tinyUrl.addMethod("GET", new apigateway.LambdaIntegration(describeTinyUrlLambda));
        addCorsOptions(tinyUrl);
    }
}
exports.TinyUrlStack = TinyUrlStack;
function addCorsOptions(apiResource) {
    apiResource.addMethod("OPTIONS", new apigateway.MockIntegration({
        integrationResponses: [
            {
                statusCode: "200",
                responseParameters: {
                    "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
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
    }), {
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
    });
}
const app = new cdk.App();
new TinyUrlStack(app, "TinyUrlStack");
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUF1RDtBQUN2RCxrREFBbUQ7QUFDbkQsOENBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN6QyxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFZiwyQkFBMkI7UUFDM0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDekQsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxTQUFTLEVBQUUsVUFBVTtZQUNyQixtREFBbUQ7WUFDbkQseURBQXlEO1lBQ3pELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDeEMsQ0FBQyxDQUFDO1FBRUgsbUJBQW1CO1FBQ25CLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUMzRSxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNqQyxPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDbEMsV0FBVyxFQUFFO2dCQUNYLFVBQVUsRUFBRSxhQUFhLENBQUMsU0FBUztnQkFDbkMsV0FBVyxFQUFFLFNBQVM7YUFDdkI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDL0UsSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDakMsT0FBTyxFQUFFLGtCQUFrQjtZQUMzQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLFdBQVcsRUFBRTtnQkFDWCxVQUFVLEVBQUUsYUFBYSxDQUFDLFNBQVM7Z0JBQ25DLFdBQVcsRUFBRSxTQUFTO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsYUFBYSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRW5ELGdCQUFnQjtRQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUNsRixjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDbEYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRjtBQWxERCxvQ0FrREM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxXQUFpQztJQUN2RCxXQUFXLENBQUMsU0FBUyxDQUNuQixTQUFTLEVBQ1QsSUFBSSxVQUFVLENBQUMsZUFBZSxDQUFDO1FBQzdCLG9CQUFvQixFQUFFO1lBQ3BCO2dCQUNFLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixrQkFBa0IsRUFBRTtvQkFDbEIscURBQXFELEVBQ25ELHlGQUF5RjtvQkFDM0Ysb0RBQW9ELEVBQUUsS0FBSztvQkFDM0QseURBQXlELEVBQUUsU0FBUztvQkFDcEUscURBQXFELEVBQUUsK0JBQStCO2lCQUN2RjthQUNGO1NBQ0Y7UUFDRCxtQkFBbUIsRUFBRSxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSztRQUN6RCxnQkFBZ0IsRUFBRTtZQUNoQixrQkFBa0IsRUFBRSx1QkFBdUI7U0FDNUM7S0FDRixDQUFDLEVBQ0Y7UUFDRSxlQUFlLEVBQUU7WUFDZjtnQkFDRSxVQUFVLEVBQUUsS0FBSztnQkFDakIsa0JBQWtCLEVBQUU7b0JBQ2xCLHFEQUFxRCxFQUFFLElBQUk7b0JBQzNELHFEQUFxRCxFQUFFLElBQUk7b0JBQzNELHlEQUF5RCxFQUFFLElBQUk7b0JBQy9ELG9EQUFvRCxFQUFFLElBQUk7aUJBQzNEO2FBQ0Y7U0FDRjtLQUNGLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFwaWdhdGV3YXkgPSByZXF1aXJlKFwiQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXlcIik7XG5pbXBvcnQgZHluYW1vZGIgPSByZXF1aXJlKFwiQGF3cy1jZGsvYXdzLWR5bmFtb2RiXCIpO1xuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoXCJAYXdzLWNkay9hd3MtbGFtYmRhXCIpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoXCJAYXdzLWNkay9jb3JlXCIpO1xuXG5leHBvcnQgY2xhc3MgVGlueVVybFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3IoYXBwOiBjZGsuQXBwLCBpZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYXBwLCBpZCk7XG5cbiAgICAvLyBTZXR1cCB0aGUgZHluYW1vZGIgdGFibGVcbiAgICBjb25zdCBkeW5hbW9kYlRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsIFwiVGlueVVybHNcIiwge1xuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6IFwidGlueVVybFwiLFxuICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgIH0sXG4gICAgICB0YWJsZU5hbWU6IFwiVGlueVVybHNcIixcbiAgICAgIC8vIFJldGFpbiB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZSB0aGUgbmV3IHRhYmxlLlxuICAgICAgLy8gSXQgd2lsbCByZW1haW4gaW4geW91ciBhY2NvdW50IHVudGlsIG1hbnVhbGx5IGRlbGV0ZWQuXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCB0aGUgbGFtYmRhXG4gICAgY29uc3QgY3JlYXRlVGlueVVybExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJDcmVhdGVUaW55VXJsTGFtYmRhXCIsIHtcbiAgICAgIGNvZGU6IG5ldyBsYW1iZGEuQXNzZXRDb2RlKFwic3JjXCIpLFxuICAgICAgaGFuZGxlcjogXCJ0aW55X3VybC5oYW5kbGVyXCIsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM184LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVEFCTEVfTkFNRTogZHluYW1vZGJUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIFBSSU1BUllfS0VZOiBcInRpbnlVcmxcIixcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBkZXNjcmliZVRpbnlVcmxMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiRGVzY3JpYmVUaW55VXJsTGFtYmRhXCIsIHtcbiAgICAgIGNvZGU6IG5ldyBsYW1iZGEuQXNzZXRDb2RlKFwic3JjXCIpLFxuICAgICAgaGFuZGxlcjogXCJ0aW55X3VybC5oYW5kbGVyXCIsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM184LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVEFCTEVfTkFNRTogZHluYW1vZGJUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIFBSSU1BUllfS0VZOiBcInRpbnlVcmxcIixcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBkeW5hbW9kYlRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShjcmVhdGVUaW55VXJsTGFtYmRhKTtcbiAgICBkeW5hbW9kYlRhYmxlLmdyYW50UmVhZERhdGEoZGVzY3JpYmVUaW55VXJsTGFtYmRhKTtcblxuICAgIC8vIFNldHVwIHRoZSBBUElcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiVGlueVVybEFwaVwiKTtcbiAgICBjb25zdCB0aW55VXJscyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwidGlueV91cmxzXCIpO1xuICAgIHRpbnlVcmxzLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3JlYXRlVGlueVVybExhbWJkYSkpO1xuICAgIGFkZENvcnNPcHRpb25zKHRpbnlVcmxzKTtcblxuICAgIGNvbnN0IHRpbnlVcmwgPSB0aW55VXJscy5hZGRSZXNvdXJjZShcInt0aW55VXJsfVwiKTtcbiAgICB0aW55VXJsLmFkZE1ldGhvZChcIkdFVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihkZXNjcmliZVRpbnlVcmxMYW1iZGEpKTtcbiAgICBhZGRDb3JzT3B0aW9ucyh0aW55VXJsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRDb3JzT3B0aW9ucyhhcGlSZXNvdXJjZTogYXBpZ2F0ZXdheS5JUmVzb3VyY2UpIHtcbiAgYXBpUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgIFwiT1BUSU9OU1wiLFxuICAgIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG4gICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuLFgtQW16LVVzZXItQWdlbnQnXCIsXG4gICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiJyonXCIsXG4gICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIjogXCInZmFsc2UnXCIsXG4gICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIidPUFRJT05TLEdFVCxQVVQsUE9TVCxERUxFVEUnXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBcIntcXFwic3RhdHVzQ29kZVxcXCI6IDIwMH1cIixcbiAgICAgIH0sXG4gICAgfSksXG4gICAge1xuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9XG4gICk7XG59XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5uZXcgVGlueVVybFN0YWNrKGFwcCwgXCJUaW55VXJsU3RhY2tcIik7XG5hcHAuc3ludGgoKTtcbiJdfQ==