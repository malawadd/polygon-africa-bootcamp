import React from "react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import VoteRequest from "../../components/VoteRequest";

function index() {
  return (
    <div>
      <Navbar />
      <VoteRequest />
      <Footer />
    </div>
  );
}

export default index;
