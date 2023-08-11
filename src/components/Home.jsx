import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div>
        <Link to={"/inputFaceId"}>InputImageFaceID</Link>
      </div>
      <div>
        <Link to={"/compareFaceID"}>So sánh faceid</Link>
      </div>
      <Link to={"/"}>Home</Link>
    </div>
  );
};

export default Home;
