# Node Elastic Example

This repository was developed in mind of learning cool stuffs like esbuild, rollup, fastify, and elasticsearch.

## Features

- [x] ESBuild - bye babel 👋
- [x] Fastify
- [x] pnpm
- [x] Typescript

## Getting Started

You need to install elasticsearch first before able to run this repo.
By default this app will target the elastic at http://localhost:9200.

After installing & the etl has successfully indexed the `data.json`, try going to http://localhost:3000/api/v1/search?q=voluptas.

## Scripts

| `pnpm run <script>` | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `dev`               | To start develop the server, with hot reload by rollup      |
| `build`             | To transpile only the app into `dist/index.js`              |
| `start`             | Run the app based on the built server                       |

---
