const { check } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    case 'add_url': {
      return [
        check("subpart")
          .trim()
          .matches(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .withMessage("Не правильно записан subpart"),
        check("from")
          .trim()
          .not()
          .isEmpty()
          .withMessage("Поле from не должно быть пустым")
          .matches(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/)
          .withMessage("Поле from должно содержать правильную ссылку")
      ]
    }
  }
}