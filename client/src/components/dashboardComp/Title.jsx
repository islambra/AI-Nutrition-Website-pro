import React from "react";
import "./Title.css"; 

const Title = ({ title, subTitle }) => {
  return (
    <>
      <h1 className="title-heading">{title}</h1>
      <p className="title-sub">{subTitle}</p>
    </>
  );
};

export default Title;