const { Router } = require("express");
const config = require("config");
const shortid = require("shortid");
const Links = require("../models/Links");
const { getCache, addCache } = require("../utils/cache");

const router = Router();

/**
 * Вывод всех ссылок
 *
 * @returns {json}
 */
router.get("/", getCache, async (req, res) => {
  try {
    const links = await Links.find({ sessionId: req.session.key });

    return res.render('index', { title: 'Short your link', data: links });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "Что-то пошло не так" });
  }
});

/**
 * Добавление ссылки пользователя
 *
 * @param {String} subpart - можно указать свой код для ссылки
 * @param {String} from - ссылка для сокращения
 * @returns {json}
 */
router.post("/add_url", getCache, async (req, res) => {
  try {
    if (typeof req.linkLimit !== "undefined") {
      return res.json({
        error: `Нельзя указывать больше ${req.linkLimit} ссылок`,
      });
    }
    if (!req.session.key) {
      req.session.key = req.sessionID;
    }

    // посмотреть и исправить
    if (req.body.subpart) {
      const sub_part = await Links.findOne({
        sessionId: req.session.key,
        code: req.body.subpart,
      });
      if (sub_part) {
        return res.json({
          error: 'Данный sub_part уже существует'
        });
      }
    }

    // посмотреть и исправить
    const code = req.body.subpart ? req.body.subpart : shortid.generate();
    // проверка, валидация ссылок
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

    return res.json({link});
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "Что-то пошло не так" });
  }
});

module.exports = router;
