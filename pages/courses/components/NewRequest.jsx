import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/loading";
import { Box, Button, Container, Divider, FormControl, FormLabel, Heading, Input, useToast } from "@chakra-ui/react";
import Backward from "./Backward";
import Module from "./Module";

import { newUploadMarkdownData } from "../../../utils/ipfs";
import { useSigner, useProvider, useContractRead } from "wagmi";
import { getCourseContract } from "../../../utils/courseContract";
import { useRouter } from "next/router";
import courseContractAbi from "../../../contracts/ABI/TaalmCourse.json";
function NewRequest() {
  const { setLoading } = useLoadingContext();
  const [moduleDetails, setModuleDetails] = useState({
    title: "",
    description: "",
    tokens: "",
  });
  const [courseModuleList, setCourseModuleList] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [moduleSave, setModuleSave] = useState(true);
  const [oldModuleDetails, setOldModuleDetails] = useState();
  const [versions, setVersions] = useState();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

  function onChange(e) {
    setModuleDetails(() => ({
      ...moduleDetails,
      [e.target.name]: e.target.value,
    }));
  }

  const { data } = useContractRead({
    addressOrName: id,
    contractInterface: courseContractAbi,
    functionName: "index",
    watch: true,
  });

  const getModules = async (version) => {
    const contract = getCourseContract(id, provider);
    const modulesToReturn = [];
    const [names, descriptions, materials, questions] = await contract.returnModules(version);
    for (let i = 0; i < names.length; i++) {
      const modulee = {
        id: 1,
        name: names[i],
        description: descriptions[i],
        materials: materials[i],
        questions: questions[i],
      };
      modulesToReturn.push(modulee);
    }
    setOldModuleDetails(modulesToReturn);
    return modulesToReturn;
  };

  const processModuleData = async () => {
    let modulesToReturn = await getModules(selectedVersion);
    let names = [];
    let descriptions = [];
    let materials = [];
    let questions = [];

    for (const i of modulesToReturn) {
      names.push(i.name);
      descriptions.push(i.description);
      materials.push(i.materials);
      questions.push(i.questions);
    }

    for (const moduli of courseModuleList) {
      names.push(moduli.moduleName);
      descriptions.push(moduli.moduleDes);
      const materialsURL = await newUploadMarkdownData(moduli.moduleMaterial);
      const questionsURL = await newUploadMarkdownData(moduli.moduleQues);
      materials.push(materialsURL);
      questions.push(questionsURL);
    }
    return { names, descriptions, materials, questions };
  };

  const createRequestHandler = async () => {
    setModuleLoading(true);
    const { names, descriptions, materials, questions } = await processModuleData();

    console.log(names, descriptions, materials, questions);
    const contract = getCourseContract(id, signer);

    const tx = await contract.createRequest(moduleDetails.title, moduleDetails.description, moduleDetails.tokens, names, descriptions, materials, questions, selectedVersion);
    await tx.wait();
    setTimeout(() => {
      toast({
        title: "Transaction Success",
        description: "wait for indexing",
        status: "success",
        variant: "subtle",
        position: "top",
        duration: 2000,
      });
      setModuleLoading(false);
    }, 500);
    setTimeout(() => {
      setLoading(true);
      router.push(`/courses/${id}`);
    }, 1000);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    console.log(data?.toNumber());
    const possibleVersions = Array.from(Array(data?.toNumber()).keys());
    // data?.toNumber === 0
    //   ? setSelectedVersion(data?.toNumber())
    setSelectedVersion(data?.toNumber() - 1);
    setVersions(data?.toNumber());
  }, [id]);

  return (
    <>
      <Container my={"3.5em"} maxW={"1200px"}>
        <Backward />

        <Heading>Create Pull Request</Heading>
        <Divider />

        <Box mt={"2em"}>
          <FormControl>
            <FormLabel>Base Version</FormLabel>
            <Input isDisabled placeholder={versions} />
          </FormControl>
          <FormControl isRequired mt={"1em"}>
            <FormLabel>PR Title</FormLabel>
            <Input name="title" value={moduleDetails.title} onChange={onChange} />
          </FormControl>
          <FormControl isRequired mt={"1em"}>
            <FormLabel>Description of changes</FormLabel>
            <Input name="description" value={moduleDetails.description} onChange={onChange} />
          </FormControl>
          <FormControl isRequired mt={"1em"}>
            <FormLabel>Requested course shares (out of 1000 total)</FormLabel>
            <Input name="tokens" value={moduleDetails.tokens} onChange={onChange} />
          </FormControl>
        </Box>

        <Module setModuleSave={setModuleSave} setCourseModuleList={setCourseModuleList} />

        <Button borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} bg={"rgb(10 10 10/1)"} py={"0.375rem"} px={"1rem"} colorScheme={"black"} mt={"1.5em"} isDisabled={moduleSave} isLoading={moduleLoading} onClick={createRequestHandler}>
          Submit
        </Button>
      </Container>
    </>
  );
}

export default NewRequest;
