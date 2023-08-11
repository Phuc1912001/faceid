import * as faceapi from "face-api.js";
import Toastify from "toastify-js";

import React, { useEffect, useRef, useState } from "react";

const VideoFaceID = () => {
  const [loading, setLoading] = useState(true);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    async function loadModelsAndData() {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);

      Toastify({
        text: "Tải xong model nhận diện!",
      }).showToast();

      setLoading(false);
    }

    loadModelsAndData();
  }, []);

  async function loadTrainingData() {
    const labels = ["Harrwon", "TranThanh"];

    const faceDescriptors = [];
    for (const label of labels) {
      const descriptors = [];
      for (let i = 1; i <= 4; i++) {
        const image = await faceapi.fetchImage(`/data/${label}/${i}.png`);
        const detection = await faceapi
          .detectSingleFace(image)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptors.push(detection.descriptor);
      }
      faceDescriptors.push(
        new faceapi.LabeledFaceDescriptors(label, descriptors)
      );
      Toastify({
        text: `Training xong data của ${label}!`,
      }).showToast();
    }

    return faceDescriptors;
  }

  useEffect(() => {
    if (!loading) {
      async function initializeFaceMatcher() {
        const trainingData = await loadTrainingData();
        const matcher = new faceapi.FaceMatcher(trainingData, 0.6);
        setFaceMatcher(matcher);
      }

      initializeFaceMatcher();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && webcamRef.current !== null) {
      const videoElement = webcamRef.current;
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoElement.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    }
  }, [loading]);

  async function handleWebcamCapture() {
    if (webcamRef.current) {
      const video = webcamRef.current;
      const canvas = faceapi.createCanvasFromMedia(video);
      const container = document.querySelector("#container");

      // Wait for the loadedmetadata event to ensure video dimensions are set
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });

      const size = {
        width: video.width,
        height: video.height,
      };

      faceapi.matchDimensions(canvas, size);

      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, size);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      for (const detection of resizedDetections) {
        const label = faceMatcher
          .findBestMatch(detection.descriptor)
          .toString();

        const boxColor = label === "unknown" ? "red" : "green"; // Change color based on label

        const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
          label: label,
          boxColor: boxColor, // Use the defined color
        });
        drawBox.draw(canvas);

        // Draw the label
        const drawLabel = new faceapi.draw.DrawTextField(
          [label],
          detection.detection.box.bottomLeft
        );
        drawLabel.draw(canvas);
      }

      container.innerHTML = "";
      container.appendChild(canvas);
    }
  }

  return (
    <div className="App">
      <h1>Nhận diện Khuôn mặt webcam</h1>
      {loading ? (
        <p id="loading">Hệ thống đang tải dữ liệu ...</p>
      ) : (
        <>
          <div id="container"></div>
          <button onClick={handleWebcamCapture}>Nhận diện từ Webcam</button>
          <video ref={webcamRef} autoPlay muted></video>
        </>
      )}
    </div>
  );
};

export default VideoFaceID;
