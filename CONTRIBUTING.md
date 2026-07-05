# Contributing to AI CRM Dashboard

First off, thank you for considering contributing to the AI CRM Dashboard! We're excited to have you on board. Every contribution helps make this project better.

This document provides guidelines for contributing to the project. Please feel free to propose changes to this document in a pull request.

## How Can I Contribute?

There are many ways to contribute, from writing code and improving documentation to submitting bug reports and feature requests.

### Reporting Bugs

If you find a bug, please ensure it hasn't already been reported by searching the [Issues](https://github.com/your-username/ai-crm-dashboard/issues) on GitHub.

If you can't find an existing issue, please [open a new one](https://github.com/your-username/ai-crm-dashboard/issues/new). Be sure to include:
- A **clear and descriptive title**.
- A **detailed description** of the problem, including steps to reproduce it.
- The **expected behavior** and what is happening instead.
- Screenshots or screen recordings, if possible.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, we'd love to hear it. Please open an issue to start a discussion. This allows us to align on the proposal before any development work begins.

### Project Roadmap & Future Enhancements

We have a vision for where we'd like to take the project. If you're looking for ideas on what to contribute, consider tackling one of these features. Please open an issue to claim a feature before you start working on it.

*   **Real-time Collaboration & Notifications:**
    *   **Goal:** Implement a real-time activity feed and notification system using WebSockets (`socket.io`).
    *   **Impact:** Allow users on the same team to see updates instantly (e.g., a new note on a lead, a task marked complete) without refreshing the page.
*   **Calendar Integration & Meeting Scheduling:**
    *   **Goal:** Allow users to connect their Google or Outlook calendar via OAuth to schedule meetings directly from the CRM.
    *   **Impact:** Centralize the sales workflow by syncing meetings scheduled in the CRM with external calendars.
*   **AI-Powered Predictive Lead Scoring:**
    *   **Goal:** Create an AI function that analyzes a lead's properties and interaction history to generate a "Lead Score" predicting the likelihood of winning the deal.
    *   **Impact:** Help users prioritize their efforts by focusing on the most promising leads.

### Pull Requests

Ready to contribute code? Great! Here’s how to set up for a pull request:

1.  **Fork the repository** and create your branch from `main`.
2.  **Set up your local environment** by following the instructions in the README.md.
3.  **Make your changes** in your branch. Ensure your code adheres to the project's style and conventions.
4.  **Update documentation** (`README.md`, etc.) if your changes require it.
5.  **Commit your changes** using a descriptive commit message. We follow the Conventional Commits specification. This helps in generating automated changelogs.
    -   Example: `feat: Add calendar integration for scheduling meetings`
    -   Example: `fix: Correctly calculate conversion rate on dashboard`
6.  **Push your branch** to your fork.
7.  **Open a pull request** to the `main` branch of the original repository.
8.  In your PR description, clearly explain the problem and your solution. Link to the relevant issue if one exists (e.g., `Closes #123`).

## Development Guidelines

### Code Style

This project is built with TypeScript for both the frontend and backend. We value clean, readable, and maintainable code.

- **TypeScript**: Please use strong typing and avoid using `any` where possible.
- **Frontend**: We use React with functional components and hooks.
- **Backend**: We use Node.js/Express with an async/await-based controller/service pattern.

### Project Structure

- The `frontend` directory contains the React application.
- The `backend` directory contains the Express API server.

Please keep new files organized within the existing structure.

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior. (Note: You may want to create a `CODE_OF_CONDUCT.md` file for this).

We look forward to your contributions!