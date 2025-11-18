import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const links = {
  samples: [
    { url:'https://webxr.vercel.com', date }
  ]
}
app.post('/:room', (req, res) => {
  const { link } = req.body;
  if (!link)
    return res.status(400).json({ error: 'Link is required' });

  const newLink = { link, date: new Date() }

  if (!links[req.params.room]) {
    links[req.params.room] = []
  }

  links[req.params.room].push(newLink)

  res.status(201).json(newLink);
});

// app.delete('/:room/:url', (req, res) => {
//   const index = todos.findIndex(t => t.id === parseInt(req.params.id));
//   if (index === -1) return res.status(404).json({ error: 'Todo not found' });

//   todos.splice(index, 1);
//   res.status(204).send();
// });

// Home route - HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'index.html'))
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.html'))
})

// show all links that belongs to that room
app.get('/room/:room', function (req, res) {
  res.render(
    path.join(__dirname, '..', 'components', 'room.ejs'),
    { room: req.params.room, data: links[req.params.room] ?? [] }
  );
});

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})



export default app
