# GoodReads Application

Welcome to the GoodReads Application, a project developed using the MERN stack (MongoDB, Express.js, React.js, Node.js). This application emulates the core functionalities of the popular GoodReads platform, allowing users to explore, review, and manage books.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure user registration and login.
- **Book Management**: Add, edit, and delete book entries.
- **Review System**: Users can write, edit, and delete reviews for books.
- **Search Functionality**: Search for books by title, author, or genre.
- **Responsive Design**: Optimized for various device sizes.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/PaulaMagdi0/MERN-Stack-Project-ITI.git
   cd MERN-Stack-Project-ITI
   ```

2. **Backend Setup**:

   - Navigate to the `Back-End` directory:

     ```bash
     cd Back-End
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Start the backend server:

     ```bash
     npm start
     ```

     The backend server will run on port 5000.

3. **Frontend Setup**:

   - Open a new terminal and navigate to the `Front-End` directory:

     ```bash
     cd Front-End
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Start the frontend application:

     ```bash
     npm run dev
     ```

     If prompted, accept to run on another port (e.g., 5000).

## Usage

Once both the backend and frontend servers are running:

- Access the application by navigating to `http://localhost:5000` in your browser.
- Register a new account or log in with existing credentials.
- Explore the library, add new books, write reviews, and manage your reading list.

## Project Structure

The repository is organized as follows:

- `Back-End/`: Contains the Express.js server, MongoDB models, and API routes.
- `Front-End/`: Contains the React.js application, components, and styles.
- `Erd.drawio` & `Erd.svg`: Entity-Relationship Diagram of the database schema.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `LICENSE.md`: The project's license information.
- `proj.sh`: Shell script related to the project setup or deployment.

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Please ensure your code follows the project's coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.
