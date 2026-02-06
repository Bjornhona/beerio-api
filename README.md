# Beerio API

A RESTful API backend for beer discovery and tracking, built with Express and MongoDB. Integrates with [Open Brewery DB](https://www.openbrewerydb.org/) to power beer searches, styles, categories, and brewery information. Includes session-based authentication and user favorites.

## Features

- **Authentication** — Sign up, login, logout with bcrypt password hashing
- **Beer discovery** — Browse beers, search by type (beer/brewery), view styles, categories, and glassware
- **User favorites** — Save and manage favorite beers (requires login)
- **Brewery data** — Fetch breweries, locations by zip code, and brewery details
- **Session management** — MongoDB-backed sessions with CORS support for frontend apps

## Tech Stack

- **Runtime:** Node.js ^18
- **Framework:** Express 4.x
- **Database:** MongoDB (Mongoose ODM)
- **Session store:** connect-mongo
- **Auth:** bcrypt, express-session
- **External API:** [Open Brewery DB](https://www.openbrewerydb.org/documentation/01-getting-started)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- [Open Brewery DB API key](https://www.openbrewerydb.org/documentation/01-getting-started) (free)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/beerio-api.git
cd beerio-api
npm install
```

### Environment Variables

Create a `.env` file in the project root with:

```env
MONGODB_URI=mongodb://localhost:27017/beeriodb
BREWERYDB_KEY=your_openbrewerydb_api_key
PUBLIC_DOMAIN=http://localhost:3000
PORT=8080
```

| Variable       | Description                                          |
|----------------|------------------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string                            |
| `BREWERYDB_KEY`| API key from [Open Brewery DB](https://www.openbrewerydb.org/documentation/01-getting-started) |
| `PUBLIC_DOMAIN`| Allowed origin for CORS (your frontend URL)          |
| `PORT`         | Server port (default: 8080)                          |

### Run

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:8080` (or your configured `PORT`).

## API Reference

### Health

| Method | Endpoint | Description      |
|--------|----------|------------------|
| GET    | `/`      | Basic health check |

### Auth (`/auth`)

| Method | Endpoint   | Description                    | Auth required |
|--------|------------|--------------------------------|---------------|
| POST   | `/auth/signup` | Create account (`username`, `password`) | No  |
| POST   | `/auth/login`  | Login (`username`, `password`)          | No  |
| POST   | `/auth/logout` | Logout                               | No  |
| GET    | `/auth/me`     | Get current session user              | No  |
| GET    | `/auth/home`   | Protected route example               | Yes |

### Beers (`/beers`)

| Method | Endpoint                          | Description                          | Auth required |
|--------|-----------------------------------|--------------------------------------|---------------|
| GET    | `/beers`                          | List beers (with labels)             | No            |
| GET    | `/beers/:id`                      | Get beer by ID                       | No            |
| GET    | `/beers/search/:type/:query`      | Search beers or breweries (`type`: `beer` or `brewery`) | No |
| GET    | `/beers/favorites`                | Get user's favorite beers            | Yes           |
| PUT    | `/beers`                          | Toggle favorite (`id`, `name`, `isOrganic`, `icon`, `style`) | Yes |
| GET    | `/beers/styles`                   | List beer styles                     | No            |
| GET    | `/beers/categories`               | List beer categories                 | No            |
| GET    | `/beers/glassware`                | List glassware types                 | No            |
| GET    | `/beers/breweries`                | List breweries                       | No            |
| GET    | `/beers/brewery/:breweryId`       | Get brewery details                  | No            |
| GET    | `/beers/brewery/:breweryId/locations` | Get brewery locations            | No            |
| GET    | `/beers/locations/:zipCode`       | Get breweries/locations by zip code  | No            |

## Project Structure

```
beerio-api/
├── bin/www           # Server entry point
├── app.js            # Express app setup, middleware, routes
├── routes/
│   ├── auth.js       # Auth endpoints
│   └── beers.js      # Beer & brewery endpoints
├── models/
│   └── user.js       # User schema (username, password, favorites)
├── helpers/
│   └── middlewares.js # Auth middleware (isLoggedIn)
└── public/           # Static assets
```

## CORS

Allowed origins include `localhost:3000`, `localhost:5173`, and `PUBLIC_DOMAIN`. Update `allowedOrigins` in `app.js` to add more frontend URLs.

## License

MIT
