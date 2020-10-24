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

    if (links.length !== 0) {
      // TODO поправить 
      // return res.json({ sessionId: req.session.key, data: links });
    }

    return res.render('index', { title: 'Short your link' });
    // return res.status(400).json({ message: "Данных нет" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова" });
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
        message: `Нельзя указывать больше ${req.linkLimit} ссылок`,
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
        return res.json({ message: "Данный sub_part уже существует" });
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

    return res.redirect('/short');
    // return res.json({ link });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

module.exports = router;
