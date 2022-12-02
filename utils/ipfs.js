import { create } from "ipfs-http-client";
const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

export const getTextFromIPFS = async (url) => {
  const response = await fetch(url);
  if (response.ok) {
    const text = await response.text();
    return text;
  }
  return "";
};

export const newUploadMarkdownData = async (text) => {
  const file = new File([text], "text.txt", { type: "text/plain" });
  try {
    const added = await client.add(file);
    const url = `https://ipfs.infura.io/ipfs/${added.path}`;
    console.log(url);
    return url;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
  return "";
};

export const uploadToIpfs = async (file) => {
  try {
    const added = await client.add(file);
    const url = `https://ipfs.infura.io/ipfs/${added.path}`;
    console.log(url);
    return url;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};
