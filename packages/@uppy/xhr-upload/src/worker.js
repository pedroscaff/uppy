const upload = require('./upload')
const currentUploads = new Map()

// Helper to abort upload requests if there has not been any progress for `timeout` ms.
// Create an instance using `timer = createProgressTimeout(10000, onTimeout)`
// Call `timer.progress()` to signal that there has been progress of any kind.
// Call `timer.done()` when the upload has completed.
function createProgressTimeout (timeout) {
  let isDone = false

  function onTimedOut () {
    postMessage({
      type: 'uppy/UPLOAD_TIMEOUT',
      seconds: Math.ceil(timeout / 1000)
    })
  }

  let aliveTimer = null
  function progress () {
    // Some browsers fire another progress event when the upload is
    // cancelled, so we have to ignore progress after the timer was
    // told to stop.
    if (isDone) return

    if (timeout > 0) {
      if (aliveTimer) clearTimeout(aliveTimer)
      aliveTimer = setTimeout(onTimedOut, timeout)
    }
  }

  function done () {
    if (aliveTimer) {
      clearTimeout(aliveTimer)
      aliveTimer = null
    }
    isDone = true
  }

  return {
    progress,
    done
  }
}

const abort = ({ id }) => {
  const xhr = currentUploads.get(id)
  if (xhr) {
    xhr.abort()
    currentUploads.delete(id)
  }
}

const start = ({ file, opts, id }) => {
  self.importScripts(opts.getResponseData)
  const { xhr, data } = upload.createRequest(file, opts)

  const timer = createProgressTimeout(opts.timeout)

  xhr.upload.addEventListener('loadstart', (ev) => {
    postMessage({
      type: 'uppy/UPLOAD_STARTED',
      id
    })
    // Begin checking for timeouts when loading starts.
    timer.progress()
  })

  xhr.upload.addEventListener('progress', (ev) => {
    const eventData = {
      loaded: ev.loaded,
      total: ev.total,
      lengthComputable: ev.lengthComputable
    }
    postMessage({
      type: 'uppy/UPLOAD_PROGRESS',
      id,
      ev: eventData
    })
    timer.progress()
  })

  xhr.addEventListener('load', (ev) => {
    postMessage({
      type: 'uppy/UPLOAD_FINISHED',
      id
    })
    timer.done()
    postMessage({
      type: 'uppy/TIMER_DONE',
      id
    })

    if (ev.target.status >= 200 && ev.target.status < 300) {
      const body = self.getResponseData(xhr.responseText, xhr)
      const uploadURL = body[opts.responseUrlFieldName]

      const response = {
        status: ev.target.status,
        body,
        uploadURL
      }
      currentUploads.delete(id)
      postMessage({
        type: 'uppy/UPLOAD_SUCCESS',
        id,
        response
      })
    } else {
      const body = self.getResponseData(xhr.responseText, xhr)
      const error = upload.buildResponseError(
        xhr,
        self.getResponseError(xhr.responseText, xhr)
      )

      const response = {
        status: ev.target.status,
        body
      }
      currentUploads.delete(id)
      postMessage({
        type: 'uppy/UPLOAD_ERROR',
        id,
        response,
        error
      })
    }
  })

  xhr.addEventListener('error', (ev) => {
    const error = upload.buildResponseError(
      xhr,
      self.getResponseError(xhr.responseText, xhr)
    )
    currentUploads.delete(id)
    postMessage({
      type: 'uppy/UPLOAD_ERROR',
      id,
      error
    })
  })
  xhr.send(data)
  currentUploads.set(id, xhr)
}

self.addEventListener('message', (event) => {
  const data = event.data
  switch (data.type) {
    case 'uppy/UPLOAD_START':
      start(data)
      break
    case 'uppy/UPLOAD_ABORT':
      abort(data)
      break
  }
})
