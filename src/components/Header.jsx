import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div>
      <div>
        <Link to={"/"}>InputImageFaceID</Link>
      </div>
      <div>
        <Link to={"/compareFaceID"}>So sánh faceid</Link>
      </div>
      <div>
        <Link to={"/videoFaceId"}>video Faceid</Link>
      </div>
    </div>
  );
};

export default Header;
