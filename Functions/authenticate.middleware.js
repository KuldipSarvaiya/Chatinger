import JWT from "jsonwebtoken";

export default function authMiddleware(req, res, next) {

  if (req.url.includes("/auth/") && !req.url.includes("profile")) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: true, message: "No authorization header provided" });
  }

  const [bearer, jwt] = authHeader.split(" ");
  
  if (bearer !== "Bearer" || !jwt) {
    return res.status(401).json({ error: true, message: "Invalid authorization format" });
  }

  console.log(JWT.decode(jwt));

  JWT.verify(jwt, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' }, (err, data) => {
    if (err) {
      console.log("#################################### problem");
      return res.status(401).json({ error: true, message: "JWT verification failed" });
    }

    req.auth = data;
    return next();
  });
}
