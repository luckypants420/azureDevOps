# Campus Device Loans - Frontend

React + TypeScript + Vite web application for managing device loans with Auth0 authentication.

## Features

- Browse available devices (public)
- Reserve devices (authenticated users)
- View personal loans
- Staff panel for managing user loans

## Environment Variables

Create a `.env.local` file with:

```
VITE_DEVICES_API_BASE=https://your-device-service.azurewebsites.net/api
VITE_LOANS_API_BASE=https://your-loan-service.azurewebsites.net/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://loans-api-da007
VITE_ROLES_CLAIM=https://loans-app.da007/roles
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
