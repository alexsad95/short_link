const { Router } = require("express");
const Link = require("../models/Links");
const router = Router();

/**
 * Редирект на основную ссылку
 *
 * @param code - код(sub_part) сокращённой ссылки
 */
router.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOne({
      sessionId: req.session.key,
      code: req.params.code,
    });
    if (link) {
      return res.redirect(link.from);
    }
    return res.status(404).json({ message: "Ссылка не найдена" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

module.exports = router;
