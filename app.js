const path = require("path");
const config = require("config");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const redisStorage = require("connect-redis")(session);
const mongoose = require("mongoose");
const logger = require("./logger/logger");
const client = require("./utils/redis");

const PORT = config.get("mongoPort") || 7000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// настрокйка сессий
app.use(
  session({
    store: new redisStorage({
      host: config.get("host"),
      port: config.get("redisPort"),
      client: client,
      ttl: config.get("timeLiveLink"),
    }),
    resave: true,
    secret: "someSecretKey",
    saveUninitialized: true,
  })
);

// обработка статики
app.use(express.static("public"));

// настройка шаблонизатора
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// подгрузка роутов
app.use("/short/", require("./routes/urls"));
app.use("/", require("./routes/redirect"));

async function main() {
  try {
    await mongoose.connect(config.get("mongoUri"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
  } catch (e) {
    logger.error(`Server Error: ${e.message}`);
    process.exit(1);
  }
}

main();
