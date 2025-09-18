---

# URL Shortener Microservice with MERN Stack

## Overview

This project is a **URL Shortener Microservice** built using the **MERN stack**.
It provides an API for shortening URLs, tracking usage statistics, and retrieving detailed analytics for each shortened URL.
The frontend is built in **React (Material UI)** and consumes the backend APIs without re-implementing shortening logic.

---

## Features

### Backend (Node.js + Express + MongoDB)

* **Shorten URLs** with optional:

  * Custom shortcode
  * Expiry (validity in minutes, default: 30)
* **Redirects** to the original URL when a shortcode is accessed.
* **Statistics API** to retrieve:

  * Original URL, creation date, expiry date
  * Total clicks
  * Per-click details: timestamp, referrer, source IP, and coarse location
* **Logging Middleware** integrated with `pino` for structured logging (no `console.log`).

### Frontend (React + Material UI)

* **URL Shortener Page**

  * Shorten up to 5 URLs concurrently
  * Client-side validation (valid URL format, shortcode rules, numeric validity)
  * Displays shortened link with expiry date for each input
* **Statistics Page**

  * Lists all shortened URLs created in the session
  * Displays total clicks and click-level details (timestamp, referrer, location)
* **Material UI Styling** for a clean, user-focused interface
* Runs strictly on `http://localhost:3000`

---

## Tech Stack

### Backend

* **Node.js + Express**: API development
* **MongoDB (Mongoose)**: Database
* **pino + pino-http**: Logging middleware
* **helmet**: Security headers
* **valid-url**: URL validation
* **shortid**: Shortcode generation
* **geoip-lite**: Coarse location lookup
* **dotenv**: Environment configuration

### Frontend

* **React**
* **Material UI (MUI)**
* **Axios** for API communication

---

## API Endpoints

### 1. Shorten a URL

**POST** `/api/shorturls`

**Request Body**:

```json
{
  "url": "https://example.com",
  "validity": 60,
  "shortcode": "custom123"
}
```

**Response (201)**:

```json
{
  "shortLink": "http://localhost:5000/api/custom123",
  "expiry": "2025-09-18T10:45:00.000Z"
}
```

---

### 2. Retrieve Short URL Statistics

**GET** `/api/shorturls/:shortcode`

**Response (200)**:

```json
{
  "shortcode": "custom123",
  "originalUrl": "https://example.com",
  "createdAt": "2025-09-18T10:15:00.000Z",
  "expiry": "2025-09-18T10:45:00.000Z",
  "totalClicks": 5,
  "clicks": [
    {
      "timestamp": "2025-09-18T10:20:00.000Z",
      "referrer": "http://google.com",
      "location": "IN"
    }
  ]
}
```

---

### 3. Redirect Short URL

**GET** `/api/:shortcode`

Redirects to the original URL if valid and not expired.

---

## Running the Project

### Backend

```bash
cd backend
npm install
npm start
```

Runs on: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on: `http://localhost:3000`

---

## Logging

* All requests and errors are logged using `pino`.
* No use of `console.log` is allowed.
* Logs include request details, status, and error information.

---

## Future Enhancements

* Persistent frontend statistics history across sessions.
* More detailed geolocation using an external service.
* Authentication for managing user-specific short URLs.

---


