import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import Toastify from "toastify-js";

function FaceComparison() {
  const [loading, setLoading] = useState(true);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [pairingSuccess, setPairingSuccess] = useState(false);

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
  // Bạn định nghĩa hàm hasFace để kiểm tra xem một ảnh có chứa mặt người không.
  // Hàm này sử dụng face-api.js để phát hiện khuôn mặt trong ảnh
  // và trả về kết quả true nếu có khuôn mặt và false nếu không có.
  async function hasFace(image) {
    const img = await faceapi.bufferToImage(image);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks();

    return !!detections;
  }

  async function handleNextClick() {
    if (!image1 || !image2) {
      Toastify({
        text: "Vui lòng chọn cả hai ảnh!",
      }).showToast();
      return;
    }

    const hasFace1 = await hasFace(image1);
    const hasFace2 = await hasFace(image2);
    // nếu 1 trong 2 ảnh không có mặt người thì  setPairingSuccess(false);
    // để đảm bảo không thực hiện việc ghép đôi
    if (!hasFace1 || !hasFace2) {
      Toastify({
        text: "Cả hai ảnh phải đều có mặt người!",
      }).showToast();
      setPairingSuccess(false);
      return;
    }

    // Cả hai ảnh đều có mặt người thì setPairingSuccess(true);
    setPairingSuccess(true);
  }

  return (
    <div className="App">
      <h1 style={{ marginBottom: "20px" }}>Ghép đôi</h1>
      {loading ? (
        <p id="loading">Hệ thống đang tải dữ liệu ...</p>
      ) : (
        <>
          <div className="container-img">
            <div style={{ marginBottom: "20px" }}>
              <input
                type="file"
                name="file1"
                id="file-input1"
                onChange={(event) => setImage1(event.target.files[0])}
              />
              {image1 && (
                <img
                  src={URL.createObjectURL(image1)}
                  alt="Image 1"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="file"
                name="file2"
                id="file-input2"
                onChange={(event) => setImage2(event.target.files[0])}
              />
              {image2 && (
                <img
                  src={URL.createObjectURL(image2)}
                  alt="Image 2"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>
          </div>
          <button
            onClick={handleNextClick}
            style={{ padding: "10px 20px", fontSize: "16px" }}
          >
            Ghép đôi
          </button>
          {pairingSuccess && (
            <p style={{ marginTop: "20px" }}>Ghép đôi thành công!</p>
          )}
        </>
      )}
    </div>
  );
}

export default FaceComparison;
