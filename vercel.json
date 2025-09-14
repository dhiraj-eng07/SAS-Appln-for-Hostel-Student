{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/pages/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/pages/$1"
    }
  ],
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "JWT_SECRET": "@jwt-secret",
    "POSTGRES_URL": "@postgres-url"
  }
}
