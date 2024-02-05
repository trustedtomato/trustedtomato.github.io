import path from 'path'
import { importCwd } from '../import-cwd/import-cwd.mjs'
import { pathToFileURL } from 'url'

const { default: config } = await importCwd(
  './decapcms-to-sveltekit.config.mjs'
)

const widths = config?.picture?.widths || [360, 420, 1444]
const formats = config?.picture?.formats || ['jpg']

const transformedConfig = {
  baseAliases: config?.baseAliases || [],
  configPath: config?.configPath || 'admin/config.yml',
  picture: {
    formats,
    imageUploadDirectory: new URL(
      pathToFileURL(
        path.join(
          process.cwd(),
          config?.picture?.imageUploadDirectory || 'src/lib/images/uploads/'
        ) + path.sep
      )
    ),
    imageDataDest: new URL(
      pathToFileURL(
        path.join(
          process.cwd(),
          config?.picture?.imageDataDest || 'src/lib/images/data/'
        ) + path.sep
      )
    ),
    imageDest: new URL(
      pathToFileURL(
        path.join(
          process.cwd(),
          config?.picture?.imageDest || 'static/processed-images/uploads/'
        ) + path.sep
      )
    ),
    imageDestUrl: config?.picture?.imageDestUrl || '/processed-images/uploads/',
    defaultFormat: {
      type: formats[formats.length - 1].type,
      width:
        formats[formats.length - 1].widths[
          formats[formats.length - 1].widths.length - 1
        ]
    }
  },
  reducerByCollection: config?.reducerByCollection || {}
}

export default transformedConfig
