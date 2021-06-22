import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

const uploadsRoute = "http://localhost:4000/api/upload_list";

export default function Home() {
  const [uploadList, setUploadList] = useState([]);
  const [activeUploadIndex, setActiveUploadIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);  

  useEffect(() => {
    (async () => {
      const response = await fetch(uploadsRoute);
      const json = await response.json();
      setUploadList(json);
      if (json.length > 0) {
        setActiveUploadIndex(0);
      }
    })();
  }, []);

  const updateActiveUploadIndex = (newIndex) => {
    const count = uploadList.length;
    setActiveUploadIndex((newIndex + count) % count);
  };

  const incrementActiveUploadIndex = () => {
    updateActiveUploadIndex(activeUploadIndex + 1);
  };

  const decrementActiveUploadIndex = () => {
    updateActiveUploadIndex(activeUploadIndex - 1);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      incrementActiveUploadIndex();
    }

    if (touchStart - touchEnd < -150) {
      decrementActiveUploadIndex();
    }
  };

  const activeUpload = useMemo(() => {
    if (activeUploadIndex !== null) return uploadList[activeUploadIndex];
    return null;
  }, [activeUploadIndex, uploadList]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* <button type="button" onClick={decrementActiveUploadIndex}>&lt;</button>
      <button type="button" onClick={incrementActiveUploadIndex}>&gt;</button>       */}
      <Link to="/upload" className="upload">
        +
      </Link>
      <h2 id="address" className="address">
        {activeUpload ? activeUpload.address : "Address"}
      </h2>
      {activeUpload ? (         
        <video
          id="video"
          controls
          type="video/mp4"
          src={`http://localhost:4000/videos/${activeUpload.video_file}`}          
          className="video"          
          autoPlay
          muted
        ></video>
      ) : null}
    </div>
  );
}
