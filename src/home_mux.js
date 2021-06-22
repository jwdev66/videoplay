import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import Mux from "@mux/mux-node";
import Hls from "hls.js";
import "./home.css";

const uploadsRoute = "http://localhost:4000/api/upload_list";
const { Video } = new Mux(
  process.env.REACT_APP_MUX_TOKEN_ID,
  process.env.REACT_APP_MUX_TOKEN_SECRET
);

export default function Home() {
  const [uploadList, setUploadList] = useState([]);
  const [muxPlaybackIDList, setMuxPlaybackIDList] = useState([]);
  const [activeUploadIndex, setActiveUploadIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRef = useRef(null);
  const [videoSRC, setVideoSrc] = useState("");
  const [currentAsset, setCurrentAsset] = useState(null);

  const activeUpload = useMemo(() => {
    if (uploadList[activeUploadIndex]) {
      return uploadList[activeUploadIndex];
    }
    return null;
  }, [activeUploadIndex, uploadList]);

  useEffect(() => {
    let hls;

    if (videoSRC) {
      if (videoRef.current) {
        const video = videoRef.current;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Some browers (safari and ie edge) support HLS natively
          video.src = videoSRC;
        } else if (Hls.isSupported()) {
          // This will run in all other modern browsers
          hls = new Hls();
          hls.loadSource(videoSRC);
          hls.attachMedia(video);
        } else {
          console.error("This is a legacy browser that doesn't support MSE");
        }
      }
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoRef, videoSRC]);

  useEffect(() => {
    let id;
    if (currentAsset) {
      id = setInterval(async () => {
        const asset = await Video.Assets.get(currentAsset.id);
        if (asset.status === "ready") {          
          const newList = [...muxPlaybackIDList];
          newList[activeUploadIndex] = asset.playback_ids[0].id;
          setMuxPlaybackIDList(newList);
          clearInterval(id);
          setCurrentAsset(null);
        }
      }, 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [currentAsset, activeUploadIndex, muxPlaybackIDList]);

  useEffect(() => {
    (async () => {
      const response = await fetch(uploadsRoute);
      const json = await response.json();
      setUploadList(json);
      setMuxPlaybackIDList(new Array(json.length).fill(""));
      if (json.length > 0) {
        setActiveUploadIndex(0);
      }
    })();
  }, []);

  const uploadToMux = useCallback(async () => {
    if (activeUpload) {      
      const asset = await Video.Assets.create({
        input: `http://localhost:4000/videos/${activeUpload.video_file}`,        
        playback_policy: ["public"],
      });
      setCurrentAsset(asset);
    }
  }, [activeUpload]);

  useEffect(() => {
    if (muxPlaybackIDList[activeUploadIndex]) {
      setVideoSrc(
        `https://stream.mux.com/${muxPlaybackIDList[activeUploadIndex]}.m3u8`
      );
    } else {
      uploadToMux();
    }
  }, [activeUploadIndex, uploadList, muxPlaybackIDList, uploadToMux]);

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
      {videoSRC && <video controls ref={videoRef} className="video" />}
    </div>
  );
}
