import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import UseAnimations from "react-useanimations";
import infinity from "react-useanimations/lib/infinity";
import { useLoadingContext } from "../../context/loading";

function Loading() {
  const { loading } = useLoadingContext();
  return (
    <>
      {loading && (
        <Box h={"100%"} position={"fixed"} bg={"rgba(255, 255, 255,0.96)"} zIndex={"999"} w={"100%"} overflow={"hidden"}>
          <Box position={"fixed"} top={"45%"} left={"50%"} transform={"translate(-50%, -50%)"}>
            <Flex>
              <Flex className="loading-text" alignItems={"center"} flexDirection={"column"}>
                <Heading mb={"10px"} color={"#1A202C"} fontWeight={700} fontSize={"3em"} className={"h-shadow-black"} fontFamily={"Philosopher !important"}>
                  polygon africa bootcamp
                </Heading>
                <UseAnimations size={36} animation={infinity} />
              </Flex>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
}

export default Loading;
