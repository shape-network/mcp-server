import { type Middleware } from 'xmcp';

const middleware: Middleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // TODO: add auth checks, rate limiting, etc.
  // if (!customHeaderValidation(authHeader)) {
  //   res.status(401).json({ error: "Invalid API key" });
  //   return;
  // }

  console.log(
    'middleware',
    JSON.stringify(
      {
        body: req.body,
        headers: req.headers,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
      },
      null,
      2
    )
  );

  return next();
};

export default middleware;
