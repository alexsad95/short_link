/*
--------------TODO проекта------------
--------------------------------------
Обязательные требования:
+ Приложение НЕ содержит авторизации
+ Приложение отслеживает юзеров по сессии, т.е. у каждого юзера свой набор редиректов (правил)
+ Данные хранятся в MongoDB
+ При заходе на сжатый URL приложение редиректит на соответствующий URL (который был сжат)
+ Пользователь по желанию может указать свой <subpart>. Если такой <subpart> уже используется, нужно сообщить об этом юзеру
  + сделать проверку на существующий
+ Реализация на NodeJS (Express)
+ Кэширование редиректов в редисе
+ Очистка старых правил по расписанию
  + очистка в редисе 
  + очистка в монго 
+ ограничить кол-во записей на сессию (от спама ссылок)(10 ссылок)

-+ интерфейс, клиентская часть, страница, форма, таблица с паг.
    + верстка
    + стили
    + пагинация
    - добавл. алерта на ошибки

- валидация, проверки, обработка ошибок
- логгирование

- документация, комменты
- рефакторинг, проверка всего кода на правильность и ошибки, чистота кода

- докеризация, компос
*/
const path = require("path");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const session = require("express-session");
const redisStorage = require("connect-redis")(session);
const client = require("./utils/redis");
const mongoose = require("mongoose");

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
app.use(express.static('public'));

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

    app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

main();
