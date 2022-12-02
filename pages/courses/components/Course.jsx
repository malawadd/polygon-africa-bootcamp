import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLoadingContext } from "../../../context/loading";
import { Box, Button, Container, Divider, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from "@chakra-ui/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Blockies from "react-blockies";
import truncateMiddle from "truncate-middle";
import PullRequests from "./PullRequests";
import Backward from "./Backward";

import { useAccount, useContractRead, useContractWrite, useProvider, useSigner, useWaitForTransaction } from "wagmi";
import { useContractReads } from "wagmi";
import { courseFactoryAddress } from "../../../utils/contractAddress";
import courseContractFactoryAbi from "../../../contracts/ABI/TaalmFactory.json";
import courseContractAbi from "../../../contracts/ABI/TaalmCourse.json";
import { getCourseContract } from "../../../utils/courseContract";

function Course() {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const { id } = router.query;
  const { address } = useAccount();
  const provider = useProvider();
  const [courseVersion, setCourseVersion] = useState(0);
  const [allCourseVersion, setAllCourseVersion] = useState();
  const [modules, setModules] = useState();
  const [requests, setRequests] = useState();
  const [hasEnrolled, setHasEnrolled] = useState();
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      // setLoading(false);
    }, 1500);
  }, []);

  const { data: fetchCourse, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: id,
        contractInterface: courseContractAbi,
        functionName: "getSummaryInformation",
      },
    ],
    watch: true,
  });

  const getModules = async () => {
    const modulesToReturn = [];
    const contract = getCourseContract(id, provider);
    const [names, descriptions, materials, questions] = await contract.returnModules(courseVersion);
    for (let i = 0; i < names.length; i++) {
      const moduleee = {
        id: 1,
        name: names[i],
        description: descriptions[i],
        materials: materials[i],
        questions: questions[i],
      };
      modulesToReturn.push(moduleee);
    }
    setModules(modulesToReturn);
    // console.log(modules);
  };

  const getPullRequests = async () => {
    const pullRequestsToReturn = [];
    const contract = getCourseContract(id, provider);
    const numberOfRequests = await contract.requestIndex();
    for (let i = 0; i < numberOfRequests; i++) {
      const [[name, description], author, approved, [bigTokens, bigApprovers, baseVersion]] = await contract.returnRequestSummary(i);
      pullRequestsToReturn.push({
        name,
        description,
        author,
        approved,
        index: i,
        tokens: bigTokens.toNumber(),
        approvers: bigApprovers.toNumber(),
        baseVersion: baseVersion.toNumber(),
      });
    }

    setRequests(pullRequestsToReturn);
    // setRequestsAreLoading(false);

    const bigVersion = await contract.index();
    const version = bigVersion.toNumber();
    const possibleVersions = Array.from(Array(version).keys());
    setAllCourseVersion(possibleVersions);
    setCourseVersion(version - 1);
    setLoading(false);
    // console.log(allCourseVersion);
  };

  const getLatestVersion = async () => {
    const contract = getCourseContract(id, provider);
    const bigVersion = await contract.index();
    const version = bigVersion.toNumber();
    const possibleVersions = Array.from(Array(version).keys());
    setAllCourseVersion(possibleVersions);
    setCourseVersion(version - 1);
  };

  const { data, write } = useContractWrite({
    addressOrName: courseFactoryAddress,
    contractInterface: courseContractFactoryAbi,
    functionName: "joinCourse",
    args: [id],
  });

  const { isLoading: enrolling, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const hasUserEnrolled = async () => {
    const contract = getCourseContract(id, provider);
    const userCourses = await contract.enrolled(address);

    setHasEnrolled(userCourses);
  };

  useEffect(() => {
    getModules();
  }, [courseVersion]);

  useEffect(() => {
    hasUserEnrolled();
  }, [isSuccess]);

  useEffect(() => {
    getModules();
    // console.log(modules);
    // getLatestVersion();
    getPullRequests();
    hasUserEnrolled();
  }, []);

  return (
    <>
      <Navbar />

      <Container my={"4rem"} maxW={"1200px"}>
        <Backward />

        {isLoading ? (
          <>
            <Flex my="10rem" justifyContent="center" alignItems="center">
              <Spinner size="xl" />
            </Flex>
          </>
        ) : (
          <>
            <Flex px={"1em"} justifyContent={"space-between"} alignItems={"center"}>
              <Box>
                <Heading fontWeight={600}>{fetchCourse?.length ? fetchCourse[0][0] : null}</Heading>
              </Box>

              <Menu autoSelect={false}>
                <MenuButton as={Button}>
                  <Flex alignItems={"center"}>
                    <Text>Version</Text>
                    <Text w={"1.5rem"} alignItems={"center"} justifyContent={"center"} fontSize={"1rem"} lineHeight={"1.5rem"} bg={"black"} color={"white"} textAlign={"center"} borderRadius={"50%"} ml={"0.75rem"} fontWeight={600}>
                      {courseVersion}
                    </Text>
                  </Flex>
                </MenuButton>
                <MenuList>
                  {allCourseVersion?.length &&
                    allCourseVersion?.map((list, index) => {
                      return (
                        <MenuItem onClick={(e) => setCourseVersion(e.target.value)} value={list} key={index}>
                          {list}
                        </MenuItem>
                      );
                    })}
                </MenuList>
              </Menu>
            </Flex>

            <Flex borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} alignItems={"center"} borderRadius={"0.3125rem"} bg={"rgb(198 201 246)"} py={"0.25rem"} px={"0.75rem"} w={"max-content"} my={"1.3em"} mx={"1em"}>
              <Box borderRadius={"50%"} borderWidth={"1.5px"} borderColor={"rgb(10 10 10/1)"} overflow={"hidden"}>
                <Blockies seed={fetchCourse.length && fetchCourse[0][3]} color="#dfe" bgcolor="#aaa" default="-1" size={10} scale={2} />
              </Box>
              <Text ml={"10px"} fontSize={"0.75rem"} lineHeight={"1rem"} fontWeight={600}>
                {truncateMiddle((fetchCourse.length && fetchCourse[0][3]) || "", 5, 4, "...")}
              </Text>
            </Flex>

            <Box>
              <Box p={"1em"} mt={"2em"} mb={"2em"} borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} maxH={"600px"}>
                <Box bg={"white"} w={"100%"} h={"500px"} backgroundImage={fetchCourse.length && fetchCourse[0][2]} backgroundPosition={"center"} backgroundColor="#662EA7" backgroundRepeat={"no-repeat"} backgroundSize={"cover"} />
              </Box>

              <Box px={"1em"}>
                <Text fontSize={"18px"} lineHeight={"28px"}>
                  {fetchCourse.length && fetchCourse[0][1]}
                </Text>

                <Flex alignItems={"center"} mt={"3.5em"} mb={"0.2em"}>
                  <Heading fontSize={"34px"} fontWeight={600}>
                    Modules
                  </Heading>
                  <Text w={"2rem"} alignItems={"center"} justifyContent={"center"} fontSize={"1.2rem"} lineHeight={"2rem"} bg={"black"} color={"white"} textAlign={"center"} borderRadius={"50%"} ml={"0.75rem"} fontWeight={600}>
                    {modules?.length}
                  </Text>
                </Flex>

                <Divider />
                <Box>
                  {modules?.map((list, index) => {
                    return (
                      <Box borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} p={"1em"} mt={"1em"} key={index}>
                        <Heading fontWeight={500} fontSize={"24px"}>
                          {list.name}
                        </Heading>
                        <Text fontSize={"16px"} mt={"10px"} color={"#888888"}>
                          {list.description}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>

                {hasEnrolled ? (
                  <Button
                    borderWidth={"2px"}
                    borderColor={"rgb(10 10 10/1)"}
                    borderRadius={"0.625rem"}
                    bg={"rgb(10 10 10/1)"}
                    py={"0.375rem"}
                    px={"1rem"}
                    colorScheme={"black"}
                    mt={"2em"}
                    onClick={() => {
                      setLoading(true);
                      router.push(`/courses/${id}/version/${courseVersion}`);
                    }}
                  >
                    Go to Course
                  </Button>
                ) : (
                  <Button borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"0.625rem"} bg={"rgb(10 10 10/1)"} py={"0.375rem"} px={"1rem"} colorScheme={"black"} mt={"2em"} onClick={() => write()} isLoading={enrolling}>
                    Enroll Now
                  </Button>
                )}

                <PullRequests setLoading={setLoading} id={id} requests={requests} />
              </Box>
            </Box>
          </>
        )}
      </Container>

      <Footer />
    </>
  );
}

export default Course;
