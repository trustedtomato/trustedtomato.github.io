import basename from 'basename'

export default {
  configPath: 'static/admin/config.yml',

  // Can include paths as well. Should not include a protocol.
  baseAliases: ['tamashalasi.com'],

  picture: {
    imageUploadDirectory: 'src/lib/images/uploads/',
    imageDataDest: 'src/lib/pictures/',
    imageDest: 'static/processed-images/uploads/',
    imageDestUrl: '/processed-images/uploads/',
    // last values are the fallback values
    formats: [
      { type: 'avif', widths: [360, 420, 930, 1440, 1920] },
      { type: 'jpg', widths: [1440] }
    ]
  },

  // reducerByCollection is an object with keys that are the collection names
  // and values that are functions that take the items of the collection and
  // return an object with keys that are the names of the reduced collections
  // and values that are the reduced collections.
  reducerByCollection: {
    posts: (items) => {
      const summaries = items.map(({ jsonContent: item, path }) => {
        return {
          title: item.title,
          date: item.date,
          slug: basename(path),
          description: item.description,
          image: item.image,
          tags: item.tags
        }
      })
      return {
        summaries: {
          type: 'ts',
          data: summaries
        }
      }
    }
  }
}
