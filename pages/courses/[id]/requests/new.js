import React from "react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import NewRequest from "../../components/NewRequest";

function newRequest() {
  return (
    <div>
      <Navbar />
      <NewRequest />
      <Footer />
    </div>
  );
}

export default newRequest;
