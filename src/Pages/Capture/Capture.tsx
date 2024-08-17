import { Camera, PlayCircle, StopCircle } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

const Capture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0 && interval) {
      setRecordingTime(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const recorder = new MediaRecorder(stream);
        recorder.onstart = () => {
          recordedChunksRef.current = [];
        };
        recorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0) {
            const prev = recordedChunksRef.current;
            recordedChunksRef.current = [...prev, e.data];
          }
        });
        setMediaRecorder(recorder);
      }
    })();
  }, []);

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const link = document.createElement("a");
      link.href = canvasRef.current.toDataURL("image/png");
      link.download = "captured_photo.png";
      link.click();
    }
  };

  const startRecording = () => {
    if (videoRef.current && mediaRecorder) {
      setIsRecording(true);
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setTimeout(() => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
        const videoURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = videoURL;
        link.download = "video.mp4";
        link.click();
      }, 0);
      setIsRecording(false);
    }
  };

  return (
    <>
      <Box height={"100vh"} width={"100%"} position={"relative"}>
        <Box
          component={"video"}
          ref={videoRef}
          autoPlay
          width={"100%"}
          height={"100%"}
          sx={{
            objectFit: "cover",
          }}
        />
        <Stack
          position={"absolute"}
          flexDirection={"row"}
          sx={{
            bottom: "0",
            background: "#f1faee",
            left: "50%",
            borderRadius: "5rem",
            transform: "translate(-50%, -10%)",
          }}
        >
          <IconButton
            onClick={startRecording}
            title="Start Recording"
            disabled={isRecording}
          >
            <PlayCircle
              sx={{
                fontSize: "6rem",
                color: isRecording ? "#1d3557" : "#457b9d",
              }}
            />
          </IconButton>
          <IconButton onClick={stopRecording} title="Stop Recording">
            <StopCircle
              sx={{
                fontSize: "6rem",
                color: "#e63946",
              }}
            />
          </IconButton>
          <IconButton onClick={capturePhoto} title="Capture">
            <Camera
              sx={{
                fontSize: "6rem",
              }}
            />
          </IconButton>
        </Stack>
        <Box
          position={"absolute"}
          bgcolor={"#1d3557"}
          top={"1rem"}
          height={"4rem"}
          width={"6rem"}
          borderRadius={"10rem"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          right={"2rem"}
        >
          <Typography color={"#f1faee"} fontSize={"2.4rem"}>
            {recordingTime}
          </Typography>
        </Box>
      </Box>
      <Box component={"canvas"} ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default Capture;
