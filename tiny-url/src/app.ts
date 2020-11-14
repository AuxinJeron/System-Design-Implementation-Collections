import express = require("express")
import cors = require("cors")
import bodyParser = require("body-parser")
import awsServerlessExpressMiddleware = require("aws-serverless-express/middleware")
import { DynamoDBClient, GetItemCommand, GetItemOutput, PutItemCommand } from "@aws-sdk/client-dynamodb";

const BASE62_STR = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BASE = 62;

const tinyUrlTable: string = process.env.TABLE_NAME ? process.env.TABLE_NAME : "DEFAULT";
// const tinyUrlTablePrimaryKey: string = process.env.PRIMARY_KEY ? process.env.PRIMARY_KEY : "DEFAULT";
// const longUrlKey = "longUrl";

export const app = express();
const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

router.post("/tiny_urls", async (req: express.Request, res: express.Response) => {
    console.log("Create tiny url!");
    const dynamodb: DynamoDBClient = new DynamoDBClient({ region: "us-west-2" });
    const longUrl: string = req.body["longUrl"];

    let urlInteger: number = getRandomInt();
    let tinyUrl = "";
    while (urlInteger != 0) {
        console.log("url integer is : " + urlInteger.toString());
        tinyUrl = BASE62_STR[urlInteger % BASE] + tinyUrl;
        console.log("tiny string is : " + tinyUrl);
        urlInteger = Math.floor(urlInteger / BASE);
    }
    try {
        const command = new PutItemCommand({
            TableName: tinyUrlTable,
            Item: {
                "tinyUrl": { S: tinyUrl},
                "longUrl": { S: longUrl}
            }
        });
        await dynamodb.send(command);
    } catch (err) {
        console.log(err);
    }

    res.json({"tinyUrl": tinyUrl});
});

router.get("/tiny_urls/:tinyUrl", async (req: express.Request, res: express.Response) => {
    console.log("Get long url!");
    const dynamodb: DynamoDBClient = new DynamoDBClient({ region: "us-west-2" });
    // const urlInteger = 0;
    // const number = 1;
    // for (let i = tinyUrl.length - 1; i >= 0; i --) {
    //     urlInteger = urlInteger + number * BASE62_STR.indexOf(tinyUrl[i]);
    //     console.log("url integer is : " + urlInteger.toString());
    //     number = number * BASE;
    // }
    let result: GetItemOutput = {};
    const tinyUrl: string = req.params["tinyUrl"];
    try {
        const command = new GetItemCommand({
            TableName: tinyUrlTable,
            Key: {
                "tinyUrl": { S: tinyUrl }
            }
        });
        result = await dynamodb.send(command);
    } catch (err) {
        console.log(err);
    }
    res.json({"longUrl": result.Item ? result.Item["longUrl"] : "not found"});
});

function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

app.use("/", router);
app.use((_: express.Request, res: express.Response) => {
    console.log("Hello world!");
    res.send(404);
});



// app.listen(3000, () => {
//     console.log("Example app listening at http://localhost:3000");
// });