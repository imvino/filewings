const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

const notFound = (req, res, next) => {
  res.status(404).send('Sorry, page not found');
};

module.exports = {
  errorHandler,
  notFound,
};
