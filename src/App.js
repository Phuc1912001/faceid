import React from "react";
import FaceComparison from "./components/FaceComparison";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./components/Home";
import InputFaceID from "./components/InputFaceID";
import VideoFaceID from "./components/VideoFaceID";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <InputFaceID />,
      },
      {
        path: "/compareFaceID",
        element: <FaceComparison />,
      },
      {
        path: "/videoFaceId",
        element: <VideoFaceID />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
