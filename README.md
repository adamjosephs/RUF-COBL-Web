# Risk Up Front - Cost of Being Late Calculator

A React-based web application for calculating the linear and non-linear costs of project delays using the Risk Up Front methodology by Celerity Consulting Group.

## Features

- Industry-specific calculations with appropriate discount rates
- Linear cost analysis (lost business value + team costs)
- Non-linear cost modeling (customer loss, contract penalties, etc.)
- Interactive results with summary, table, and chart views
- Responsive design optimized for all devices

## Technology Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd RUF-COBL-Web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Deploying to Vercel

This project is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Deploy with default settings

## Project Structure

```
src/
  App.jsx          # Main calculator component
  main.jsx         # React entry point
  index.css        # Tailwind CSS imports
index.html         # HTML template
package.json       # Dependencies and scripts
vite.config.js     # Vite configuration
tailwind.config.js # Tailwind CSS configuration
```

## License

© 2025 Celerity Consulting Group Inc. Risk Up Front® is a registered trademark.
