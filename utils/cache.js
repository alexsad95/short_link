const client = require("../utils/redis");
const config = require("config");

const linkLimit = config.get("linkLimit") || 200;

/**
 * Middleware для вывода кеша и установки ограничения
 */
function getCache(req, res, next) {
  let data = [];
  if (typeof req.session.key === "undefined") {
    next();
    return;
  }

  const sessionId = req.session.key;

  // если роут '/' выводит все ссылки с кэша
  // если '/add_url' проверка на кол-во ссылока для ограничения
  client.lrange(sessionId, 0, -1, (err, response) => {
    if (err) throw err;

    if (req.route.path == "/" && response.length !== 0) {
      response.forEach((elem) => data.push(JSON.parse(elem)));
      return res.render('index', { title: 'Short your link', data });
      // return res.json({ sessionId, data });
    } else if (req.route.path == "/add_url" && response.length >= linkLimit) {
      req.linkLimit = linkLimit;
      next();
    } else {
      next();
    }
  });
}

/**
 * Кеширование ссылок. Добавляет как список
 */
function addCache(key, value) {
  client.rpush(key, value, (err) => {
    if (err) throw err;
  });
  // устанавливает время сущ. списка
  client.expire(key, config.get("timeLiveLink"));
}

module.exports = { getCache, addCache };
