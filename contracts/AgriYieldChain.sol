// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriYieldChain
 * @dev Smart contract for agricultural yield registration and verification
 * Provides transparency and immutability for crop yield data
 */
contract AgriYieldChain {
    
    // Enums
    enum YieldStatus { Pending, Verified, Rejected }
    enum UserRole { Farmer, Verifier, Admin }
    
    // Structs
    struct User {
        address walletAddress;
        string name;
        string email;
        UserRole role;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct YieldRecord {
        uint256 id;
        address farmer;
        string cropType;
        uint256 quantity; // in kilograms
        uint256 harvestDate;
        string location; // GPS coordinates or farm ID
        string ipfsHash; // Link to supporting documents
        YieldStatus status;
        address verifier;
        uint256 submittedAt;
        uint256 verifiedAt;
        string remarks;
    }
    
    // State variables
    mapping(address => User) public users;
    mapping(uint256 => YieldRecord) public yieldRecords;
    mapping(address => uint256[]) public farmerYields;
    mapping(address => uint256[]) public verifierApprovals;
    
    uint256 public yieldCounter;
    address public contractOwner;
    
    // Events
    event UserRegistered(address indexed userAddress, string name, UserRole role);
    event YieldSubmitted(uint256 indexed yieldId, address indexed farmer, string cropType, uint256 quantity);
    event YieldVerified(uint256 indexed yieldId, address indexed verifier, YieldStatus status);
    event UserRoleUpdated(address indexed userAddress, UserRole newRole);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyFarmer() {
        require(users[msg.sender].role == UserRole.Farmer, "Only farmers can perform this action");
        require(users[msg.sender].isActive, "User account is not active");
        _;
    }
    
    modifier onlyVerifier() {
        require(users[msg.sender].role == UserRole.Verifier, "Only verifiers can perform this action");
        require(users[msg.sender].isActive, "User account is not active");
        _;
    }
    
    modifier userExists() {
        require(users[msg.sender].isActive, "User not registered");
        _;
    }
    
    constructor() {
        contractOwner = msg.sender;
        yieldCounter = 0;
        
        // Register contract owner as admin
        users[msg.sender] = User({
            walletAddress: msg.sender,
            name: "System Admin",
            email: "admin@agriyieldchain.com",
            role: UserRole.Admin,
            isActive: true,
            registeredAt: block.timestamp
        });
    }
    
    /**
     * @dev Register a new user
     * @param _name User's full name
     * @param _email User's email address
     * @param _role User's role (Farmer or Verifier)
     */
    function registerUser(
        string memory _name,
        string memory _email,
        UserRole _role
    ) external {
        require(!users[msg.sender].isActive, "User already registered");
        require(_role == UserRole.Farmer || _role == UserRole.Verifier, "Invalid role");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            name: _name,
            email: _email,
            role: _role,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _name, _role);
    }
    
    /**
     * @dev Submit a new yield record
     * @param _cropType Type of crop harvested
     * @param _quantity Quantity in kilograms
     * @param _harvestDate Harvest date (Unix timestamp)
     * @param _location GPS coordinates or farm identifier
     * @param _ipfsHash IPFS hash of supporting documents
     */
    function submitYield(
        string memory _cropType,
        uint256 _quantity,
        uint256 _harvestDate,
        string memory _location,
        string memory _ipfsHash
    ) external onlyFarmer returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than zero");
        require(_harvestDate <= block.timestamp, "Harvest date cannot be in the future");
        
        yieldCounter++;
        
        yieldRecords[yieldCounter] = YieldRecord({
            id: yieldCounter,
            farmer: msg.sender,
            cropType: _cropType,
            quantity: _quantity,
            harvestDate: _harvestDate,
            location: _location,
            ipfsHash: _ipfsHash,
            status: YieldStatus.Pending,
            verifier: address(0),
            submittedAt: block.timestamp,
            verifiedAt: 0,
            remarks: ""
        });
        
        farmerYields[msg.sender].push(yieldCounter);
        
        emit YieldSubmitted(yieldCounter, msg.sender, _cropType, _quantity);
        
        return yieldCounter;
    }
    
    /**
     * @dev Verify or reject a yield record
     * @param _yieldId ID of the yield record to verify
     * @param _status New status (Verified or Rejected)
     * @param _remarks Verifier's remarks
     */
    function verifyYield(
        uint256 _yieldId,
        YieldStatus _status,
        string memory _remarks
    ) external onlyVerifier {
        require(_yieldId > 0 && _yieldId <= yieldCounter, "Invalid yield ID");
        require(yieldRecords[_yieldId].status == YieldStatus.Pending, "Yield already processed");
        require(_status == YieldStatus.Verified || _status == YieldStatus.Rejected, "Invalid status");
        
        yieldRecords[_yieldId].status = _status;
        yieldRecords[_yieldId].verifier = msg.sender;
        yieldRecords[_yieldId].verifiedAt = block.timestamp;
        yieldRecords[_yieldId].remarks = _remarks;
        
        verifierApprovals[msg.sender].push(_yieldId);
        
        emit YieldVerified(_yieldId, msg.sender, _status);
    }
    
    /**
     * @dev Update user role (Admin only)
     * @param _userAddress Address of the user
     * @param _newRole New role to assign
     */
    function updateUserRole(address _userAddress, UserRole _newRole) external onlyOwner {
        require(users[_userAddress].isActive, "User not found");
        users[_userAddress].role = _newRole;
        emit UserRoleUpdated(_userAddress, _newRole);
    }
    
    /**
     * @dev Get all yield IDs for a farmer
     * @param _farmer Address of the farmer
     */
    function getFarmerYields(address _farmer) external view returns (uint256[] memory) {
        return farmerYields[_farmer];
    }
    
    /**
     * @dev Get all yield IDs verified by a verifier
     * @param _verifier Address of the verifier
     */
    function getVerifierApprovals(address _verifier) external view returns (uint256[] memory) {
        return verifierApprovals[_verifier];
    }
    
    /**
     * @dev Get yield record details
     * @param _yieldId ID of the yield record
     */
    function getYieldRecord(uint256 _yieldId) external view returns (YieldRecord memory) {
        require(_yieldId > 0 && _yieldId <= yieldCounter, "Invalid yield ID");
        return yieldRecords[_yieldId];
    }
    
    /**
     * @dev Get user details
     * @param _userAddress Address of the user
     */
    function getUser(address _userAddress) external view returns (User memory) {
        return users[_userAddress];
    }
    
    /**
     * @dev Get total number of yields submitted
     */
    function getTotalYields() external view returns (uint256) {
        return yieldCounter;
    }
}
