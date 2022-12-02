import { Box, Button, Container, Divider, Flex, Heading, Spinner, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ImRadioChecked } from "react-icons/im";
import { useLoadingContext } from "../../../context/loading";
import Backward from "./Backward";
import ReactMarkdown from "react-markdown";

import courseContractAbi from "../../../contracts/ABI/TaalmCourse.json";
import { getCourseContract } from "../../../utils/courseContract";
import { useRouter } from "next/router";
import { useContractWrite, useProvider, useWaitForTransaction } from "wagmi";
import { getTextFromIPFS } from "../../../utils/ipfs";

function VoteRequest() {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const provider = useProvider();
  const { id, rid } = router.query;
  const toast = useToast();

  const [requestSummary, setRequestSummary] = useState();
  const [request, setRequest] = useState();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const getRequestSummary = async () => {
    const contract = getCourseContract(id, provider);
    const [[name, description], author, approved, [bigTokens, bigApprovers, baseVersion]] = await contract.returnRequestSummary(rid);
    const req = {
      name,
      description,
      author,
      approved,
      index: Number(rid),
      tokens: bigTokens.toNumber(),
      approvers: bigApprovers.toNumber(),
      baseVersion: baseVersion.toNumber(),
    };

    // console.log(req);
    setRequestSummary(req);
  };

  const getRequest = async () => {
    const contract = getCourseContract(id, provider);
    const modulesToReturn = [];
    const [moduleNames, moduleDescs, moduleMaterials, moduleQuestions] = await contract.returnRequestModules(rid);
    for (let i = 0; i < moduleNames.length; i++) {
      const mats = await getTextFromIPFS(moduleMaterials[i]);
      const qs = await getTextFromIPFS(moduleQuestions[i]);
      const moduleeee = {
        id: 1,
        name: moduleNames[i],
        description: moduleDescs[i],
        materials: mats,
        questions: qs,
      };
      modulesToReturn.push(moduleeee);
    }

    // console.log(modulesToReturn);
    setRequest(modulesToReturn);
  };

  const { data, write } = useContractWrite({
    addressOrName: id,
    contractInterface: courseContractAbi,
    functionName: "voteRequest",
    args: [rid],
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    getRequestSummary();
  }, [isSuccess]);

  useEffect(() => {
    getRequestSummary();
    getRequest();
  }, []);

  return (
    <>
      <Container my={"3.5em"} maxW={"1200px"}>
        <Backward />
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Heading fontSize={"34px"} fontWeight={700}>
            Course Pull Request
          </Heading>
          <Button borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} bg={"rgb(10 10 10/1)"} py={"0.375rem"} px={"1rem"} colorScheme={"black"} isLoading={isLoading} onClick={() => write()}>
            Vote to Request
          </Button>
        </Flex>

        <Text
          borderWidth={"2px"}
          borderColor={"rgb(10 10 10/1)"}
          alignItems={"center"}
          borderRadius={"9999px"}
          py={"0.25rem"}
          px={"0.75rem"}
          textTransform={"uppercase"}
          fontSize={"0.75rem"}
          lineHeight={"1rem"}
          fontWeight={600}
          w={"max-content"}
          mt={"2.2em"}
          bg={requestSummary?.approved ? "rgb(183 234 213)" : "rgb(250 229 195)"}
        >
          {requestSummary?.approved ? "approved" : "open"}
        </Text>

        <Box my={"3em"}>
          <Heading fontSize={"34px"} fontWeight={600}>
            {requestSummary?.name}
          </Heading>
          <Text fontSize={"18px"} lineHeight={"28px"} mt={"10px"} color={"#111111"}>
            {requestSummary?.description}
          </Text>

          <Flex mt={"1em"} alignItems={"center"}>
            <Text borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} alignItems={"center"} borderRadius={"0.3125rem"} bg={"rgb(198 201 246)"} py={"0.25rem"} px={"0.75rem"} mr={"0.5em"} fontWeight={500}>
              {requestSummary?.approvers} votes
            </Text>
            <Text borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} alignItems={"center"} borderRadius={"0.3125rem"} bg={"rgb(198 201 246)"} py={"0.25rem"} px={"0.75rem"} ml={"0.5em"} fontWeight={500}>
              {requestSummary?.tokens} / 1000 requested share
            </Text>
          </Flex>
        </Box>

        <Box>
          <Heading fontSize={"32px"} fontWeight={600}>
            Modules
          </Heading>
          <Divider />

          {request?.length ? (
            request?.map((list, index) => {
              return (
                <Box borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} p={"1em 1.5em 1.4em"} mt={"1em"} key={index}>
                  <Text fontWeight={500} fontSize={"26px"}>
                    {list.name}
                  </Text>
                  <Text mt={"0.5em"} lineHeight={"28px"}>
                    {list.description}
                  </Text>

                  <Heading mt={"1em"} fontWeight={600} fontSize={"24px"}>
                    Learning Materials
                  </Heading>
                  <Text lineHeight={"28px"} pl={"1.5em"} mt={"0.5em"}>
                    <ReactMarkdown>{list.materials}</ReactMarkdown>
                  </Text>

                  <Heading fontWeight={600} mt={"1em"} fontSize={"24px"}>
                    Questions
                  </Heading>
                  <Box pl={"1.5em"} mt={"0.5em"}>
                    <ReactMarkdown>{list.questions}</ReactMarkdown>
                  </Box>
                </Box>
              );
            })
          ) : (
            <>
              <Flex my="10rem" justifyContent="center" alignItems="center">
                <Spinner size="xl" />
              </Flex>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}

export default VoteRequest;
