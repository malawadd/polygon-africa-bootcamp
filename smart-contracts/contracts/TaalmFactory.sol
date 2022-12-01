// SPDX-License-Identifier: MIT

import "./TaalmCourse.sol";

pragma solidity ^0.8.15;

contract TaalmFactory {
    //Init the array of deployed contract addresses
    address[] public deployedCourses;
    mapping(address => address[]) public studentsCourses;

    function createCourse(
        string memory name,
        string memory description,
        string memory imageHash,
        uint256 price,
        string[] memory moduleNames,
        string[] memory moduleDescriptions,
        string[] memory materialHashes,
        string[] memory questionHashes
    ) public {
        //creates a new course, deploys a new course contract and pushes its address onto the address array
        TaalmCourse newCourse = new TaalmCourse(
            msg.sender,
            name,
            description,
            imageHash,
            price,
            moduleNames,
            moduleDescriptions,
            materialHashes,
            questionHashes
        );
        deployedCourses.push(address(newCourse));
    }

    function joinCourse(address courseAddress) public payable {
        TaalmCourse course = TaalmCourse(payable(courseAddress));
        studentsCourses[msg.sender].push(courseAddress);
        course.enroll{value: msg.value}(msg.sender);
    }

    function returnEnrolledCourses() public view returns (address[] memory) {
        address[] memory courses = studentsCourses[msg.sender];
        return (courses);
    }

    function getDeployedCourses() public view returns (address[] memory) {
        //returns the full array on deployed contracts
        return deployedCourses;
    }
}
