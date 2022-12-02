import { Box, Container, Grid, GridItem, Heading, Image, Tag, Text, Flex, Button, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/loading";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import truncateMiddle from "truncate-middle";
import Blockies from "react-blockies";
import { FiArrowUpRight } from "react-icons/fi";
import { useRouter } from "next/router";

import { useContractRead, useProvider } from "wagmi";
import { courseFactoryAddress } from "../../../utils/contractAddress";
import courseContractFactoryAbi from "../../../contracts/ABI/TaalmFactory.json";
import { getCourseContract } from "../../../utils/courseContract";

function Courses() {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const provider = useProvider();
  const [courseData, setCourseData] = useState();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const {
    data: fetchData,
    isLoading,
    isFetched,
    isFetching,
  } = useContractRead({
    addressOrName: courseFactoryAddress,
    contractInterface: courseContractFactoryAbi,
    functionName: "getDeployedCourses",
    watch: true,
  });

  async function getCourseInfo(address) {
    const course = getCourseContract(address, provider);
    const courseInformation = await course.getSummaryInformation();
    const [name, description, imageURL, author] = courseInformation;
    return {
      name,
      description,
      imageURL,
      author,
      address,
    };
  }

  const getCourseSummaries = async () => {
    let courseInfo = [];
    for (const ca of fetchData) {
      const info = await getCourseInfo(ca);
      courseInfo.push(info);
    }
    setCourseData(courseInfo);
  };

  useEffect(() => {
    getCourseSummaries();
  }, [isFetching]);

  return (
    <>
      <Navbar />

      <Container my={"4rem"} maxW={"1200px"}>
        <Box>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            <Flex alignItems={"center"}>
              <Heading fontSize={"2.25rem"} lineHeight={"2.5rem"}>
                Courses
              </Heading>
              <Text w={"2rem"} alignItems={"center"} justifyContent={"center"} fontSize={"1.2rem"} lineHeight={"2rem"} bg={"black"} color={"white"} textAlign={"center"} borderRadius={"50%"} ml={"0.75rem"} fontWeight={600}>
                {courseData?.length}
              </Text>
            </Flex>
            <Button
              borderWidth={"2px"}
              borderColor={"rgb(10 10 10/1)"}
              borderRadius={"0.625rem"}
              bg={"rgb(10 10 10/1)"}
              py={"0.375rem"}
              px={"1rem"}
              colorScheme={"black"}
              onClick={() => {
                setLoading(true);
                router.push("/courses/new");
              }}
            >
              New Course
            </Button>
          </Flex>

          {isLoading ? (
            <>
              <Flex my="10rem" justifyContent="center" alignItems="center">
                <Spinner size="xl" />
              </Flex>
            </>
          ) : fetchData?.length ? (
            <>
              {courseData ? (
                <>
                  <Grid mt={"1.5rem"} templateColumns={"repeat(3, minmax(0px, 1fr))"} gap={"2rem"}>
                    {courseData?.length &&
                      courseData
                        ?.slice(0)
                        .reverse()
                        .map((list, index) => {
                          return (
                            <GridItem key={index}>
                              <Box
                                borderWidth={"2px"}
                                borderColor={"rgb(10 10 10/1)"}
                                borderRadius={"0.625rem"}
                                overflow={"hidden"}
                                cursor={"pointer"}
                                transform={"scale(1)"}
                                transition={"transform 0.2s cubic-bezier(0.4, 0, 1, 1)"}
                                _hover={{
                                  backgroundColor: "rgb(248,248,248)",
                                  transform: "scale(1.02)",
                                  transition: "transform 0.2s cubic-bezier(0.4, 0, 1, 1)",
                                }}
                              >
                                <Box h={"200px"} overflow={"hidden"} borderBottomWidth={"2px"}>
                                  <Image alt={list.name} objectFit={"cover"} src={list.imageURL ? list.imageURL : "/assets/gradiant.png"} h={"100%"} w={"100%"} />
                                </Box>

                                <Box py={"1.2rem"} px={"1.5rem"}>
                                  <Tag borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} borderRadius={"9999px"} textTransform={"uppercase"} fontWeight={600} fontSize={"0.75rem"} lineHeight={"1rem"} py={"0.25rem"} px={"0.75rem"} bg={"rgb(183 234 213)"}>
                                    course
                                  </Tag>
                                  <Heading mt={"1rem"} fontSize={"1.5rem"} lineHeight={"2rem"} color={"#1a202c"}>
                                    {list.name}
                                  </Heading>
                                  <Text fontSize={"0.875rem"} lineHeight={"1.25rem"} color={"#888888"} my={"1rem"}>
                                    {`${list.description.substring(0, 100)}...`}
                                  </Text>
                                  <Flex borderWidth={"2px"} borderColor={"rgb(10 10 10/1)"} alignItems={"center"} borderRadius={"0.3125rem"} bg={"rgb(198 201 246)"} py={"0.25rem"} px={"0.75rem"} w={"max-content"}>
                                    <Box borderRadius={"50%"} borderWidth={"1.5px"} borderColor={"rgb(10 10 10/1)"} overflow={"hidden"}>
                                      <Blockies seed={list.author} color="#dfe" bgcolor="#aaa" default="-1" size={10} scale={2} />
                                    </Box>
                                    <Text ml={"10px"} fontSize={"0.75rem"} lineHeight={"1rem"} fontWeight={600}>
                                      {truncateMiddle(list.author || "", 5, 4, "...")}
                                    </Text>
                                  </Flex>
                                </Box>
                                <Box
                                  onClick={() => {
                                    setLoading(true);
                                    router.push(`/courses/${list.address}`);
                                  }}
                                >
                                  <Flex justifyContent={"space-between"} alignItems={"center"} borderColor={"rgb(10 10 10/1)"} borderTopWidth={"2px"} py={"1rem"} px={"2rem"} bg={"rgb(250 229 195)"}>
                                    <Text fontWeight={600}>Join Now</Text>
                                    <FiArrowUpRight fontSize={"20px"} />
                                  </Flex>
                                </Box>
                              </Box>
                            </GridItem>
                          );
                        })}
                  </Grid>
                </>
              ) : (
                <>
                  <Flex my="10rem" justifyContent="center" alignItems="center">
                    <Spinner size="xl" />
                  </Flex>
                </>
              )}
            </>
          ) : (
            <>
              <Flex my="10rem" justifyContent="center" flexDir="column" alignItems="center">
                <Image src={"/assets/page-not-found.png"} height={100} width={100} />
                <Heading fontSize="1.5em" fontWeight={500} pt="1em">
                  No Courses Found
                </Heading>
              </Flex>
            </>
          )}
        </Box>
      </Container>

      <Footer />
    </>
  );
}

export default Courses;
