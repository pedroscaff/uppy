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

let useWorkerCheckbox = document.getElementById('use-worker')
useWorkerCheckbox.checked = true

uppy.use(XHRUpload, {
  endpoint: 'http://localhost:9967/upload',
  fieldName: 'files',
  useWorker: true,
  WorkerConstructor: Worker
})

useWorkerCheckbox.onchange = e => {
  uppy.removePlugin(XHRUpload)

  uppy.use(XHRUpload, {
    endpoint: 'http://localhost:9967/upload',
    fieldName: 'files',
    useWorker: e.checked,
    WorkerConstructor: Worker
  })
}
