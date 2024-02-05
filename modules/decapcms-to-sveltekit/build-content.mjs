#!/usr/bin/env node

import yaml from 'yaml'
import fs from 'fs-extra'
import path, { parse } from 'path'
import { marked } from 'marked'
import * as cheerio from 'cheerio'
import {
  generateTransforms,
  applyTransforms,
  loadImage,
  builtins
} from 'imagetools-core'
import { globIterate } from 'glob'
import config from './read-config.mjs'
import { fileURLToPath } from 'url'
import { source } from 'common-tags'
import hyphen from 'hyphen/hu/index.js'
import { importCwd } from '../import-cwd/import-cwd.mjs'
import lqip from 'lqip-modern'

const { default: svelteConfig } = await importCwd('./svelte.config.js')

const {
  picture: {
    defaultFormat: pictureDefaultFormat,
    defaultWidth: pictureDefaultWidth,
    formats: pictureFormats,
    imageUploadDirectory,
    imageDest,
    imageDataDest,
    imageDestUrl
  },
  baseAliases
} = config

// utils

export function toVariableName(name) {
  const varName = name
    .replace(/-/g, '_') // replace hyphens with underscores
    .replace(/[^0-9a-zA-Z_]/g, '') // remove non-alphanumeric characters
  return varName
}

async function generatePictureEl(relativeSrc, metadata) {
  const processedSrc = path.join(imageDestUrl, relativeSrc)

  const $ = cheerio.load('<picture>')
  const picture = $('picture')
  for (const pictureFormat of pictureFormats) {
    const source = $('<source>')
      .attr(
        'srcset',
        pictureFormat.widths
          .map(
            (width) =>
              `${processedSrc}-${width}.${pictureFormat.type} ${width}w`
          )
          .join(', ')
      )
      .attr('type', 'image/' + pictureFormat.type)
      .attr('sizes', '##imgSizes##')
    picture.append(source)
  }

  picture.append(
    $('<img>')
      .attr(
        'src',
        `${processedSrc}-${pictureDefaultFormat.width}.${pictureDefaultFormat.type}`
      )
      .attr('alt', '')
      .attr('width', metadata.width)
      .attr('height', metadata.height)
      .attr('style', `background-image: url('${metadata.dataURIBase64}')`)
      .attr('class', '##imgClass##')
  )
  return picture
}

// setup

const hyphenSettings = {
  minWordLength: 8
}
const hyphenateHTML = (str) => hyphen.hyphenateHTML(str, hyphenSettings)
const hyphenate = (str) => hyphen.hyphenate(str, hyphenSettings)

const base = svelteConfig.kit.paths.base

const pictureConfigs = pictureFormats
  .map((format) =>
    format.widths.map((width) => ({
      format: format.type,
      width,
      withoutEnlargement: ''
    }))
  )
  .flat()

// image transformation

for await (const file of globIterate('**/*', {
  cwd: imageUploadDirectory,
  nodir: true
})) {
  const srcUrl = new URL(file, imageUploadDirectory)
  console.log('transforming', fileURLToPath(srcUrl))
  const srcImage = loadImage(fileURLToPath(srcUrl))

  const targetDataUrl = fileURLToPath(new URL(`${file}.ts`, imageDataDest))
  const result = await lqip(fileURLToPath(srcUrl))
  const content = `export const picture_${toVariableName(
    parse(fileURLToPath(srcUrl)).name
  )} = ${JSON.stringify(
    (
      await generatePictureEl(file, {
        width: result.metadata.originalWidth,
        height: result.metadata.originalHeight,
        dataURIBase64: result.metadata.dataURIBase64
      })
    ).prop('outerHTML')
  )}`
  await fs.outputFile(targetDataUrl, content)

  for (const config of pictureConfigs) {
    const targetUrl = fileURLToPath(
      new URL(`${file}-${config.width}.${config.format}`, imageDest)
    )
    if (await fs.exists(targetUrl)) {
      console.log('file exists, skipping: ' + targetUrl)
    } else {
      const { transforms, warnings } = generateTransforms(config, builtins)
      const { image, metadata } = await applyTransforms(transforms, srcImage)
      await fs.ensureDir(path.dirname(targetUrl))
      await image.toFile(targetUrl)
      console.log('finished writing: ' + targetUrl)
    }
  }
}

// utilities for content processing

function resolveCmsPath(_path) {
  return path.join(process.cwd(), _path)
}

