# Contributing to EduLattice

First off, thank you for considering contributing to EduLattice! It's people like you that make EduLattice such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the JavaScript/React style guide
- Include thoughtfully-worded, well-structured tests
- Document new code
- End all files with a newline

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/edulattice.git
cd edulattice
```

2. **Install dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. **Set up environment variables**

- Copy `.env.example` to `.env` in both backend and frontend
- Fill in the required values

4. **Run the development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:

```
Add user authentication feature

- Implement JWT-based authentication
- Add login and registration endpoints
- Create auth middleware

Fixes #123
```

### JavaScript Styleguide

- Use ES6+ syntax
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises

### React Styleguide

- Use functional components with hooks
- Keep components small and reusable
- Use prop-types or TypeScript for type checking
- Follow the single responsibility principle
- Use meaningful component names

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
└── server.js       # Entry point

frontend/
├── src/
│   ├── components/ # Reusable components
│   ├── context/    # React context
│   ├── pages/      # Page components
│   ├── utils/      # Utility functions
│   └── App.jsx     # Main component
```

## Testing Guidelines

- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

## Documentation

- Update README.md if needed
- Add JSDoc comments for functions
- Update API_REFERENCE.md for new endpoints

## Questions?

Feel free to contact the project maintainers if you have any questions or need help with your contribution.

Thank you for contributing to EduLattice! 🎉
