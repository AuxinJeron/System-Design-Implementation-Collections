import awsServerlessExpress = require("aws-serverless-express")
import { app } from "./app";
const server = awsServerlessExpress.createServer(app);

export const handler = async (event: any = {}, context: any = {}): Promise<any> => {
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2));
  console.info("EVENT\n" + JSON.stringify(event, null, 2));
  console.info("CONTEXT\n" + JSON.stringify(context, null, 2));
  awsServerlessExpress.proxy(server, event, context);
};
