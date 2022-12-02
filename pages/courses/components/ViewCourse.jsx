import { Box, Button, Container, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ImRadioChecked } from "react-icons/im";
import { useLoadingContext } from "../../../context/loading";
import Backward from "./Backward";
import ReactMarkdown from "react-markdown";

import courseContractAbi from "../../../contracts/ABI/CourseContract.json";
import { getCourseContract } from "../../../utils/courseContract";
import { useRouter } from "next/router";
import { useProvider } from "wagmi";
import { getTextFromIPFS } from "../../../utils/ipfs";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

function ViewCourse() {
  const { setLoading, loading } = useLoadingContext();
  const router = useRouter();
  const provider = useProvider();
  const { id, version } = router.query;

  const [content, setContent] = useState();
  const [selectedContent, setSelectedContent] = useState(0);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);
  // }, []);

  const getModules = async () => {
    const contract = getCourseContract(id, provider);
    const modulesToReturn = [];
    const returnedModules = await contract.returnModules(version);
    const [names, descriptions, materials, questions] = returnedModules;
    for (let i = 0; i < names.length; i++) {
      const materialsText = await getTextFromIPFS(materials[i]);
      const questionsText = await getTextFromIPFS(questions[i]);
      const moduleeeee = {
        id: 1,
        name: names[i],
        description: descriptions[i],
        materials: materialsText,
        questions: questionsText,
      };
      modulesToReturn.push(moduleeeee);
    }

    // console.log(modulesToReturn);
    setContent(modulesToReturn);
    setLoading(false);
  };

  useEffect(() => {
    getModules();
  }, []);

  const htmlFrom = (htmlString) => {
    const cleanHtmlString = DOMPurify.sanitize(htmlString, {
      USE_PROFILES: { html: true },
    });
    const html = parse(cleanHtmlString);
    return html;
  };

  return (
    <>
      <Container maxW={"1200px"} my={"3.5rem"}>
        <Backward />
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Button
            borderWidth={"2px"}
            borderColor={"rgb(10 10 10/1)"}
            borderRadius={"0.625rem"}
            bg={"rgb(10 10 10/1)"}
            py={"0.375rem"}
            px={"1rem"}
            colorScheme={"black"}
            isDisabled={selectedContent === 0}
            onClick={() => setSelectedContent(selectedContent - 1)}
          >
            Previous
          </Button>
          <Button
            borderWidth={"2px"}
            borderColor={"rgb(10 10 10/1)"}
            borderRadius={"0.625rem"}
            bg={"rgb(10 10 10/1)"}
            py={"0.375rem"}
            px={"1rem"}
            colorScheme={"black"}
            isDisabled={selectedContent === content?.length - 1}
            onClick={() => setSelectedContent(selectedContent + 1)}
          >
            Next
          </Button>
        </Flex>

        {loading && !content ? (
          <></>
        ) : (
          <Box
            borderWidth={"2px"}
            borderColor={"rgb(10 10 10/1)"}
            borderRadius={"0.625rem"}
            p={"1em 1.5em 1.4em"}
            mt={"1.5em"}
          >
            <Text fontWeight={500} fontSize={"26px"}>
              {content && content[selectedContent]?.name}
            </Text>
            <Text mt={"0.5em"} lineHeight={"28px"}>
              {content && content[selectedContent]?.description}
            </Text>

            <Heading mt={"1em"} fontWeight={600} fontSize={"24px"}>
              Learning Materials
            </Heading>
            <Box pl={"1.5em"} mt={"0.5em"}>
              {content && htmlFrom(content[selectedContent]?.materials)}
            </Box>
            {/* <Text lineHeight={"28px"} pl={"1.5em"} mt={"0.5em"}> */}

            {/* </Text> */}

            <Heading fontWeight={600} mt={"1em"} fontSize={"24px"}>
              Questions
            </Heading>
            <Box pl={"1.5em"} mt={"0.5em"}>
              {/* <ReactMarkdown> */}
              {content && htmlFrom(content[selectedContent]?.questions)}
              {/* </ReactMarkdown> */}
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}

export default ViewCourse;
