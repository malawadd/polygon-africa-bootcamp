import React from "react";
import { useRouter } from "next/router";
import { IoPlayBack } from "react-icons/io5";
import { Box, Flex, Text } from "@chakra-ui/react";

function Backward() {
  const router = useRouter();
  return (
    <>
      <Box>
        <Flex
          cursor="pointer"
          onClick={() => router.back()}
          textDecoration="underline"
          fontFamily="Montserrat"
          alignItems="center"
          mb={"2em"}
        >
          <IoPlayBack fontSize="11px" />
          <Text ml="10px" fontSize="15px">
            Back
          </Text>
        </Flex>
      </Box>
    </>
  );
}

export default Backward;
