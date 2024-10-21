# API Gateway Project

This project is an **API Gateway** built with Node.js, Express, and axios, providing load balancing, service registration, and routing functionality. It enables clients to register APIs, balances traffic using various load-balancing strategies, sets limits on API requests based on their needs to prevent the service from being overwhelmed by a large volume of requests,and it also includes authentication to secure access.

## Table of Contents
- [API Gateway Project](#api-gateway-project)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Project Structure](#project-structure)
  - [Key Functionalities](#key-functionalities)
    - [1. API Registration](#1-api-registration)
    - [2. Load Balancing](#2-load-balancing)
    - [3. Service Enabling/Disabling](#3-service-enablingdisabling)
    - [4. Authentication](#4-authentication)
    - [5. Rate Limiting](#5-rate-limiting)
  - [Load Balancing Strategies](#load-balancing-strategies)
    - [1. Round Robin](#1-round-robin)
      - [2. Random](#2-random)
  - [Endpoints](#endpoints)

---

## Features

- **API Registration:** Allows services to register their endpoints with the gateway.
- **Load Balancing:** Supports round-robin and random load balancing strategies.
- **Service Enabling/Disabling:** Control which services are available for traffic routing.
- **Basic Authentication:** Protects routes with user-based authentication.
- **Dynamic Routing:** Routes API requests to the registered services based on the load balancing strategy.
- **Service Monitoring:** Provides a dashboard displaying registered services.
- **Rate Limiting:** Introduced rate limiting to control the number of requests a user can make to an API within a specified time window, preventing abuse and ensuring fair usage.
---

## Getting Started

### Prerequisites

Ensure that you have the following installed:
- Node.js (v12 or above)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BeminDawoud/API-Gateway.git
   cd API-Gateway
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the gateway:
   ```bash
   npm run dev
   ```
4. the GateWay will run on http://localhost:3000.

## Project Structure

```bash
├── fakeAPI/              # A simple API server to test with teh gateway
├── public/               # Static files (CSS, images)
├── routes/               # API routes and registry configuration
│   ├── index.js          # Main API routes
│   ├── registry.json     # Registered services
├── util/                 # Utility functions 
│   ├── loadBalancer.js   # load balancer strategies
│   ├── rate-limit.js     # Rate limiting
├── views/                # EJS view templates
├── gateway.js            # Main Express server setup for gateway
├── README.md             # Project documentation
└── package.json          # Project metadata and dependencies
```

## Key Functionalities

### 1. API Registration

The `/register` endpoint allows services to register with the gateway. When a service is registered, it includes details such as:

- Protocol
- Host
- Port
- API Name

**Example registration request:**

```json
{
  "protocol": "http",
  "host": "localhost",
  "port": "4000",
  "apiName": "serviceA"
}
```
### 2. Load Balancing

Load balancing strategies distribute requests across service instances. Two strategies are implemented:

- **Round Robin**: Sequentially routes requests across all instances.
- **Random**: Routes requests to a random instance.

The strategy is stored per service and can be configured in the `registry.json`.

### 3. Service Enabling/Disabling

Services can be enabled or disabled via the `/enable/:apiName` endpoint. When a service is disabled, it will be skipped by the load balancer.

**Example enable/disable request:**

```json
{
  "url": "http://localhost:4000/",
  "enabled": false
}
```

### 4. Authentication

Basic authentication is required for accessing routes. The `Authorization` header must include the Base64-encoded username and password of registered users.

**Example of sending an authenticated request:**

```bash
curl -H "Authorization: Basic dXNlcjpwYXNz" http://localhost:3000/home
```
**Authentication Implementation**

Basic Authentication secures API access. Credentials are checked against the `registry.json` file, which contains a list of users and passwords.


### 5. Rate Limiting
**Testing the Rate Limiting Functionality**

To test the rate limiting functionality, you can use the following `curl` command to overload the requests:

```bash
curl --location 'http://localhost:3000/api/users/1' \
--header 'Authorization: Basic ************'
```
you can run this command multiple times through a loop in a bash script or what ever tool you like to see the rate limiting in action, receiving a 429 Too Many Requests response after exceeding the limit.

## Load Balancing Strategies

### 1. Round Robin

The Round Robin strategy sequentially routes requests across all instances of a service.


#### 2. Random

The Random strategy routes requests to a random instance of a service.


Both strategies work by balancing traffic across enabled instances.

## Endpoints

- **POST /register**  
  Registers a new API service.  
  **Body parameters:** `protocol`, `host`, `port`, `apiName`

- **POST /unregister**  
  Unregisters an API service.  
  **Body parameters:** `protocol`, `host`, `port`, `apiName`

- **POST /enable/**  
  Enables or disables a specific service instance.  
  **Body parameters:** `url`, `enabled`

- **ALL /apiName**  
  Forwards incoming requests to the appropriate service instance based on the load balancing strategy.

