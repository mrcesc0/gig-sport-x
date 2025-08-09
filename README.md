# Gig Sport X

Gig Sport X is a basic but functional sports betting interface developed as part of a technical assessment for a Tech Lead position.
It enables users to view sports events and place bets. Designed with a microfrontend architecture, the project supports scalability and modular development, allowing independent teams to work on different parts of the platform efficiently.

---

## Tech Stack

- **TypeScript & React:** Strongly typed frontend with functional components and hooks.
- **Nx Monorepo:** Efficient monorepo management with Nx CLI for building, testing, and running apps and libs.
- **RxJS:** Reactive programming with observables for state and data flow.
- **Zod:** Runtime schema validation for robust data parsing.
- **CSS Modules:** Scoped, maintainable styling.
- **ESLint & Prettier:** Code quality and formatting tools.
- **Jest:** Unit testing framework.

---

## Installation & Running Locally

### Prerequisites

- Node.js (>= 20.x recommended)
- npm (comes with Node.js) or yarn

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mrcesc0/gig-sport-x.git
   cd gig-sport-x
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

3. **Run the development server for the SportX app:**

   ```bash
   npm run dev:sportx
   ```

   This starts the app in development mode with hot reload.

4. **Build the production bundle:**

   ```bash
   npm run build:sportx
   ```

5. **Run all tests:**

   ```bash
   npm run test:all
   ```

6. **Visualize project graph (optional):**

   ```bash
   npm run graph
   ```
