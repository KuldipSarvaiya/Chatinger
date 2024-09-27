import JWT from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  console.log("\n******authenticate api request");
  console.log(req.headers);

  // Allow unauthenticated requests for sign-in and sign-up routes
  if (req.url.includes("/auth/") && !req.url.includes("profile")) return next();

  // Check if the Authorization header exists
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: true, message: "No authorization header provided" });
  }

  // Split the Authorization header and check its structure
  const [bearer, jwt] = authHeader.split(" ");
  
  // Unauthorized access if header is missing the 'Bearer' keyword or the token
  if (bearer !== "Bearer" || !jwt) {
    return res.status(401).json({ error: true, message: "Invalid authorization format" });
  }

  console.log(JWT.decode(jwt));

  // Verify the JWT
  JWT.verify(jwt, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' }, (err, data) => {
    if (err) {
      console.log("#################################### problem");
      return res.status(401).json({ error: true, message: "JWT verification failed" });
    }

    // Attach the decoded token data to the request object
    req.auth = data;
    return next();
  });
}
