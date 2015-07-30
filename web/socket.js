import cookieParser     from 'cookie-parser'
import passportSocketIo from 'passport.socketio'
import SocketIO         from 'socket.io'

module.exports = {
  listen: (server, sessionStore) => {
    let io = SocketIO(server, { path: '/proverbs/socket.io'})

    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,
      key:          'connect.sid',
      secret:       process.env.SESSION_SECRET,
      store:        sessionStore,

      success: (data, accept) => {
        console.log('[socket:authenticate] success')
        accept()
      },

      fail: (data, message, error, accept) => {
        console.warn('[socket:authenticate] fail', message)

        if(error) {
          accept(new Error(message))
        }
      }
    }))

    io.on('connection', (socket) => {
      console.log('[socket:connection]', socket.id);

      ['connect', 'disconnect', 'reconnect', 'error'].forEach(evt => {
        socket.on(evt, () => {
          console.log(`[socket:client:${evt}]`, socket.id)
        })
      })
    })

    return io
  }
}
