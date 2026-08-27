# PRTS Tactical Radar (PRTS 方舟雷达)

A real-time tactical radar web application themed around Arknights (明日方舟), allowing players ("Doctors") to locate each other on a radar display based on geographic proximity, with operator-themed UI elements and privacy controls.

![License: Non-Commercial](https://img.shields.io/badge/license-Non--Commercial-blue)
![Tech Stack](https://img.shields.io/badge/stack-React%20%2B%20Cloudflare%20Workers-brightgreen)

> **在线预览:** https://ark.i-test.top/

## Features

- **Radar Display**: Interactive radar showing nearby Doctors on a map using Leaflet
- **Operator Selection**: Choose your favorite operator as your assistant/avatar
- **Privacy Controls**: Camouflage mode to hide your exact location
- **Real-time Updates**: Manual sonar refresh to see nearby Doctors
- **Geolocation**: Automatic location detection via browser GPS or IP fallback
- **PRTS-themed UI**: Authentic Arknights interface design with radar animations

## Tech Stack

### Frontend (Web)
- React 19 with TypeScript
- Vite 6 for development and building
- Tailwind CSS 4 for styling
- Leaflet for map rendering
- Lucide React for icons

### Backend (Cloudflare Worker)
- Cloudflare Worker (V8 runtime)
- KV Storage (RADAR_KV) for presence/beacon data
- Gaode (AMap) WebService API for reverse geocoding
- Gaode JS API for map display (requires API key)

### Mobile Mini Program (Separate Repository)
- uni-app framework (Vue 3 + TypeScript)
- WeChat native map component
- Pinia for state management

**Note**: This repository contains only the Web frontend and Cloudflare Worker backend. The mini program is maintained separately and not included in this open-source release.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Cloudflare account (free tier works) for deployment

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pomran/prts-tactical-radar.git
   cd prts-tactical-radar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

#### 1. AMap (Gaode) API Keys
You need both a JS API key (for the frontend map) and a WebService REST key (for server-side geocoding).

**Frontend (JS API Key):**
1. Register at [https://console.amap.com/](https://console.amap.com/)
2. Create a JavaScript API key
3. Edit `index.html` and replace `YOUR_AMAP_JS_API_KEY` and `YOUR_AMAP_SECURITY_JS_CODE`

**Backend (WebService REST Key):**
1. Create a WebService REST API key in the same AMap console
2. Copy `.dev.vars.example` to `.dev.vars` and fill in your key:
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your actual Gaode WebService key
   ```

#### 2. Cloudflare Worker Configuration
1. Copy `wrangler.example.jsonc` to `wrangler.jsonc`:
   ```bash
   cp wrangler.example.jsonc wrangler.jsonc
   ```
2. Edit `wrangler.jsonc` with your own settings:
   - Replace `your-domain.example.com` with your actual domain
   - Create a KV namespace: `npx wrangler kv namespace create RADAR_KV`
   - Replace `your-kv-namespace-id` with the ID from the previous step

3. For production deployment, set the Gaode key as a secret:
   ```bash
   npx wrangler secret put GAODE_KEY
   # Enter your Gaode WebService REST key when prompted
   ```

### Development

Start the development server:
```bash
npm run dev
```

This will start Vite on port 3000. For full-stack development with the Cloudflare Worker:
```bash
npm run dev:cf
```

### Building and Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare:
   ```bash
   npm run deploy
   # or manually:
   npx wrangler deploy
   ```

3. For local testing of the deployed Worker:
   ```bash
   npx wrangler dev
   ```

## Project Structure

```
├── index.html                 # Main HTML file with AMap script tags
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── wrangler.example.jsonc     # Example Cloudflare Worker configuration
├── worker/                    # Cloudflare Worker backend
│   └── src/
│       └── index.ts           # Worker entry point (API routes + handlers)
├── src/                       # Frontend source
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Main app component
│   ├── components/            # React components (RadarView, etc.)
│   └── utils/                 # Utilities (API client, etc.)
└── README.md
```

## API Endpoints

The Cloudflare Worker provides these endpoints:

- `GET /api/radar/scan` - Get nearby beacons (Doctors)
- `POST /api/radar/ping` - Update your presence/beacon
- `GET /api/radar/inbox` - Get pending invitations/messages
- `POST /api/radar/sanity` - Sanity point exchange
- `POST /api/radar/invite` - Send invitations
- `GET /api/geo/reverse` - Reverse geocoding proxy (Gaode)
- `GET /api/radar/geoip` - IP-based geolocation

## License

This project is licensed under the **Non-Commercial Open Source License** - see the [LICENSE](LICENSE) file for details.

### Non-Commercial Use
This software is provided for **non-commercial educational and personal use only**. You may freely use, modify, and distribute this software for:
- Personal learning and experimentation
- Educational purposes
- Non-commercial fan projects and derivative works

**Commercial use is strictly prohibited** without explicit written permission from the original author.

### Arknights Intellectual Property
This project is a fan-made application based on the game *Arknights* (明日方舟). All Arknights-related trademarks, characters, artwork, and other intellectual property belong to **Hypergraph / Yostar**. This project is not affiliated with or endorsed by the official Arknights team.

## Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## Acknowledgments

- The Arknights community for inspiration
- Cloudflare for the excellent Workers platform
- Gaode (AMap) for their geolocation services
- All contributors and testers

## Support

If you encounter issues or have questions:
1. Check the [Issues](https://github.com/pomran/prts-tactical-radar/issues) page
2. Read the [Contributing Guidelines](CONTRIBUTING.md)
3. Join the community discussions

---

*PRTS Tactical Radar - Bringing Doctors together through tactical positioning*
