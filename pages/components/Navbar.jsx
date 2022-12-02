import React, { useEffect } from "react";
import { Flex, Heading, Image, Link, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useLoadingContext } from "../../context/loading";
import { createClient, configureChains, defaultChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

function Navbar() {
  const router = useRouter();
  const { isDisconnected, address } = useAccount();
  const { setLoading } = useLoadingContext();

  useEffect(() => {
    if (isDisconnected) {
      setLoading(true);
      router.replace("/");
    }
  }, [isDisconnected]);

  return (
    <>
      <Flex px={"4em"} py={"1.5em"} alignItems={"center"} justifyContent={"space-between"}>
        <Link href="/" _hover={{ textDecoration: "none" }}>
          <Flex alignItems={"center"}>
            <Image className="rotate" alt="logo" boxSize={"30px"} src={"/assets/community.png"} />
            <Heading ml={"15px"} fontWeight={700} className={"h-shadow-black"} fontFamily={"Philosopher !important"}>
              polygon-africa-bootcamp
            </Heading>
          </Flex>
        </Link>

        {router.asPath === "/" || router.asPath === "/membership" ? null : (
          <Flex alignItems={"center"}>
            <Link _hover={{ textDecoration: "none" }} href="/courses">
              <Text fontSize={"1.125rem"} color={"#0a0a0a"} lineHeight={"1.625rem"} mr={"1em"} transition="color 0.2s ease" _hover={{ color: "gray", transition: "color 0.2s ease" }} fontWeight={router.asPath === "/courses" || router.asPath == "/courses/[id]" ? 600 : 400}>
                Courses
              </Text>
            </Link>
            <Link href="/quests" _hover={{ textDecoration: "none" }}>
              <Text fontSize={"1.125rem"} color={"#0a0a0a"} lineHeight={"1.625rem"} mx={"1em"} transition="color 0.2s ease" _hover={{ color: "gray", transition: "color 0.2s ease" }} fontWeight={router.asPath === "/quests" ? 600 : 400}>
                Quests
              </Text>
            </Link>
            <Link href={`/profile/${address}`} _hover={{ textDecoration: "none" }}>
              <Text fontSize={"1.125rem"} color={"#0a0a0a"} lineHeight={"1.625rem"} ml={"1em"} transition="color 0.2s ease" _hover={{ color: "gray", transition: "color 0.2s ease" }} fontWeight={router.asPath === `/profile/${address}` ? 600 : 400}>
                Profile
              </Text>
            </Link>
          </Flex>
        )}

        {router.asPath === "/" ? null : <ConnectButton />}
      </Flex>
    </>
  );
}

export default Navbar;
