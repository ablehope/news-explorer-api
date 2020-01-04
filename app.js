require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('./middlewares/cors');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login } = require('./controllers/users');
const { signinValidation, signupValidation } = require('./validationData');
const { urlMongo } = require('./consts');
const BadRequestError = require('./errors/BadRequestError');
const centralizedErrors = require('./middlewares/CentralizedErrors');
const { limiter } = require('./middlewares/limiter');
const { routerArticles, routerUsers } = require('./routes/index');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// Модуль helmet поставляет автоматически заголовки безопасности
app.use(helmet());

// Подключаемся к серверу mongo
mongoose.connect(urlMongo, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Подключаем rate-limiter
app.use(limiter);

// Подключаем логгер запросов
app.use(requestLogger);

// Для собирания JSON-формата
app.use(bodyParser.json());
// Для приёма веб-страниц внутри POST-запроса
app.use(bodyParser.urlencoded({ extended: true }));

// Роутеры не требующие авторизации, регистрация и логин(с валидацией)
app.post('/signup', signupValidation, createUser);
app.post('/signin', signinValidation, login);

// Авторизация
app.use(auth);

// Роутеры
app.use('/', routerArticles, routerUsers);

// Неправильная маршрутизация
app.use('*', (res, req, next) => {
  next(new BadRequestError('Запрашиваемый ресурс не найден'));
});

// Подключаем логгер ошибок
app.use(errorLogger);

// Обработчик ошибок celebrate
app.use(errors());

// Централизованный обработчик ошибок
app.use(centralizedErrors);

// Разрешение кросс-доменных запросов
app.use(cors);

app.listen(PORT);
