// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

library SafeMath {
    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x - y) <= x, "ds-math-sub-underflow");
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}

contract TaalmQuests is ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _questCount;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    struct Quest {
        uint256 id;
        string questId;
        string questName;
        string questDescription;
        uint256 questContributors;
        uint256 questPrice;
        uint256 questGoal;
        uint256 questAmountRaised;
        uint256 questFee;
        address payable uploader;
    }

    mapping(uint256 => Quest) private idToQuest;

    event QuestCreated(
        uint256 id,
        string questId,
        string questName,
        string questDescription,
        uint256 questContributors,
        uint256 questPrice,
        uint256 questGoal,
        uint256 questAmountRaised,
        uint256 questFee,
        address uploader
    );

    function createQuest(
        string memory _questId,
        string memory _questName,
        string memory _questDescription,
        uint256 _questPrice,
        uint256 _questGoal,
        uint256 _questFee
    ) external nonReentrant {
        require(bytes(_questId).length > 0, "Quest Name not found");
        require(bytes(_questName).length > 0, "Quest Name not found");
        require(
            bytes(_questDescription).length > 0,
            "Quest Description not found"
        );
        require(_questPrice >= 0, "Quest Price not found");
        require(_questGoal > 0, "Quest Goal not found");
        require(_questFee >= 0, "Quest Fee not found");
        require(msg.sender != address(0), "Sender Address not found");

        _questCount.increment();
        uint256 questCount = _questCount.current();

        idToQuest[questCount] = Quest(
            questCount,
            _questId,
            _questName,
            _questDescription,
            0,
            _questPrice,
            _questGoal,
            0,
            _questFee,
            payable(msg.sender)
        );

        emit QuestCreated(
            questCount,
            _questId,
            _questName,
            _questDescription,
            0,
            _questPrice,
            _questGoal,
            0,
            _questFee,
            msg.sender
        );
    }

    function fundQuest(string memory _questId, uint256 _id)
        external
        payable
        nonReentrant
    {
        require(bytes(_questId).length > 0, "Id not found");
        require(bytes(_questId).length == bytes(idToQuest[_id].questId).length);
        require(
            msg.sender != idToQuest[_id].uploader,
            "uploader cannot fund own quest"
        );
        require(
            msg.value == idToQuest[_id].questPrice,
            "Value is less or greater than price"
        );

        if (idToQuest[_id].questGoal == idToQuest[_id].questAmountRaised) {
            revert("Quest already completed");
        }

        idToQuest[_id].uploader.transfer(msg.value);
        idToQuest[_id].questAmountRaised = idToQuest[_id].questAmountRaised.add(
            msg.value
        );
        idToQuest[_id].questContributors = idToQuest[_id].questContributors.add(
            1
        );
    }

    function fetchQuest() external view returns (Quest[] memory) {
        uint256 totalQuestCount = _questCount.current();
        uint256 currentIndex = 0;

        Quest[] memory quests = new Quest[](totalQuestCount);

        for (uint256 i = 0; i < totalQuestCount; i++) {
            uint256 currentId = i.add(1);
            Quest storage currentQuest = idToQuest[currentId];
            quests[currentIndex] = currentQuest;
            currentIndex += 1;
        }
        return quests;
    }
}
