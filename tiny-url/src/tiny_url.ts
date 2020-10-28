import awsServerlessExpress = require("aws-serverless-express")
import { app } from "./app";
const server = awsServerlessExpress.createServer(app);

export const handler = async (event: any = {}, context: any = {}): Promise<any> => {
  awsServerlessExpress.proxy(server, event, context);
};