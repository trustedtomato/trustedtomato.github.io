#!/usr/bin/env node

import { source } from 'common-tags'
import fs from 'fs-extra'
import path from 'path'

const redirects = await fs.readFile('redirects.json', 'utf-8').then(JSON.parse)

await fs.emptyDir('src/routes/(redirects)')

for (const redirect of redirects) {
  fs.outputFile(
    path.join('src/routes/(redirects)', redirect[0], '+page.server.ts'),
    source`
            import { redirect } from '@sveltejs/kit';
            import type { PageServerLoad } from './$types';
            import { base } from '$app/paths';
            
            export const load = (() => {
            throw redirect(301, base + '${redirect[1]}');
            }) satisfies PageServerLoad;
        `
  )
}
