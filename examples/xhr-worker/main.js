const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const XHRUpload = require('@uppy/xhr-upload')

const Worker = require('@uppy/xhr-upload/lib/worker.js')

const uppy = Uppy({
  debug: true
})

uppy.use(Dashboard, {
  target: '#app',
  inline: true,
  hideRetryButton: true,
  hideCancelButton: true,
  disableThumbnailGenerator: true
})

uppy.use(XHRUpload, {
  endpoint: 'http://localhost:9967/upload',
  fieldName: 'files',
  useWorker: true,
  WorkerConstructor: Worker
})
