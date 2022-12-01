// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

contract TaalmCourse {
    
    struct Module {
        string name;
        string description;
        string materialsHash;
        string questionsHash;
    }

    struct Request {
        string name;
        string description;
        address author;
        bool confirmed;
        uint256 tokens;
        uint256 approvers;
        uint256 baseVersion;
    }

    string public courseName;
    string public courseDescription;
    string public courseImageHash;
    uint256 public index;
    uint256 public requestIndex;
    uint256 public coursePrice;
    uint256 public numOfMaintainers;
    uint256 public tokenPot;
    address public author;
    address public manager;
    address public momAddress;
    Request[] public listOfRequests;
    Module[] public modulesToPush;
    Module[] public currentModules;
    mapping(address => uint256) public balance;
    mapping(address => bool) public maintainers;
    mapping(uint256 => Module[]) public requestModules;
    mapping(uint256 => Module[]) public moduleVersions;
    mapping(uint256 => mapping(address => bool)) public maintainerVotes;
    mapping(address => uint256) public allowance;
    mapping(address => bool) public enrolled;
    mapping(uint256 => address) tokenHolders;
    uint256 tokenHoldersCounter;


    constructor(
        address _manager,
        string memory name,
        string memory description,
        string memory imageHash,
        uint256 price,
        string[] memory moduleNames,
        string[] memory moduleDescriptions,
        string[] memory materialHashes,
        string[] memory questionHashes
    ) {
        //contructor sets manager as contract creator
        manager = _manager;
        tokenHoldersCounter = 1;
        tokenHolders[0] = manager;
        numOfMaintainers = 1;
        balance[manager] = 500;
        tokenPot = 500;
        momAddress = msg.sender;
        courseName = name;
        courseDescription = description;
        courseImageHash = imageHash;
        coursePrice = price;
        pushModules(
            moduleNames,
            moduleDescriptions,
            materialHashes,
            questionHashes
        );
    }

    receive() external payable {}

    fallback() external payable {}

    function getSummaryInformation()
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            address
        )
    {
        return (courseName, courseDescription, courseImageHash, manager);
    }

    function addMaintainer(address newMaintainer) external  {
        // require(msg.sender == manager || maintainers[msg.sender]);
        require(maintainers[newMaintainer] != true);
        //Add a signal here to tell Ux that this address is already a maintainer
        //adds new maintainer to the mapping with positive boolean value pair
        maintainers[newMaintainer] = true;
        tokenHolders[tokenHoldersCounter] = newMaintainer;
        numOfMaintainers++;
        tokenHoldersCounter++;
    }

    function pushModules(
        //takes in arrays of module detailes, pushes them onto an array and stores that array in version controlled modules mapping.
        string[] memory _name,
        string[] memory _description,
        string[] memory _mHash,
        string[] memory _qHash
    ) internal {
        for (uint256 i = 0; i < _name.length; i++) {
            Module memory newModule = Module({
                name: _name[i],
                description: _description[i],
                materialsHash: _mHash[i],
                questionsHash: _qHash[i]
            });
            modulesToPush.push(newModule);
        }
        moduleVersions[index] = modulesToPush;
        delete (modulesToPush);
        index++;
    }

    function returnModules(uint256 _version)
        external
        view
        returns (
            //returns all of the modules stored in version controlled modules mapping at _version
            //returns as an array of names, descs,materials,and questions.
            string[] memory _name,
            string[] memory _desc,
            string[] memory _materials,
            string[] memory questions
        )
    {
        Module[] memory modulesToReturn = moduleVersions[_version];

        uint256 length = modulesToReturn.length;

        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        string[] memory mHashes = new string[](length);
        string[] memory qHashes = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            Module memory module = modulesToReturn[i];
            names[i] = module.name;
            descriptions[i] = module.description;
            mHashes[i] = module.materialsHash;
            qHashes[i] = module.questionsHash;
        }
        return (names, descriptions, mHashes, qHashes);
    }

    function createRequest(
        //creates a request with all of the modules, including past modules, edited modules and new modules.
        //array of modules are stored at request index in request modules mappings.
        string memory _nameReq,
        string memory _descriptionReq,
        uint256 _tokens,
        string[] memory _moduleNames,
        string[] memory _moduleDescriptions,
        string[] memory _materialsHash,
        string[] memory _questionsHash,
        uint256 _baseVersion
    ) external {
        Request memory newRequest = Request({
            name: _nameReq,
            description: _descriptionReq,
            author: msg.sender,
            confirmed: false,
            tokens: _tokens,
            approvers: 0,
            baseVersion: _baseVersion
        });

        listOfRequests.push(newRequest);

        for (uint256 i = 0; i < _moduleNames.length; i++) {
            Module memory newModule = Module({
                name: _moduleNames[i],
                description: _moduleDescriptions[i],
                materialsHash: _materialsHash[i],
                questionsHash: _questionsHash[i]
            });
            modulesToPush.push(newModule);
        }
        requestModules[requestIndex] = modulesToPush;
        delete (modulesToPush);
        requestIndex++;
    }

    function voteRequest(uint256 ID) external {
        // require(maintainerVotes[ID][msg.sender] != true);
        maintainerVotes[ID][msg.sender] = true;
        Request storage request = listOfRequests[ID];
        request.approvers++;
        if (request.approvers >= numOfMaintainers) {
            approveRequest(ID);
        }
    }

    function approveRequest(uint256 ID) internal {
        //Approves a request at index ID in list of requests array,
        //changes the approver address and confirmed boolean,
        //pushes all the new modules stored in request module mapping, into current modules array mapping.

        Request storage request = listOfRequests[ID];
        require(request.confirmed != true);
        request.confirmed = true;

        Module[] memory modules = requestModules[ID];

        uint256 length = modules.length;

        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        string[] memory materialHashes = new string[](length);
        string[] memory questionHashes = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            Module memory module = modules[i];
            names[i] = module.name;
            descriptions[i] = module.description;
            materialHashes[i] = module.materialsHash;
            questionHashes[i] = module.questionsHash;
        }

        pushModules(names, descriptions, materialHashes, questionHashes);
        tokenHolders[tokenHoldersCounter] = request.author;
        tokenHoldersCounter++;
    }

    function returnRequestModules(uint256 ID)
        external
        view
        returns (
            string[] memory _moduleNames,
            string[] memory _moduleDescs,
            string[] memory _moduleMaterials,
            string[] memory _modulesQuestions
        )
    {
        Module[] memory modulesToReturn = requestModules[ID];

        uint256 length = modulesToReturn.length;

        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        string[] memory materials = new string[](length);
        string[] memory questions = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            Module memory module = modulesToReturn[i];
            names[i] = module.name;
            descriptions[i] = module.description;
            materials[i] = module.materialsHash;
            questions[i] = module.questionsHash;
        }
        return (names, descriptions, materials, questions);
    }

    function returnRequestSummary(uint256 ID)
        external
        view
        returns (
            string[2] memory,
            address,
            bool,
            uint256[3] memory
        )
    {
        Request memory request = listOfRequests[ID];
        string[2] memory nameDesc = [request.name, request.description];
        uint256[3] memory tokensApprovers = [
            request.tokens,
            request.approvers,
            request.baseVersion
        ];

        return (nameDesc, request.author, request.confirmed, tokensApprovers);
    }

    function enroll(address _student) external payable {
        require(msg.sender == momAddress);
        enrolled[_student] = true;
    }
}
