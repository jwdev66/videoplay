import React from 'react'
import {Link} from 'react-router-dom'

export default function UploadForm() {
  return (
    <>
      <h1>Welcome</h1>
      <h3>Upload your video here!</h3>

      <form action="http://localhost:4000/api/upload" encType="multipart/form-data" method="POST">
        <label htmlFor="address-input">Address</label>
        <input type="text" id="address-input" name="address" required />
        <br />
        <label htmlFor="video-input">Upload Video</label>
        <input type="file" required accept="video/*" id="video-input" name="video" />
        <br />
        <button type="submit">Upload</button>
      </form>
      <Link to="/">Return Home</Link>
    </>
  )
}