// create a .nojekyll file in the build folder
import fs from 'fs-extra'
await fs.writeFile('./build/.nojekyll', '')

// remove local_backend: true from ./build/admin/config.yml
const config = await fs.readFile('./build/admin/config.yml', 'utf8')
await fs.writeFile(
  './build/admin/config.yml',
  config.replace('local_backend: true', '')
)
