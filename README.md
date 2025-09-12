# KamaChat

## Overview

KamaChat (name is inspired from japanese mythological creature Kamaitatch) is a modern, scalable, and feature-rich chat application designed to provide seamless communication through text, voice, and video, similar to platforms like Discord. It supports direct messages, group channels, and multimedia attachments, prioritizing performance, security, and user experience. The backend is built with Node.js, TypeScript, Fastify, Prisma, and PostgreSQL, while the frontend leverages React, Tailwind CSS, and Vite. A desktop implementation in Rust is also planned for cross-platform support.

The application includes real-time messaging, secure authentication with 2FA, email notifications, message search, and efficient media processing. This README provides an overview, setup instructions, and current development tasks for contributors.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Project Status and TODOs](#project-status-and-todos)
  - [Backend TODOs](#backend-todos)
  - [Frontend TODOs](#frontend-todos)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Chat**: Low-latency direct messages and group channels.
- **Voice and Video Calls**: Planned support for multimedia communication.
- **Secure Authentication**: Includes 2FA and email validation.
- **Media Processing**: Efficient handling of images and videos using FFmpeg and C++.
- **Scalability**: Load balancing and caching for high performance.
- **Message Search**: Search functionality for message history.
- **Cross-Platform**: Web interface with React and a planned Rust-based desktop client.
- **Customizable Settings**: User profiles and settings for personalization.

## Tech Stack

### Backend
- **Node.js**: Server-side runtime environment.
- **TypeScript**: Static typing for reliable and maintainable code.
- **Fastify**: High-performance web framework for APIs.
- **Prisma**: ORM for PostgreSQL database interactions.
- **PostgreSQL**: Relational database for persistent storage.
- **FFmpeg**: For processing multimedia attachments.
- **pnpm**: Efficient package manager.
- **Vitest**: Unit and integration testing framework.
- **Elixir**: Planned for email notification system.
- **C++**: For optimized image and video processing.
- **RabbitMQ**: Message broker for asynchronous tasks.
- **Cloudinary**: Cloud-based storage for media uploads.

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Fast frontend tooling for development and builds.

### Additional Tools
- **Load Balancer/Reverse Proxy**: For traffic distribution and scalability.
- **Cache**: To optimize performance and reduce database load.
- **2FA**: For secure user authentication.
- **Email Validation**: To verify user email addresses.

## Environment Variables

To run KamaChat, you need to configure the following environment variables in a `.env` file in the root of the project. Below is a list of required variables with their descriptions:

```env
# Database Configuration
DATABASE_URL= # Full PostgreSQL connection string (e.g., postgresql://user:password@localhost:5432/kamachat)
DB_NAME= # Database name
DB_PORT= # Database port (e.g., 5432)
DB_HOST= # Database host (e.g., localhost)
DB_USER= # Database username
DB_PASSWORD= # Database password

# Server Configuration
HOST= # Server host (e.g., localhost or 0.0.0.0)
PORT= # Server port (e.g., 3000)

# Authentication
JWT_SECRET= # Secret key for JSON Web Token (JWT) authentication

# Environment
NODE_ENV= # Environment mode ('production' or 'development')
NODE_ID= # Unique identifier for the node instance

# RabbitMQ Configuration (for message queue)
HOST_RABBITMQ= # RabbitMQ host
PORT_RABBITMQ= # RabbitMQ port
USER_RABBITMQ= # RabbitMQ username
PASSWORD_RABBITMQ= # RabbitMQ password

# Cloudinary Configuration (for media storage)
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY= # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
```

**Note**: Ensure sensitive values (e.g., `JWT_SECRET`, `DB_PASSWORD`, `CLOUDINARY_API_SECRET`) are kept secure and not committed to version control.

## Project Status and TODOs

KamaChat is under active development. Below are the tasks to be completed for the backend and frontend.

### Backend TODOs
- Create a separated table for attachments in the database.
- Implement schema validation for API requests.
- Add channel deletion functionality.
- Update email handling logic.
- Implement user deletion functionality.
- Complete real-time chat functionality.
- Develop voice and video call features.
- Set up a load balancer and reverse proxy for scalability.
- Implement caching mechanisms for performance optimization.
- Add image and video processing using C++.
- Develop email notification system using Elixir.
- Enable search functionality within message history.
- Implement two-factor authentication (2FA).
- Add email validation for user registration.

### Frontend TODOs
- Develop the login page.
- Create the signup page.
- Build the home page.
- Design the user profile page.
- Implement the chat channel and direct message (DM) page.
- Create the settings page.
- Complete the web implementation using React, Tailwind CSS, and Vite.
- Develop a desktop application using Rust.

## Installation

### Prerequisites
- **Node.js**: v18 or higher
- **pnpm**: v8 or higher
- **PostgreSQL**: v15 or higher
- **FFmpeg**: For media processing
- **Elixir**: For email notifications (optional)
- **Rust**: For desktop implementation (optional)
- **RabbitMQ**: For message queue
- **Cloudinary Account**: For media storage

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kamachat.git
   cd kamachat
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file in the project root and configure the environment variables as listed above.
4. Set up the PostgreSQL database and run migrations with Prisma:
   ```bash
   pnpm prisma migrate dev
   ```
5. Start the backend server:
   ```bash
   pnpm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

### Testing
Run tests using Vitest:
```bash
pnpm test
```

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

Ensure your code adheres to the project's coding standards and includes tests where applicable.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
