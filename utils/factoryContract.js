import courseFactoryContractAbi from "../contracts/ABI/CourseFactory.json";
import { ethers } from "ethers";

export const getCourseFactoryContract = (courseAddress, signerOrProvider) => {
  return new ethers.Contract(
    courseAddress,
    courseFactoryContractAbi,
    signerOrProvider
  );
};