async function resolveCmsImage(src) {
  const srcPath = resolveCmsPath(src)
  const processingBasePath = fileURLToPath(imageUploadDirectory)

  if (!srcPath.startsWith(processingBasePath)) {
    console.log('external or erroneous image, skipping: ' + src)
    return cheerio
      .load('<img>')('img')
      .attr('src', src)
      .attr('alt', '')
      .prop('outerHTML')
  }

  const relativeSrc = srcPath.replace(processingBasePath, '')
  const dataSrc = path.join(fileURLToPath(imageDataDest), relativeSrc + '.ts')
  const picture = JSON.parse(
    (await fs.readFile(dataSrc, 'utf-8')).replace(/.*?=/, '')
  )
  return picture
}

// transform Decap CMS content json:
// - markdown to html
//     - generate picture elements
//     - hyphenate text
//     - convert image paths to absolute urls
//     - when possible, convert external links to internal links
// - convert image paths to absolute urls

async function parseContent(src, schema) {
  const data = {}
  for (const field of schema.fields) {
    let transformed = src[field.name]
    switch (field.widget) {
      case 'list':
        if (transformed) {
          transformed = await Promise.all(
            transformed.map((item) => parseContent(item, field))
          )
        }
        break
      case 'image':
        if (transformed) {
          transformed = await resolveCmsImage(transformed)
        }
        break
      case 'markdown':
        if (transformed) {
          transformed = marked(transformed, {
            gfm: true
          })
          const $ = cheerio.load(transformed, {}, false)
          const imgs = $('img').toArray()
          for (const img of imgs) {
            const picture = await resolveCmsImage($(img).attr('src'))
            $(img).replaceWith(picture)
          }
          const links = $('a').toArray()
          for (const link of links) {
            const href = $(link).attr('href')
            const parsed = new URL(href)
            const imgHostAndPath = parsed.host + parsed.pathname

            const matchingBase = baseAliases.find((baseAlias) =>
              imgHostAndPath.startsWith(baseAlias)
            )

            if (matchingBase) {
              $(link).attr(
                'href',
                imgHostAndPath.replace(matchingBase, base),
                parsed.search + parsed.hash
              )
            }
          }
          transformed = await hyphenateHTML($.html())
        }
        break
      case 'text':
        if (transformed) {
          transformed = await hyphenate(transformed)
        }
    }
    data[field.name] = transformed
  }

  return data
}

async function createLibFile(srcPath, schema) {
  const fileContent = JSON.parse(await fs.readFile(srcPath))
  const content = await parseContent(fileContent, schema)

  const name = toVariableName(parse(srcPath).name)

  // build lib file
  const libFilePath = srcPath
    .replace('_content-src', 'src/lib/content')
    .replace(/\..*?$/, '.ts')

  const libFileContent = source`
    export const data_${name} = ${JSON.stringify(content)}
    export const data = data_${name}
  `

  return {
    path: libFilePath,
    content: libFileContent,
    jsonContent: content
  }
}

const rawDecapConfig = await fs.readFile(config.configPath, 'utf-8')
const decapConfig = yaml.parse(rawDecapConfig)

for (const collection of decapConfig.collections) {
  if (collection.folder) {
    const files = await fs.readdir(collection.folder).catch(() => [])

    let sampleCreated = false
    const libFiles = []

    for (const file of files) {
      const libFile = await createLibFile(
        path.join(collection.folder, file),
        collection
      )
      await fs.outputFile(libFile.path, libFile.content)

      libFiles.push(libFile)

      if (!sampleCreated) {
        sampleCreated = true
        const sampleFilePath = path.join(
          path.dirname(libFile.path),
          'sample.ts'
        )
        const sampleFileContent = source`
                    ${libFile.content}
                    export type InstanceOf_${toVariableName(
                      collection.name
                    )} = typeof data
                `
        await fs.outputFile(sampleFilePath, sampleFileContent)
      }
    }

    const reduce = config.reducerByCollection[collection.name]
    if (reduce) {
      const reduced = reduce(libFiles)
      for (const [name, content] of Object.entries(reduced)) {
        if (content.type !== 'ts') {
          throw new Error(
            `Reducer function for collection ${collection.name} returned a value with a non-ts type (got ${content.type} for ${name})`
          )
        }
        const folder = collection.folder.replace(
          '_content-src',
          'src/lib/content'
        )
        const libFilePath = path.join(folder, `${name}.ts`)
        const libFileContent = source`
          export const data_${collection.name}_${name} = ${JSON.stringify(content.data)}
          export const data = data_${collection.name}_${name}
        `
        await fs.outputFile(libFilePath, libFileContent)
      }
    }
  } else if (collection.files) {
    for (const file of collection.files) {
      try {
        const libFile = await createLibFile(file.file, file)
        await fs.outputFile(libFile.path, libFile.content)
      } catch (err) {
        console.error('[Suppressed error]', err)
      }
    }
  }
}
