const createFormDataUpload = (file, opts) => {
  const formPost = new FormData()

  const metaFields = Array.isArray(opts.metaFields)
    ? opts.metaFields
    // Send along all fields by default.
    : Object.keys(file.meta)
  metaFields.forEach((item) => {
    formPost.append(item, file.meta[item])
  })

  if (file.name) {
    formPost.append(opts.fieldName, file.data, file.name)
  } else {
    formPost.append(opts.fieldName, file.data)
  }

  return formPost
}

const createBareUpload = (file, opts) => {
  return file.data
}

module.exports = {}

const buildResponseError = (xhr, error) => {
  // No error message
  if (!error) error = new Error('Upload error')
  // Got an error message string
  if (typeof error === 'string') error = new Error(error)
  // Got something else
  if (!(error instanceof Error)) {
    error = Object.assign(new Error('Upload error'), { data: error })
  }

  error.request = xhr
  return error
}

module.exports.buildResponseError = buildResponseError

const createRequest = (file, opts) => {
  const data = opts.formData
    ? createFormDataUpload(file, opts)
    : createBareUpload(file, opts)

  const xhr = new XMLHttpRequest()
  if (opts.responseType !== '') {
    xhr.responseType = opts.responseType
  }

  xhr.open(opts.method.toUpperCase(), opts.endpoint, true)
  // IE10 does not allow setting `withCredentials` before `open()` is called.
  xhr.withCredentials = opts.withCredentials

  Object.keys(opts.headers).forEach((header) => {
    xhr.setRequestHeader(header, opts.headers[header])
  })

  // xhr.send(data)
  return { xhr, data }
}

module.exports.createRequest = createRequest
