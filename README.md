# Inventory Management System - Client

This is the frontend client for the Inventory Management System, built with Vue 3 and Vite.

## 🚀 Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **UI Component Framework:** [Vuetify 3](https://vuetifyjs.com/)
- **State Management:** [Vuex 4](https://vuex.vuejs.org/)
- **Routing:** [Vue Router 4](https://router.vuejs.org/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Testing:**
  - **Unit:** [Vitest](https://vitest.dev/)
  - **E2E:** [Playwright](https://playwright.dev/)
- **Styling:** CSS / SASS
- **Language:** JavaScript / TypeScript

## 📋 Prerequisites

- **Node.js:** version 18.x or higher (recommended)
- **Package Manager:** npm

## 🛠 Setup & Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the necessary variables (see [Environment Variables](#-environment-variables)).

## 🏃 Running the App

### Development
Start the development server with hot-reload:
```sh
npm run dev
```

### Production
Build the application for production:
```sh
npm run build
```
Preview the production build locally:
```sh
npm run preview
```

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the app for production to the `dist/` folder. |
| `npm run build:test` | Builds the app with test mode configuration. |
| `npm run build:prod` | Builds the app with production mode configuration. |
| `npm run preview` | Locally previews the production build. |
| `npm run start` / `npm run serve` | Previews the production build on port 4000. |
| `npm run test:unit` | Runs unit tests using Vitest. |
| `npm run test:e2e` | Runs end-to-end tests using Playwright. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

## 🌐 Environment Variables

The application uses the following environment variables. You can define them in `.env`, `.env.local`, `.env.test`, or `.env.production`.

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | The base URL for the backend API. | `http://localhost:3000` |
| TODO: Add more if applicable | | |

## 🧪 Testing

### Unit Tests
Unit tests are located in `__tests__` directories near the components or in `src/utils/__tests__`.
```sh
npm run test:unit
```

### End-to-End Tests
E2E tests are located in `src/tests`.
```sh
npm run test:e2e
```

## 📂 Project Structure

```text
client/
├── public/              # Static assets (favicons, etc.)
├── src/
│   ├── assets/          # Global styles and images
│   ├── components/      # Vue components (organized by module)
│   ├── composables/     # Shared Composition API logic
│   ├── router/          # Vue Router configuration
│   ├── scripte/         # Global helper functions and notifications
│   ├── services/        # API service layers (Axios)
│   ├── store/           # Vuex state management
│   ├── tests/           # E2E test files
│   ├── utils/           # Utility functions
│   ├── App.vue          # Main application component
│   └── main.js          # Application entry point
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
└── playwright.config.ts # Playwright configuration
```

## 📄 License

TODO: Specify the license (e.g., MIT, GPL, etc.)
