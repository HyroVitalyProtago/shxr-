import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cron  from 'node-cron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

const links = {
  samples: [
    { url:'https://webxr.vercel.com', expireAt: new Date() }
  ]
}

const expireInMs = 60/*s*/ * 60/*m*/ * 24/*h*/ * 1000/*ms*/

const Room = (req, res) => {
  const room = req.query.room
  if (room) {
    const now = new Date()
    const lnks = (links[room] ?? [])
        .filter(link => link.expireAt > now)
    res.render(
        path.join(__dirname, '..', 'components', 'room.ejs'),
        { room, data: lnks }
    );
    return true
  }
  return false
}

app.post('/', (req, res) => {
  const room = req.query.room
  if (!room)
    return res.status(400).json({ error: 'Room param is required' });

  let url = req.body.url
  if (!url)
    return res.status(400).json({ error: 'URL is required' });

  // TODO if url does not contains https:// at the beginning, add it

  if (!url.startsWith('http')) {
    url = "https://" + url
  }

  const newLink = {
    url,
    expireAt: new Date((new Date()).getTime() + expireInMs)
  }

  if (!links[room]) {
    links[room] = []
  } else if (links[room].find(link => link.url === url)) {
    return res.redirect('/?room='+encodeURIComponent(room))
  }

  links[room].push(newLink)

  // res.status(201)//.json(newLink);
  // Room(req, res)
  res.redirect('/?room='+encodeURIComponent(room))
});

// TODO
app.delete('/', (req, res) => {
  const room = req.query.room
  if (!room)
    return res.status(400).json({ error: 'Room param is required' });

  const url = req.query.url
  if (!url)
    return res.status(400).json({ error: 'URL is required' });

  // console.log('DELETE', room, url)
  links[room] = links[room].filter(link => link.url !== url)

  Room(req, res)
});

// Home route - HTML
app.get('/', (req, res) => {
  if (Room(req, res)) return

  res.sendFile(path.join(__dirname, '..', 'components', 'index.html'))
})

cron.schedule('0 0 * * *', () => {
  // cleanup all expired links
  const now = new Date()
  for (const roomId in links) {
    links[roomId] = links[roomId].filter(link => link.expireAt > now)
  }
});

export default app

// only for local dev
// const PORT = 5180;
//
// app.listen(PORT, () => {
//   console.log(`Running on PORT ${PORT}`);
// })