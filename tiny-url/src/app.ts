import express = require("express")

export const app = express();

app.post("/tiny_urls", (_: express.Request, res: express.Response) => {
    console.log("Create tiny url!");
    res.send("Create tiny url!");
});

app.get("/tiny_urls/:tinyUrl", (_: express.Request, res: express.Response) => {
    console.log("Get long url!");
    res.send("Get long url!");
});

// app.listen(3000, () => {
//     console.log("Example app listening at http://localhost:3000");
// });