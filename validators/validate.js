const { check } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "add_url": {
      return [
        check("subpart")
          .trim()
          .matches(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .withMessage('"subpart" is not written correctly'),
        check("from")
          .trim()
          .not()
          .isEmpty()
          .withMessage('The "from" field must not be empty')
          .matches(
            /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
          )
          .withMessage('The "from" field must contain the correct link'),
      ];
    }
  }
};
