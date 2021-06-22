require('dotenv').config()
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const sqlite = require('sqlite3')

sqlite.verbose()
const db = new sqlite.Database('./dev.db')

const app = express()
const PORT = 4000

app.use(cors())
app.use('/videos', express.static('uploads'))

app.get('/api/upload_list', (_req, res) => {
  console.log('uploadList');
  db.all(`
    SELECT id, video_file, address
    FROM uploads
    ORDER BY id
  `, (err, rows) => {
    if (err || !rows) {
      res.status(400).send('Bad Request')
      return
    }

    res.json(rows)
  })
})

const upload = multer({dest: 'uploads'})
app.post('/api/upload', upload.single('video'), (req, res) => {
  console.log('saving video...')
  db.run(`
    INSERT into uploads 
    (address, video_file, original_video_filename)
    VALUES (?, ?, ?)
  `, [req.body.address, req.file.filename, req.file.originalname], function () {
    res.redirect(`http://localhost:3000/uploads/${this.lastID}`)
  })
})

app.all('*', (req, res) => {
  console.log('uncaught request to ', req.url)
  res.status(404).end()
})

app.listen(PORT, () => {
  console.log(`Assessment app listening at http://localhost:${PORT}`)
})