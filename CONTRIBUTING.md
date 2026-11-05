# Contributing to KimyoLab

Thank you for your interest. KimyoLab is in development and welcomes help from:

- **Chemistry teachers and methodologists**: review topics, lab steps and reinforcement questions.
- **Translators**: Uzbek Latin is the current language; Russian and Karakalpak are planned.
- **Developers**: chemistry engines, accessibility, mobile performance, tests.

## Workflow

1. Open an issue describing the change before large work.
2. Edit content in `content-src/`, never the generated files in `public/`.
3. Run the checks before opening a pull request:

   ```bash
   npm ci
   npm run lint && npm run typecheck && npm test
   npm run build
   ```

4. Chemistry or curriculum changes need a reviewer with subject expertise before they can reach a release.

## Language

Issues and pull requests may be written in Uzbek or English.

By contributing you agree that your contribution is released under the MIT License.
