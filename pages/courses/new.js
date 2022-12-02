import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NewCourse from "./components/NewCourse";

function newCourse() {
  return (
    <div>
      <Navbar />
      <NewCourse />
      <Footer />
    </div>
  );
}

export default newCourse;
