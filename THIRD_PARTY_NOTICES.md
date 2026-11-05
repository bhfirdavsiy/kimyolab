# Third-party notices

KimyoLab's own code and content are released under the MIT License (see `LICENSE`).

## Development dependencies

Installed from npm and not redistributed in this repository. Each is used under its own license:

| Package | License |
|---|---|
| @playwright/test | Apache-2.0 |
| @types/node | MIT |
| ajv, ajv-formats | MIT |
| fake-indexeddb | Apache-2.0 |
| typescript | Apache-2.0 |
| vite | MIT |

## Removed template

Earlier private builds used a commercial HTML template (Sinco) for the legacy pages. Those pages and every template
file (`css/`, `js/`, `vendor/`, `fonts/`, `images/`, `inc/` and the template demo pages) are **not** part of this
repository. The current application interface (`public/app-preview/ui/`) is KimyoLab's own code; the
`kl-hero--sinco` class name is a historical name only.

## External laboratory providers

Optional external labs (for example NOBOOK) are reached through partner configuration. No partner SDK, credentials or
content is included in this repository; see `config/nobook.env.example`.

## Interface images

The images in `public/assets/home/` and `public/assets/brand/` were supplied for this project. If you are the rights
holder of any asset here and believe it is used incorrectly, please open an issue.
