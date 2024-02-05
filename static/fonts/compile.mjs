import { $ } from 'execa'
import { globbyStream } from 'globby'
import { fileURLToPath } from 'url'
import { dirname, parse, join } from 'path'
import { ensureDir } from 'fs-extra'

// change the current directory to the directory of the current file
const currentDir = dirname(fileURLToPath(import.meta.url))
process.chdir(currentDir)

for await (const file of globbyStream(['*.ttf', '*.woff', '*.woff2', '*.TTF'], {
  cwd: 'source'
})) {
  console.log(file)
  const parsedFile = parse(file)
  const extensionlessFile = parsedFile.dir
    ? join(parsedFile.dir, parsedFile.name)
    : parsedFile.name
  await ensureDir('compiled')
  await $`pyftsubset source/${file} --text-file=font-text.txt --flavor=woff2 --output-file=compiled/${extensionlessFile}.woff2`
}
