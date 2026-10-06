# ProductHub API

A full-stack product catalog built with **Node.js**, **Express**, and **vanilla JavaScript**. The application serves a responsive browser interface and a REST API for browsing and managing products.

## Overview

ProductHub brings common catalog workflows into one small application: browse and search a product list, refine results with filters and sorting, save favorites, review catalog statistics, and create, edit, or delete products. The browser client communicates with the Express API using the Fetch API.

## About the author

**Rachit Tripathi** · [GitHub: @rachit1807](https://github.com/rachit1807)

I am an aspiring software developer interested in full-stack web development and building practical applications. I created ProductHub to apply REST API design, Express.js, CRUD operations, input validation, and browser-to-server integration in one project.

## Features

- **Catalog browsing** — load products and view detailed product information.
- **Search and discovery** — search by product ID or name, filter by category, and sort by price or name.
- **Favorites** — add and remove favorites, then switch between the full catalog and saved items.
- **Product management** — add products, edit existing details, and delete products through the interface or API.
- **Catalog statistics** — view product count, category count, average price, and saved-favorite count.
- **Interface details** — responsive layout, dark mode, toast feedback, and product detail and edit dialogs.
- **Input validation** — API checks required text fields and non-negative numeric prices.

## Technology

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Server and API | Express 5 |
| Browser interface | HTML, CSS, JavaScript |
| HTTP requests | Fetch API |
| Browser preferences | `localStorage` |

## Getting started

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
git clone <repository-url>
cd ProductHub-API
npm install
npm start
```

Open [http://localhost:8081](http://localhost:8081) to use the application. The API status endpoint is available at [http://localhost:8081/api](http://localhost:8081/api).

The server uses port `8081`, configured in `server.js`.

## REST API

All API routes are prefixed with `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api` | API status |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Retrieve one product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update one or more product fields |
| `DELETE` | `/api/products/:id` | Delete a product |

### Product representation

```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "category": "Electronics",
  "price": 799,
  "description": ""
}
```

`id` is assigned by the server. A product requires a non-empty `name`, a non-empty `category`, and a numeric `price` greater than or equal to zero. `description` is optional.

### Create a product

```bash
curl -X POST http://localhost:8081/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"USB-C Hub","category":"Electronics","price":1499,"description":"7-in-1 adapter"}'
```

### Update a product

Updates can include one or more fields:

```bash
curl -X PUT http://localhost:8081/api/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"price":899}'
```

### Delete a product

```bash
curl -X DELETE http://localhost:8081/api/products/1
```

### Responses and errors

Responses are JSON. Successful responses include `success: true`; product results are returned in `data`. Validation errors return HTTP `400`, and requests for a product ID that does not exist return HTTP `404`.

## Application structure

```text
ProductHub-API/
├── controllers/
│   └── productController.js  # Product CRUD and validation
├── data/
│   └── products.js           # Starter catalog
├── public/
│   ├── app.js                # Browser behavior and API requests
│   ├── index.html            # Page structure
│   └── style.css             # Layout, themes, and responsive styles
├── routes/
│   └── api.js                # API route definitions
├── server.js                 # Express app and static file server
└── package.json
```

## Data and current scope

The starter catalog and API mutations are held in server memory. New, updated, or deleted products remain available until the server stops; restarting the server restores the starter catalog. Favorites and the theme preference are saved in the browser's `localStorage`.

The project currently does not include a database or an automated test suite.
