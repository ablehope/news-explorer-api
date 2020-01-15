const { errorServer } = require('../consts');

// Централизованный обработчик ошибок
module.exports = ((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? errorServer
        : message,
    });
  next();
});
