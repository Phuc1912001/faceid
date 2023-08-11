import React, { useState, useEffect } from "react";

import * as faceapi from "face-api.js";
import Toastify from "toastify-js";

function InputFaceID() {
  const [loading, setLoading] = useState(true);
  const [faceMatcher, setFaceMatcher] = useState(null);
  // tải các model nhận diện khuôn mặt
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
  // đoạn này em cho máy nó học để nó có thể nhận diện được khuôn mặt
  async function loadTrainingData() {
    const labels = ["Harrwon", "TranThanh"];
    //Mảng này sẽ lưu trữ các mô tả (descriptors) của khuôn mặt
    const faceDescriptors = [];
    // vòng lặp lặp qua từng mảng label
    for (const label of labels) {
      const descriptors = [];
      for (let i = 1; i <= 4; i++) {
        const image = await faceapi.fetchImage(`/data/${label}/${i}.png`);
        // đoạn này là nó nhận diện từng khuôn mặt và điểm đặc trưng
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
    // trả về dữ liệu đã được huấn luyện
    return faceDescriptors;
  }

  useEffect(() => {
    if (!loading) {
      async function initializeFaceMatcher() {
        const trainingData = await loadTrainingData();

        //Nó sử dụng dữ liệu huấn luyện từ trainingData
        //và một ngưỡng (0.6 trong trường hợp này) để quyết định xem một khuôn mặt cụ thể có khớp với dữ liệu huấn luyện hay không.
        const matcher = new faceapi.FaceMatcher(trainingData, 0.6);
        setFaceMatcher(matcher);
      }

      initializeFaceMatcher();
    }
  }, [loading]);

  async function handleFileInputChange(event) {
    const files = event.target.files;
    //chuyển đổi dữ liệu của tệp hình ảnh thành một đối tượng
    const image = await faceapi.bufferToImage(files[0]);

    const canvas = faceapi.createCanvasFromMedia(image);
    // Lấy tham chiếu đến phần tử có id "container" trong HTML.
    const container = document.querySelector("#container");
    //Xóa bỏ nội dung hiện tại của phần tử "container", sẵn sàng để thêm hình ảnh và canvas vào đó.
    container.innerHTML = "";
    //Thêm đối tượng hình ảnh  vào phần tử "container".
    container.appendChild(image);
    container.appendChild(canvas);

    // tạo đối tượng size để chưa thông tin và kích thước
    const size = {
      width: image.width,
      height: image.height,
    };
    // Đảm bảo rằng kích thước của canvas khớp với kích thước của hình ảnh.
    faceapi.matchDimensions(canvas, size);
    //để phát hiện tất cả các khuôn mặt trong hình ảnh,
    //sau đó cùng lúc với đặc điểm trên khuôn mặt
    //và descriptors (mô tả khuôn mặt).
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, size);
    //Duyệt qua tất cả các kết quả phát hiện đã được thay đổi kích thước.
    for (const detection of resizedDetections) {
      //Vẽ một hình chữ nhật (khung) xung quanh khuôn mặt đã phát hiện trong canvas,
      //sử dụng thông tin về hình chữ nhật được phát hiện từ kết quả.
      const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
        label: faceMatcher.findBestMatch(detection.descriptor).toString(),
      });
      //Thực hiện việc vẽ khung vào canvas.
      drawBox.draw(canvas);
    }
  }

  return (
    <div className="App">
      <h1>Nhận diện Khuôn mặt </h1>
      {loading ? (
        <p id="loading">Hệ thống đang tải dữ liệu ...</p>
      ) : (
        <>
          <input
            type="file"
            name="file"
            id="file-input"
            onChange={handleFileInputChange}
          />
          <div id="container"></div>
        </>
      )}
    </div>
  );
}

export default InputFaceID;
