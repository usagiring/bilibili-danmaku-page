const url = 'ws://127.0.0.1:3000'

export default function () {
  const ws = new WebSocket(url)

  ws.onopen = () => {

  }

  ws.onmessage = (msg) => {
    console.log(msg)

    const payload = JSON.parse(msg as any)
    payload.event = ''
    payload.payload = {}
  }

  ws.onclose = (code) => {
    console.log('ws close: ', code)
  }

  ws.onerror = (err) => {
    console.error(err)
  }
}