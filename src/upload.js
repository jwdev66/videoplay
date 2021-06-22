import React, {useState, useEffect} from 'react'
import {Link, useParams} from 'react-router-dom'

const uploadsRoute = 'http://localhost:4000/api/upload_list'

export default function Upload () {
  const { id } = useParams()
  const [upload, setUpload] = useState(null)
  useEffect(() => {
    if (!id) { return }

    (async () => {
      const response = await fetch(uploadsRoute)
      const json = await response.json()
      let upload = json.find(x => x.Id === Number(id))
      if (upload !== null) {
        setUpload(upload)
      }
    })()
  }, [id])

  if (!upload) {
    return <p>Loading</p>
  }

  return (
    <>
      <h1>Review</h1>
      <Link to="/">Return Home</Link>
      <br />
      <Link to="/upload">Upload Another</Link>
      <h2>Here is your video for ${upload.address}</h2>
      <video src={`http://localhost:4000/videos/${upload.video_file}`} controls></video>
      <br />
    </>
  )
}