import { exec } from "child_process";
import express from "express";

const hostname = "127.0.0.1";
const port = 3015;

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(express.static("dist"));

app.post("/", ({ body }, res) => {
  if (body.payload) {
    console.log(
      "Got Webhook update from: ",
      JSON.parse(body.payload).repository.full_name
    );
  }
  res.set("Content-Type", "text/plain");
  res.send(`Thanks`);
  exec("npm run update", (error, stdout, stderr) => {
    if (error) console.log(error);
    console.log(stdout);
  });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
