require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { urlMongo } = require('./consts');
const centralizedErrors = require('./middlewares/CentralizedErrors');
const { limiter } = require('./middlewares/limiter');
const routes = require('./routes/index');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// Модуль helmet поставляет автоматически заголовки безопасности
app.use(helmet());

const { NODE_ENV, MONGO_DB } = process.env;
const db = NODE_ENV === 'production' && MONGO_DB ? MONGO_DB : urlMongo;

// Подключаемся к серверу mongo
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors());

// Подключаем rate-limiter
app.use(limiter);

// Подключаем логгер запросов
app.use(requestLogger);

// Для собирания JSON-формата
app.use(bodyParser.json());
// Для приёма веб-страниц внутри POST-запроса
app.use(bodyParser.urlencoded({ extended: true }));

// Роутеры
app.use(routes);

// Подключаем логгер ошибок
app.use(errorLogger);

// Обработчик ошибок celebrate
app.use(errors());

// Централизованный обработчик ошибок
app.use(centralizedErrors);

app.listen(PORT);
