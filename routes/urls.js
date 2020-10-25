const { Router } = require("express");
const config = require("config");
const shortid = require("shortid");
const Links = require("../models/Links");
const { getCache, addCache } = require("../utils/cache");
const { validate } = require("../validators/validate");
const { validationResult } = require("express-validator");
const logger = require("../logger/logger");

const router = Router();

/**
 * Вывод всех ссылок. Главная страница
 *
 * @returns {json}
 */
router.get("/", getCache, async (req, res) => {
  try {
    const links = await Links.find({ sessionId: req.session.key });
    return res.render("index", { title: "Short your link", data: links });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * Добавление ссылки пользователя
 *
 * @param {String} subpart - можно указать свой код для ссылки
 * @param {String} from - ссылка для сокращения
 * @returns {json}
 */
router.post("/add_url", getCache, validate("add_url"), async (req, res) => {
  try {
    // проверка на ошибки при валидации
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.warn(
        `Validator finded input errors: ${JSON.stringify(errors.array())}`
      );
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // проверка на лимит ссылок
    if (typeof req.linkLimit !== "undefined") {
      logger.warn(`User has exceeded the link limit: ${req.linkLimit}`);
      return res.json({
        error: `You cannot specify more than ${req.linkLimit} links`,
      });
    }
    if (!req.session.key) {
      req.session.key = req.sessionID;
    }

    // проверка на наличие subpart
    let code;
    if (req.body.subpart) {
      code = req.body.subpart.split(" ").join("");

      const sub_part = await Links.findOne({
        code,
        sessionId: req.session.key,
      });

      if (sub_part) {
        return res.status(400).json({
          error: "The given subpart already exists",
        });
      }
    } else {
      code = shortid.generate();
    }

    const from = req.body.from;
    const to = config.get("baseUrl") + "/" + code;

    const data = {
      sessionId: req.session.key,
      code,
      from,
      to,
    };

    const link = new Links(data);
    await link.save();

    // кеширование записи
    addCache(String(req.session.key), JSON.stringify(link));

    return res.json({ link });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
