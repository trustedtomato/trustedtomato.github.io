import { pathToFileURL } from 'url'

const cwd = pathToFileURL(process.cwd() + '/')

export function importCwd(path) {
  return import(new URL(path, cwd))
}
