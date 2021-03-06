const Article = require('../models/article');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const { noResources } = require('../consts');
const { noArticle } = require('../consts');
const { deleteYourArticles } = require('../consts');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .select('+owner')
    .then((articles) => {
      if (articles.length !== 0) {
        const data = articles.filter((item) => String(item.owner) === req.user._id);
        res.send({ articles: data });
      } else throw new NotFoundError(noResources);
    })
    .catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = req.user._id;
  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.status(201).send({ data: article }))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const { _id } = req.user;
  const { articleId } = req.params;

  Article.findOne({ _id: articleId }).select('+owner')
    .then((article) => {
      if (!article) {
        throw new NotFoundError(noArticle);
      }
      return article;
    })
    .then((article) => {
      if (String(article.owner) === _id) {
        Article.findByIdAndRemove(articleId)
          .then((data) => res.send(data))
          .catch(next);
      } else {
        throw new ForbiddenError(deleteYourArticles);
      }
    })
    .catch(next);
};
