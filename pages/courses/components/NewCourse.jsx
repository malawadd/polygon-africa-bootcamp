import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/loading";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import Backward from "./Backward";
import { AiOutlineInbox } from "react-icons/ai";
import { message, Upload } from "antd";
import "antd/dist/antd.css";
import Module from "./Module";

import { newUploadMarkdownData, uploadToIpfs } from "../../../utils/ipfs";
import { useSigner } from "wagmi";
import { courseFactoryAddress } from "../../../utils/contractAddress";
import { getCourseFactoryContract } from "../../../utils/courseContract";
import { useRouter } from "next/router";

const { Dragger } = Upload;

function NewCourse() {
  const { setLoading } = useLoadingContext();
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [courseModuleList, setCourseModuleList] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [moduleSave, setModuleSave] = useState(true);
  const { data: signer } = useSigner();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  function onChange(e) {
    setCourseDetails(() => ({
      ...courseDetails,
      [e.target.name]: e.target.value,
    }));
  }

  const props = {
    name: "file",
    multiple: false,

    onChange(e) {
      const { status } = e.file;
      console.log(e.file);
      // if (status !== "uploading") {
      //   console.log(info.file, info.fileList);
      setCourseDetails({ image: e.file.originFileObj });
      // }

      if (status === "done") {
        message.success(`${e.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${e.file.name} file upload failed.`);
      }
    },

    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files[0]);
      setCourseDetails({ image: e.dataTransfer.files[0] });
    },
  };

  // ////////////////////
  // ////////////////////
  // ////////////////////
  // ////////////////////

  const processModuleData = async () => {
    let names = [];
    let descriptions = [];
    let materials = [];
    let questions = [];

    for (const modulii of courseModuleList) {
      names.push(modulii.moduleName);
      descriptions.push(modulii.moduleDes);
      const materialsURL = await newUploadMarkdownData(modulii.moduleMaterial);
      const questionsURL = await newUploadMarkdownData(modulii.moduleQues);
      materials.push(materialsURL);
      questions.push(questionsURL);
    }
    return { names, descriptions, materials, questions };
  };

  const getModuleIndex = (id) => {
    let moduleIndex = 0;
    modules.forEach((module, index) => {
      if (module.id === id) moduleIndex = index;
    });
    return moduleIndex;
  };

  async function letsCreateCourse() {
    setCourseLoading(true);
    const { names, descriptions, materials, questions } =
      await processModuleData();

    const imageUrl = await uploadToIpfs(courseDetails.image);

    console.log(names, descriptions, materials, questions);
    // console.log(imageUrl);
    const contract = await getCourseFactoryContract(
      courseFactoryAddress,
      signer
    );

    console.log(courseDetails.title, courseDetails.description);
    const tx = await contract.createCourse(
      courseDetails.title,
      courseDetails.description,
      imageUrl,
      0,
      names,
      descriptions,
      materials,
      questions
    );
    await tx.wait();
    setTimeout(() => {
      toast({
        title: "Transaction Success",
        description: "wait for indexing..",
        status: "success",
        variant: "subtle",
        position: "top",
        duration: 2000,
      });
      setCourseLoading(false);
    }, 500);
    setTimeout(() => {
      setLoading(true);
      router.push("/courses");
    }, 3000);
  }

  return (
    <>
      <Container my={"3.5em"} maxW={"1200px"}>
        <Backward />

        <Heading>Create New Course</Heading>
        <Divider />

        <Box mt={"2em"}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="title"
              value={courseDetails.title}
              onChange={onChange}
            />
          </FormControl>
          <FormControl mt={"1em"} isRequired>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={courseDetails.description}
              onChange={onChange}
            />
          </FormControl>
        </Box>

        <Box mt={"2em"}>
          <Dragger {...props}>
            <Box align={"center"} className="ant-upload-drag-icon">
              <AiOutlineInbox
                style={{
                  fontSize: "3rem",
                  color: "#3FA9FF",
                  marginBottom: "10px",
                }}
              />
            </Box>
            <Text
              color={"blackAlpha.700 !important"}
              className="ant-upload-text"
            >
              Click or drag cover image to this area to upload
            </Text>
          </Dragger>
        </Box>

        <Box>
          <Module
            setModuleSave={setModuleSave}
            setCourseModuleList={setCourseModuleList}
          />{" "}
        </Box>

        <Button
          borderWidth={"2px"}
          borderColor={"rgb(10 10 10/1)"}
          borderRadius={"0.625rem"}
          bg={"rgb(10 10 10/1)"}
          py={"0.375rem"}
          px={"1rem"}
          colorScheme={"black"}
          mt={"1.5em"}
          onClick={letsCreateCourse}
          isLoading={courseLoading}
          isDisabled={moduleSave}
        >
          Create
        </Button>
      </Container>
    </>
  );
}

export default NewCourse;
