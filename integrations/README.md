# Skjærgårdshelt Integration Layer

This directory contains connectors for external APIs and data sources that Skjærgårdshelt integrates with for official environmental reporting.

## Structure

\`\`\`
integrations/
├── connectors/
│   ├── rydde/           # Rydde.no API connector
│   ├── pxweb/           # Statistics Norway (SSB) PxWeb API
│   └── avfallsdeklarering/ # Waste declaration system
├── types/               # Shared TypeScript types
├── utils/               # Common utilities
└── tests/               # Integration tests
\`\`\`

## Usage

Each connector provides a standardized interface for:
- Data transformation
- API communication
- Error handling
- Retry logic
- Status tracking

## Configuration

Set environment variables for each integration:
- `RYDDE_API_KEY`
- `RYDDE_API_URL`
- `SSB_API_URL`
- `AVFALLSDEKLARERING_API_KEY`
- `AVFALLSDEKLARERING_API_URL`
