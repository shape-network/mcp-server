import { type Middleware } from 'xmcp';
import rateLimit from 'express-rate-limit';

// Rate limit deployed version, tweak or remove when self-hosting.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 75, // limit each IP requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // Disable X-Forwarded-For validation
  },
});

const middleware: Middleware = async (req, res, next) => {
  // Only rate limit in production deployed MCP server.
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  return new Promise((resolve, reject) => {
    limiter(req, res, (err) => {
      if (err) {
        reject(err);
        return;
      }

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

      resolve(next());
    });
  });
};

export default middleware;
