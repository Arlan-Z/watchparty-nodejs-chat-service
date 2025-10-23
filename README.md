# API Documentation: Chat Service

## 1. Overview

**Chat Service** is a real-time backend service built with Node.js, Express, MongoDB, and Socket.IO. It provides an API for creating chat rooms, exchanging real-time messages, and storing chat history.

The service is designed to run in Docker containers, ensuring easy deployment and scalability.

### Key Features

* **Real-time communication:** Instant message delivery using WebSockets (Socket.IO).
* **Isolated rooms:** Communication takes place within rooms identified by `roomId`.
* **Message storage:** All chat history is stored in a MongoDB database.
* **REST API for history:** Retrieve the full message history of any room through a simple GET request.
* **Docker-ready:** Fully configured to run with Docker and Docker Compose.

### Technology Stack

* **Runtime:** Node.js
* **Web framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Real-time protocol:** Socket.IO
* **Containerization:** Docker, Docker Compose



## 2. Getting Started

### Requirements

* [Docker](https://www.docker.com/get-started/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Installation and Run

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Create a `.env` file** in the project root. This file contains environment variables required for the service. Use the following template:

   ```.env
   # Port that will be exposed on your machine to access the service
   PORT=5000
   ```

3. **Start the services using Docker Compose**
   Run the following command in the project root. It will build your application image, pull the MongoDB image, and launch both containers in the background.

   ```bash
   docker-compose up --build -d
   ```

After a successful start, the service will be available at `http://localhost:5000`.

---

## 3. Configuration

The service is configured via environment variables.

| Variable     | Description                                                            | Defined in           | Example  |
| ------------ | ---------------------------------------------------------------------- | -------------------- | -------- |
| `PORT`       | External and internal port where the Express server and Socket.IO run. | `.env`               | `5000`   |
| `MONGO_HOST` | Hostname (Docker service name) for connecting to MongoDB.              | `docker-compose.yml` | `mongo`  |
| `MONGO_PORT` | Port used to connect to MongoDB inside the Docker network.             | `docker-compose.yml` | `27017`  |
| `MONGO_DB`   | Name of the MongoDB database used to store messages.                   | `docker-compose.yml` | `chatdb` |

---

## 4. REST API

This API is primarily used to fetch initial data, such as message history.

### Get Room Message History

* **Endpoint:** `GET /api/chat/:roomId`

* **Description:** Returns an array of all messages for a given room, sorted by creation time.

* **URL Parameters:**

  * `roomId` (string, required) — Unique identifier of the chat room.

* **Successful Response (200 OK):**

  ```json
  [
    {
      "_id": "64c5f0a4a1b2c3d4e5f6a7b8",
      "senderId": "user-123",
      "content": "Hello everyone!",
      "roomId": "room-42",
      "createdAt": "2023-08-01T12:00:00.000Z",
      "updatedAt": "2023-08-01T12:00:00.000Z"
    },
    {
      "_id": "64c5f0b5b1c2d3e4f5a6b7c9",
      "senderId": "user-456",
      "content": "Hi! How are you?",
      "roomId": "room-42",
      "createdAt": "2023-08-01T12:01:00.000Z",
      "updatedAt": "2023-08-01T12:01:00.000Z"
    }
  ]
  ```

* **Error Response (500 Internal Server Error):**

  ```json
  {
    "error": "Failed to get messages"
  }
  ```

---

## 5. Real-time API (Socket.IO)

Most chat interactions occur through WebSockets.

### Client Connection

The client must establish a connection to the server at the specified address.

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
```

### Events Sent by Client (Client → Server)

#### `join_room`

Joins the client to the notification channel of a specific room. This event **must** be emitted right after connecting in order to start receiving messages.

* **Event:** `join_room`
* **Payload:** `roomId` (string) — ID of the room to join.
* **Example:**

  ```javascript
  socket.emit('join_room', 'room-42');
  ```

#### `send_message`

Sends a new message to a room. The server saves it to the database and broadcasts it to all participants in the room (including the sender) via the `receive_message` event.

* **Event:** `send_message`
* **Payload:** `(object)` — Message data object.

  * `senderId` (string) — Sender’s ID.
  * `content` (string) — Message text.
  * `roomId` (string) — ID of the room where the message is sent.
* **Example:**

  ```javascript
  const messageData = {
    senderId: 'user-123',
    content: 'This is my new message!',
    roomId: 'room-42'
  };
  socket.emit('send_message', messageData);
  ```

### Events Received by Client (Server → Client)

#### `receive_message`

The server emits this event to all clients in a room after successfully saving a new message to the database.

* **Event:** `receive_message`
* **Payload:** `(Message)` — Full message object from the database (see [Data Model](#6-data-model)).
* **Example:**

  ```javascript
  socket.on('receive_message', (newMessage) => {
    // Add newMessage to the chat state
    console.log('New message:', newMessage);
  });
  ```

---

## 6. Data Model

### Message

A message object stored in MongoDB and transmitted through the API.

| Field       | Type       | Description                                             |
| ----------- | ---------- | ------------------------------------------------------- |
| `_id`       | `ObjectID` | Unique message identifier generated by MongoDB.         |
| `senderId`  | `String`   | ID of the user who sent the message.                    |
| `content`   | `String`   | Text content of the message.                            |
| `roomId`    | `String`   | ID of the room to which the message belongs.            |
| `createdAt` | `Date`     | Message creation timestamp (generated automatically).   |
| `updatedAt` | `Date`     | Timestamp of the last update (generated automatically). |
