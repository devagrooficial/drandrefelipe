// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Public pages stay prerendered (static); only /admin opts into on-demand rendering.
  adapter: vercel(),
  integrations: [react()],

  // Read at request time on the server, never bundled or sent to the browser.
  env: {
    schema: {
      ADMIN_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_REPO: envField.string({
        context: 'server',
        access: 'secret',
        default: 'devagrooficial/drandrefelipe',
      }),
      GITHUB_BRANCH: envField.string({ context: 'server', access: 'secret', default: 'main' }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
