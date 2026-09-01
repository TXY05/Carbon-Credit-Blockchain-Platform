let web3;
let currentAccount;

// 【请确保这里是你在 Remix 部署的真实合约地址】
const USER_REGISTRY_ADDRESS = "0xCAeC5026E7aA66fdd6Bb09A4814783a016eF42Ea";
const PROJECT_REGISTRY_ADDRESS = "0x1247b94c46c3608ceBA86F04830a4642112F218e";
const CARBON_TOKEN_ADDRESS = "0x4F16A09EB4E2877A1b90af687E575FB5A813D60B";

const USER_REGISTRY_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "enum UserRegistry.UserRole",
        name: "role",
        type: "uint8",
      },
    ],
    name: "registerUser",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum UserRegistry.UserRole",
        name: "role",
        type: "uint8",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserRole",
    outputs: [
      {
        internalType: "enum UserRegistry.UserRole",
        name: "role",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isAdmin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isBuyer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isDeveloper",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const PROJECT_REGISTRY_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "projectName",
        type: "string",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "string",
        name: "ecosystemType",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "pricePerToken",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableCapacity",
        type: "uint256",
      },
    ],
    name: "createProject",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "developer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "projectName",
        type: "string",
      },
    ],
    name: "ProjectCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "ProjectMinted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "reduceAvailableCapacity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_carbonToken",
        type: "address",
      },
    ],
    name: "setCarbonToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "setMinted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "carbonToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllProjects",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "projectID",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "developer",
            type: "address",
          },
          {
            internalType: "string",
            name: "projectName",
            type: "string",
          },
          {
            internalType: "string",
            name: "location",
            type: "string",
          },
          {
            internalType: "string",
            name: "ecosystemType",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "pricePerToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableCapacity",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "minted",
            type: "bool",
          },
        ],
        internalType: "struct ProjectRegistry.Project[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "getCapacity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "getDeveloper",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "getPricePerToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProjectCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "isMinted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projectIDs",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projects",
    outputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "developer",
        type: "address",
      },
      {
        internalType: "string",
        name: "projectName",
        type: "string",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "string",
        name: "ecosystemType",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "pricePerToken",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableCapacity",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "minted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TONNES_PER_TOKEN",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "userRegistry",
    outputs: [
      {
        internalType: "contract IUserRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const CARBON_TOKEN_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_IProjectRegistry",
        type: "address",
      },
      {
        internalType: "address",
        name: "_IUserRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "mintTokens",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "purchaseCredits",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "retire",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "developer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalPrice",
        type: "uint256",
      },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensRetired",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectID",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projectBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectRegistry",
    outputs: [
      {
        internalType: "contract IProjectRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projectRetired",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "retired",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMinted",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRetired",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "userRegistry",
    outputs: [
      {
        internalType: "contract IUserRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let userRegistryContract = null;
let projectRegistryContract = null;
let carbonTokenContract = null;

function blockchainAddressesConfigured() {
  return (
    USER_REGISTRY_ADDRESS.startsWith("0x") &&
    PROJECT_REGISTRY_ADDRESS.startsWith("0x") &&
    CARBON_TOKEN_ADDRESS.startsWith("0x")
  );
}

function initializeBlockchainContracts() {
  if (!web3 || !blockchainAddressesConfigured()) {
    return false;
  }

  userRegistryContract = new web3.eth.Contract(
    USER_REGISTRY_ABI,
    USER_REGISTRY_ADDRESS,
  );

  projectRegistryContract = new web3.eth.Contract(
    PROJECT_REGISTRY_ABI,
    PROJECT_REGISTRY_ADDRESS,
  );

  carbonTokenContract = new web3.eth.Contract(
    CARBON_TOKEN_ABI,
    CARBON_TOKEN_ADDRESS,
  );

  return true;
}

async function ensureContractsReady() {
  // If Web3 is not initialized yet,
  // try to connect to MetaMask.
  if (!web3) {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed.");
    }

    web3 = new Web3(window.ethereum);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    currentAccount = accounts[0];
  }

  // Initialize contracts if they haven't
  // been initialized yet.
  if (
    !projectRegistryContract ||
    !userRegistryContract ||
    !carbonTokenContract
  ) {
    const initialized = initializeBlockchainContracts();

    if (!initialized) {
      throw new Error("Unable to initialize blockchain contracts.");
    }
  }

  return {
    userRegistry: userRegistryContract,
    projectRegistry: projectRegistryContract,
    carbonToken: carbonTokenContract,
  };
}

// Node.js 后端服务器地址
const SERVER_URL = "http://localhost:3000";

// ==========================================
// AUTHENTICATION
// MetaMask is the ONLY login method
// ==========================================

let connectedWallet = null;


// ==========================================
// Toggle Login / Register
// ==========================================

window.toggleAuthMode = function (mode) {

  const loginForm =
    document.getElementById("form-login");

  const registerForm =
    document.getElementById("form-register");

  if (mode === "login") {

    loginForm.style.display = "block";
    registerForm.style.display = "none";

  } else {

    loginForm.style.display = "none";
    registerForm.style.display = "block";

  }

};


// ==========================================
// Connect MetaMask
// ==========================================

window.connectMetaMask = async function () {

  if (typeof window.ethereum === "undefined") {

    alert(
      "MetaMask is not installed. Please install MetaMask first."
    );

    return null;
  }

  try {

    // Ask MetaMask for account
    const accounts =
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });

    if (!accounts || accounts.length === 0) {

      throw new Error(
        "No MetaMask account was selected."
      );

    }

    connectedWallet = accounts[0];


    return connectedWallet;

  } catch (error) {

    console.error(
      "MetaMask connection failed:",
      error
    );

    return null;
  }

};

// ==========================================
// Get already connected wallet
// ==========================================

async function getConnectedWallet() {

  if (connectedWallet) {
    return connectedWallet;
  }

  if (typeof window.ethereum === "undefined") {
    return null;
  }

  const accounts =
    await window.ethereum.request({
      method: "eth_accounts"
    });

  if (!accounts || accounts.length === 0) {
    return null;
  }

  connectedWallet = accounts[0];

  return connectedWallet;

};


// ==========================================
// Shorten wallet address
// ==========================================

function shortenAddress(address) {

  if (!address) return "";

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(address.length - 4)
  );

}


// ==========================================
// LOGIN
//
// MetaMask ONLY
// ==========================================

window.connectAndLogin = async function () {

  try {

    // ==================================
    // 1. Connect MetaMask
    // ==================================

    const walletAddress =
      await connectMetaMask();

    if (!walletAddress) {
      return;
    }

    console.log(
      "Connected wallet:",
      walletAddress
    );


    // ==================================
    // 2. Load contracts
    // ==================================

    const contracts =
      await ensureContractsReady();


    // ==================================
    // 3. Check Owner
    // ==================================

    const owner =
      await contracts.userRegistry.methods
        .owner()
        .call();

    const isOwner =
      owner.toLowerCase() ===
      walletAddress.toLowerCase();


    // ==================================
    // 4. Check Admin
    // ==================================

    const isAdmin =
      await contracts.userRegistry.methods
        .isAdmin(walletAddress)
        .call();


    console.log("Contract owner:", owner);
    console.log("Is owner:", isOwner);
    console.log("Is admin:", isAdmin);


    // ==================================
    // 5. ADMIN / OWNER LOGIN
    // ==================================

    if (isOwner || isAdmin) {

      console.log(
        "✅ Admin/Owner login successful"
      );


      switchRole("admin");
      navTo("adminDashPage", "Admin Dashboard");

      return;
    }


    // ==================================
    // 6. NORMAL USER
    // ==================================

    const role =
      await contracts.userRegistry.methods
        .getUserRole(walletAddress)
        .call();


    console.log(
      "Blockchain role:",
      role
    );


    // ==================================
    // 7. Not registered on blockchain
    // ==================================

    if (Number(role) === 0) {

      alert(
        "This wallet is not registered yet.\n\n" +
        "Please register first or wait for Admin approval."
      );

      toggleAuthMode("register");

      return;
    }


    // ==================================
    // 8. Buyer
    // ==================================

    if (Number(role) === 1) {

      switchRole("buyer");
      navTo("marketPage", "Marketplace");
    }


    // ==================================
    // 9. Developer
    // ==================================

    else if (Number(role) === 2) {

      switchRole("developer");
      navTo("devDashPage", "Developer Dashboard");

    }


    // ==================================
    // 10. Unknown role
    // ==================================

    else {

      throw new Error(
        "Unknown blockchain role: " + role
      );

    }


    console.log(
      "✅ User login successful:",
      walletAddress
    );



  } catch (error) {

    console.error(
      "MetaMask login failed:",
      error
    );

    alert(
      "Login failed:\n" +
      (error.message || error)
    );

  }

};

// ==========================================
// REGISTER - CONNECT WALLET
// ==========================================

window.connectRegisterWallet = async function () {

  const walletAddress =
    await connectMetaMask();

  if (!walletAddress) {
    return;
  }

  const button =
    document.getElementById(
      "registerWalletBtn"
    );

  const status =
    document.getElementById(
      "registerWalletStatus"
    );


  if (button) {

    button.innerText =
      `✅ ${shortenAddress(walletAddress)}`;

    button.style.background =
      "#28a745";

  }


  if (status) {

    status.innerText =
      "Connected Wallet:\n" +
      walletAddress;

    status.style.display =
      "block";

  }

};


// ==========================================
// REGISTER
//
// User fills information FIRST.
// MetaMask wallet becomes identity.
// ==========================================

window.handleRegister = async function () {

  try {

    // ----------------------------------
    // 1. Get form information
    // ----------------------------------

    const username =
      document.getElementById(
        "regUsername"
      ).value.trim();

    const email =
      document.getElementById(
        "regEmail"
      ).value.trim();

    const phone =
      document.getElementById(
        "regPhone"
      ).value.trim();

    const role =
      document.getElementById(
        "regRole"
      ).value;


    // ----------------------------------
    // 2. Validate form
    // ----------------------------------

    if (!username) {

      alert("Please enter your username.");

      return;
    }

    if (!email) {

      alert("Please enter your email.");

      return;
    }

    if (!phone) {

      alert(
        "Please enter your contact number."
      );

      return;
    }

    if (!role) {

      alert(
        "Please select an account type."
      );

      return;
    }


    // ----------------------------------
    // 3. Connect MetaMask
    // ----------------------------------

    let walletAddress =
      connectedWallet;


    if (!walletAddress) {

      walletAddress =
        await connectMetaMask();

    }


    if (!walletAddress) {

      alert(
        "Please connect MetaMask first."
      );

      return;
    }


    // ----------------------------------
    // 4. Initialize blockchain
    // ----------------------------------

    const contracts =
      await ensureContractsReady();


    // ----------------------------------
    // 5. Check if wallet already exists
    // ----------------------------------

    const alreadyRegistered =
      await contracts.userRegistry.methods
        .isRegistered(walletAddress)
        .call();


    if (alreadyRegistered) {

      alert(
        "This MetaMask wallet is already registered.\n\n" +
        "Please use Login instead."
      );

      toggleAuthMode("login");

      return;
    }


    // ----------------------------------
    // 6. Send registration to backend
    // ----------------------------------

    const response =
      await fetch(
        `${SERVER_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            walletAddress:
              walletAddress,

            username:
              username,

            email:
              email,

            phone:
              phone,

            role:
              role

          })
        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message ||
        "Registration failed."
      );

    }


    // ----------------------------------
    // 7. Registration successful
    // ----------------------------------

    alert(
      "✅ Registration submitted!\n\n" +
      "Your account is now waiting for Admin approval."
    );


    // Clear form

    document.getElementById(
      "regUsername"
    ).value = "";

    document.getElementById(
      "regEmail"
    ).value = "";

    document.getElementById(
      "regPhone"
    ).value = "";

    document.getElementById(
      "regRole"
    ).value = "";


    // Return login page

    toggleAuthMode("login");


  } catch (error) {

    console.error(
      "Registration failed:",
      error
    );

    alert(
      "Registration failed: " +
      (error.message || error)
    );

  }

};

// ==========================================
// Developer：提交新项目 (修复身份绑定版)
// ==========================================
document.getElementById("submitBtn").onclick = async function () {
  let projName = document.getElementById("projName").value;
  let location = document.getElementById("location").value;
  let capacity = document.getElementById("capacity").value;
  let deadline = document.getElementById("deadline").value;
  let ecosystemType = document.getElementById("ecosystemType").value;
  let pricePerToken = document.getElementById("pricePerToken").value;

  // 🔴 核心修复：直接抓取当前登录的 Username
  let currentUser = localStorage.getItem("loggedInUser");

  if (!projName || !location || !capacity || !deadline) {
    // alert("🚨 请填写完整所有的项目信息！");
    return;
  }

  try {
    let response = await fetch(`${SERVER_URL}/submit-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser,
        projName: projName,
        devAddress: document.getElementById("devAddress").value,
        location: location,
        capacity: capacity,
        deadline: deadline,
        ecosystemType: ecosystemType,
        pricePerToken: pricePerToken,
      }),
    });

    let result = await response.json();
    if (result.success) {
      // alert("✅ 项目提交成功！已进入排队审核。");

      // 清空表单
      document.getElementById("projName").value = "";
      document.getElementById("location").value = "";
      document.getElementById("capacity").value = "";
      document.getElementById("deadline").value = "";

      // 🔴 提交成功后，直接丝滑跳转到 My Projects 页面去欣赏你的成果！
      navTo("devHistoryPage", "My Projects");
    } else {
      // alert(result.message);
    }
  } catch (error) {
    console.error(error);
    // alert("🚨 请求报错，请检查控制台。");
  }
};

// ==========================================
// Admin：项目管理 (Tab切换逻辑)
// ==========================================
window.switchProjectTab = function (tab) {
  if (tab === "pending") {
    document.getElementById("panel-pending-projects").style.display = "block";
    document.getElementById("panel-all-projects").style.display = "none";
    document.getElementById("tab-pending-projects").style.background =
      "#5640fa";
    document.getElementById("tab-pending-projects").style.color = "white";
    document.getElementById("tab-all-projects").style.background = "#f4f7fe";
    document.getElementById("tab-all-projects").style.color = "#2b3674";
    loadPendingProjects();
  } else {
    document.getElementById("panel-pending-projects").style.display = "none";
    document.getElementById("panel-all-projects").style.display = "block";
    document.getElementById("tab-all-projects").style.background = "#5640fa";
    document.getElementById("tab-all-projects").style.color = "white";
    document.getElementById("tab-pending-projects").style.background =
      "#f4f7fe";
    document.getElementById("tab-pending-projects").style.color = "#2b3674";
    loadAllProjects();
  }
};

// ==========================================
// 渲染待审核项目 (Pending)
// ==========================================
window.loadPendingProjects = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/pending-projects`);
    let pendingProjects = await response.json();

    let tbody = document.getElementById("tableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (pendingProjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 目前没有需要审核的项目</td></tr>`;
      return;
    }

    pendingProjects.forEach((proj) => {
      let row = `<tr>
                <td><strong>${proj.projName || "Unnamed Project"}</strong></td>
                <td>${proj.location}</td>
                <td>${proj.capacity} ha</td>
                <td><strong style="color: #5640fa;">${proj.carbonVolume} BCC</strong></td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="approveProject(${proj.id})"" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">
                        Approve
                    </button>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="rejectProject(${proj.id})" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">
                        Reject
                    </button>
                </td>
            </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
  }
};

// ==========================================
// 审批与驳回 (绝对防闪回)
// ==========================================
window.approveProject = async function (projectId) {
  try {
    let response = await fetch(`${SERVER_URL}/approve-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });

    let result = await response.json();
    if (result.success) {
      loadPendingProjects(); // 原地局部刷新
    }
  } catch (error) {
    console.error(error);
  }
};

window.rejectProject = async function (projectId) {
  if (!confirm("⚠️ 确定要驳回该项目吗？")) return;
  try {
    let response = await fetch(`${SERVER_URL}/reject-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });
    if ((await response.json()).success) {
      // alert("🚫 项目已驳回。");
      loadPendingProjects(); // 🔴 原地局部刷新
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================
// 渲染所有项目总览 (Overview) - 带强力报错
// ==========================================
let allProjectsData = [];

window.loadAllProjects = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/all-projects`);

    // 核心防呆：如果后端没有这个接口，立刻拦截并弹窗警告
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allProjectsData = await response.json();
    applyProjectFilters();
  } catch (error) {
    console.error("加载大名单失败:", error);
    // alert("🚨 数据拉取失败！\n请确保你在 server.js 里加上了 /all-projects 接口，并且已经用 Ctrl+C 停止并重新启动了 node server.js！");
  }
};

window.applyProjectFilters = function () {
  const statusFilter = document.getElementById("filterProjectStatus").value;
  const startDate = document.getElementById("projDateStart").value;
  const endDate = document.getElementById("projDateEnd").value;

  let filtered = allProjectsData.filter((p) => {
    let matchStatus = statusFilter === "all" || p.status === statusFilter;

    // 日期比对逻辑
    let matchDate = true;
    if (p.createdAt) {
      let rowDate = p.createdAt.split(" ")[0];
      if (startDate && rowDate < startDate) matchDate = false;
      if (endDate && rowDate > endDate) matchDate = false;
    } else {
      if (startDate || endDate) matchDate = false;
    }

    return matchStatus && matchDate;
  });

  let tbody = document.getElementById("allProjectsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  filtered.forEach((p) => {
    let statusColor =
      p.status === "approved"
        ? "#28a745"
        : p.status === "rejected"
          ? "#dc3545"
          : "#ff9800";
    let statusBg =
      p.status === "approved"
        ? "#e6f4ea"
        : p.status === "rejected"
          ? "#fce8e6"
          : "#fff0d4";
    let displayDate = p.createdAt ? p.createdAt.split(" ")[0] : "N/A";

    let row = `<tr>
            <td style="color: #a3aed1; font-size: 13px;">${displayDate}</td>
            <td><strong>${p.projName || "Unnamed Project"}</strong></td>
            <td>${p.location}</td>
            <td>${p.capacity} ha</td>
            <td><strong style="color: #5640fa;">${p.carbonVolume} BCC</strong></td>
            <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 13px; text-transform: capitalize;">${p.status}</span></td>
        </tr>`;
    tbody.innerHTML += row;
  });
};

// 🔴 新增：驳回项目逻辑
window.rejectProject = async function (projectId) {
  if (!confirm("⚠️ 确定要无情驳回该项目吗？")) return;

  try {
    let response = await fetch(`${SERVER_URL}/reject-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });

    let result = await response.json();
    if (result.success) {
      // alert("🚫 项目已被驳回。");
      loadPendingProjects(); // 刷新表格，该项目会从 pending 列表中消失
    }
  } catch (error) {
    console.error("驳回请求失败:", error);
  }
};

// ==========================================
// Admin：用户管理 (Tab切换逻辑)
// ==========================================
window.switchUserTab = function (tab) {
  if (tab === "pending") {
    document.getElementById("panel-pending-users").style.display = "block";
    document.getElementById("panel-all-users").style.display = "none";
    document.getElementById("tab-pending-users").style.background = "#5640fa";
    document.getElementById("tab-pending-users").style.color = "white";
    document.getElementById("tab-all-users").style.background = "#f4f7fe";
    document.getElementById("tab-all-users").style.color = "#2b3674";
    loadPendingUsers(); // 🔴 切换时拉取待审核数据
  } else {
    document.getElementById("panel-pending-users").style.display = "none";
    document.getElementById("panel-all-users").style.display = "block";
    document.getElementById("tab-all-users").style.background = "#5640fa";
    document.getElementById("tab-all-users").style.color = "white";
    document.getElementById("tab-pending-users").style.background = "#f4f7fe";
    document.getElementById("tab-pending-users").style.color = "#2b3674";
    loadAllUsers(); // 🔴 切换时拉取总览数据
  }
};

// ==========================================
// 渲染待审核用户 (加入 type="button" 终极防刷新)
// ==========================================
window.loadPendingUsers = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/pending-users`);
    let pendingUsers = await response.json();

    let tbody = document.getElementById("userTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (pendingUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 目前没有需要审核的用户</td></tr>`;
      return;
    }

    pendingUsers.forEach((u) => {
      let row = `<tr>
                <td><strong>${u.username}</strong></td>
                <td style="text-transform: capitalize;">${u.role}</td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="approveUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">Approve</button>
                    
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="rejectUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">Reject</button>
                </td>
            </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
  }
};

// ==========================================
// Admin approves user
// 1. Register wallet on blockchain
// 2. Only after success, approve in SQLite
// ==========================================

window.approveUser = async function (userId) {

  try {

    // ==================================
    // 1. Find user information
    // ==================================

    const response =
      await fetch(`${SERVER_URL}/all-users`);

    const users =
      await response.json();

    const user =
      users.find(
        u => Number(u.id) === Number(userId)
      );


    if (!user) {

      alert("User not found.");

      return;
    }


    console.log(
      "User to approve:",
      user
    );


    // ==================================
    // 2. Check wallet
    // ==================================

    if (!user.walletAddress) {

      alert(
        "This user does not have a MetaMask wallet address."
      );

      return;
    }


    // ==================================
    // 3. Convert role
    // ==================================

    let blockchainRole;

    if (user.role === "buyer") {

      blockchainRole = 1;

    } else if (user.role === "developer") {

      blockchainRole = 2;

    } else {

      alert(
        "Invalid user role: " +
        user.role
      );

      return;
    }


    // ==================================
    // 4. Make sure Admin MetaMask
    // is connected
    // ==================================

    const adminWallet =
      await ensureWalletConnected();


    // ==================================
    // 5. Verify Admin
    // ==================================

    const contracts =
      await ensureContractsReady();


    const isAdmin =
      await contracts.userRegistry.methods
        .isAdmin(adminWallet)
        .call();


    const owner =
      await contracts.userRegistry.methods
        .owner()
        .call();


    const isOwner =
      owner.toLowerCase() ===
      adminWallet.toLowerCase();


    if (!isAdmin && !isOwner) {

      alert(
        "Connected MetaMask wallet is not an Admin."
      );

      return;
    }


    // ==================================
    // 6. Check if already registered
    // ==================================

    const alreadyRegistered =
      await contracts.userRegistry.methods
        .isRegistered(user.walletAddress)
        .call();


    if (alreadyRegistered) {

      alert(
        "This wallet is already registered on blockchain."
      );

      return;
    }


    // ==================================
    // 7. Blockchain registration
    // ==================================

    console.log(
      "Registering user on blockchain..."
    );

    console.log(
      "Wallet:",
      user.walletAddress
    );

    console.log(
      "Role:",
      blockchainRole
    );


    const tx =
      await contracts.userRegistry.methods
        .registerUser(
          user.walletAddress,
          blockchainRole
        )
        .send({
          from: adminWallet
        });


    console.log(
      "✅ Blockchain registration successful:",
      tx.transactionHash
    );


    // ==================================
    // 8. ONLY NOW approve SQLite user
    // ==================================

    const approveResponse =
      await fetch(
        `${SERVER_URL}/approve-user`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            userId: userId
          })
        }
      );


    const approveResult =
      await approveResponse.json();


    if (!approveResult.success) {

      throw new Error(
        "Blockchain registration succeeded, " +
        "but database approval failed."
      );
    }


    // ==================================
    // 9. Success
    // ==================================

    alert(
      "✅ User approved successfully!\n\n" +
      "Wallet has been registered on blockchain."
    );


    // Refresh pending users

    loadPendingUsers();


  } catch (error) {

    console.error(
      "❌ User approval failed:",
      error
    );


    // MetaMask rejection
    if (
      error.code === 4001
    ) {

      alert(
        "Transaction was rejected in MetaMask."
      );

      return;
    }


    alert(
      "❌ Approval failed:\n\n" +
      (error.message || error)
    );

  }

};

window.rejectUser = async function (userId) {
  if (!confirm("⚠️ 确定要驳回该用户的申请吗？")) return;
  try {
    let response = await fetch(`${SERVER_URL}/reject-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId }),
    });

    if ((await response.json()).success) {
      // alert("🚫 用户已被驳回。");
      loadPendingUsers(); // 🔴 原地刷新当前表格
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================
// Admin：面板 B - 全局数据与过滤器 (Filter)
// ==========================================
let allUsersData = []; // 缓存在前端的数据池

window.loadAllUsers = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/all-users`);
    allUsersData = await response.json();

    // 🔴 加上这句！它会在浏览器的控制台里打印出所有的原始数据
    console.log("🔥 后端传来的用户数据: ", allUsersData);

    applyUserFilters();
  } catch (error) {
    console.error(error);
  }
};

window.applyUserFilters = function () {
  const roleFilter = document.getElementById("filterRole").value;
  const statusFilter = document.getElementById("filterStatus").value;
  const startDate = document.getElementById("userDateStart").value;
  const endDate = document.getElementById("userDateEnd").value;

  let filtered = allUsersData.filter((u) => {
    let matchRole = roleFilter === "all" || u.role === roleFilter;
    let matchStatus = statusFilter === "all" || u.status === statusFilter;

    // 日期比对逻辑
    let matchDate = true;
    if (u.createdAt) {
      let rowDate = u.createdAt.split(" ")[0]; // 从 "YYYY-MM-DD HH:MM:SS" 中提取日期
      if (startDate && rowDate < startDate) matchDate = false;
      if (endDate && rowDate > endDate) matchDate = false;
    } else {
      if (startDate || endDate) matchDate = false; // 旧数据没有日期，如有过滤则不显示
    }

    return matchRole && matchStatus && matchDate;
  });

  let tbody = document.getElementById("allUserTableBody");
  tbody.innerHTML = "";

  filtered.forEach((u) => {
    let statusColor =
      u.status === "approved"
        ? "#28a745"
        : u.status === "rejected"
          ? "#dc3545"
          : "#ff9800";
    let statusBg =
      u.status === "approved"
        ? "#e6f4ea"
        : u.status === "rejected"
          ? "#fce8e6"
          : "#fff0d4";
    let displayDate = u.createdAt ? u.createdAt.split(" ")[0] : "N/A";

    let actionHtml =
      u.status === "rejected"
        ? `<button class="primary-btn" onclick="deleteUser(${u.id})" style="padding: 4px 10px; font-size: 12px; background-color: #6c757d;">Delete</button>`
        : `<span style="color: #ccc;">-</span>`;

    let row = `<tr>
            <td style="color: #a3aed1; font-size: 13px;">${displayDate}</td>
            <td><strong>${u.username}</strong></td>
            <td style="text-transform: capitalize;">${u.role}</td>
            <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 13px; text-transform: capitalize;">${u.status}</span></td>
            <td>${actionHtml}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
};

// ==========================================
// Admin：物理注销用户
// ==========================================
window.deleteUser = async function (userId) {
  if (
    !confirm(
      "⚠️ 确定要彻底注销该账号吗？注销后，任何人都可以重新使用这个 Username 进行注册。",
    )
  )
    return;

  try {
    let response = await fetch(`${SERVER_URL}/delete-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId }),
    });

    let result = await response.json();

    if (result.success) {
      // alert("🗑️ 账号已注销！该 Username 现在自由了。");
      loadAllUsers(); // 瞬间刷新表格
    } else {
      // alert("❌ 注销失败：" + result.message);
    }
  } catch (error) {
    console.error("注销请求报错:", error);
    // alert("🚨 请求失败！请检查你的 VS Code 终端：\n1. 是否已经按 Ctrl+C 停止了旧的服务器？\n2. 是否已经重新输入 node server.js 启动了最新的代码？");
  }
};

// ==========================================
// Admin Dashboard 真实数据抓取与图表渲染
// ==========================================
let dashChartQueue = null; // 用来存储甜甜圈图的实例，防止重复创建报错

window.loadAdminDashboard = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/admin-stats`);
    let stats = await response.json();

    if (stats.success) {
      // 1. 注入文本数字
      document.getElementById("dash-minted").innerText =
        stats.totalMinted.toLocaleString();
      document.getElementById("dash-circulating").innerText =
        stats.totalMinted.toLocaleString(); // 销毁功能做完前，流通=总发行
      document.getElementById("dash-pending-proj").innerText =
        stats.pendingProjects + " 个";
      document.getElementById("dash-pending-users").innerText =
        stats.pendingUsers + " 个";
      document.getElementById("dash-rejections").innerText =
        stats.totalRejections + " 次";

      // 2. 计算供需比和进度条
      let dCount = stats.devCount;
      let bCount = stats.buyerCount;
      let totalActive = dCount + bCount;

      let ratioText =
        bCount === 0 ? `${dCount} : 0` : `${(dCount / bCount).toFixed(2)} : 1`;
      document.getElementById("dash-ratio").innerText = ratioText;

      if (totalActive > 0) {
        let dPercent = Math.round((dCount / totalActive) * 100);
        document.getElementById("bar-dev").style.width = dPercent + "%";
        document.getElementById("bar-buyer").style.width = 100 - dPercent + "%";
      }

      // 3. 动态渲染甜甜圈图表 (队列比例)
      const ctxQueue = document.getElementById("queueChart");
      if (ctxQueue) {
        // 如果图表已经存在，先销毁它，不然画笔会重叠打架
        if (dashChartQueue) dashChartQueue.destroy();

        dashChartQueue = new Chart(ctxQueue, {
          type: "doughnut",
          data: {
            labels: ["项目审批", "用户审批"],
            datasets: [
              {
                data: [stats.pendingProjects, stats.pendingUsers], // 🔴 真实的动态数据！
                backgroundColor: ["#4318ff", "#ff9800"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "75%",
            plugins: { legend: { display: false } },
          },
        });
      }
    }
  } catch (error) {
    console.error("加载真实 Dashboard 数据失败:", error);
  }
};

// ==========================================
// Admin Dashboard Tab 切换逻辑
// ==========================================
window.switchDashTab = function (tabName) {
  // 1. 隐藏所有 Dashboard 模块
  document.getElementById("dash-section-market").style.display = "none";
  document.getElementById("dash-section-queue").style.display = "none";
  document.getElementById("dash-section-eco").style.display = "none";

  // 2. 移除所有按钮的 active 状态 (变成浅色)
  document.getElementById("dash-btn-market").classList.remove("active");
  document.getElementById("dash-btn-queue").classList.remove("active");
  document.getElementById("dash-btn-eco").classList.remove("active");

  // 3. 显示被点击的模块，并让对应按钮变成深紫色 active 状态
  document.getElementById(`dash-section-${tabName}`).style.display = "block";
  document.getElementById(`dash-btn-${tabName}`).classList.add("active");
};

// ==========================================
// Profile Modal (个人信息弹窗) 终极逻辑
// ==========================================
window.openProfileModal = async function () {
  document.getElementById("profileModal").classList.add("show");

  // 获取当前登录的真实用户
  const currentUser = localStorage.getItem("loggedInUser");

  // 🔴 防呆保护：如果没有真实登录，提示去登录
  if (!currentUser) {
    document.getElementById("prof-val-user").innerText =
      "⚠️ 请使用真实账号登录";
    document.getElementById("prof-val-role").innerText = "-";
    document.getElementById("prof-val-status").innerText = "-";
    document.getElementById("prof-val-date").innerText = "-";
    return;
  }

  try {
    // 🔴 加了时间戳 (?t=...) 强行绕过浏览器缓存，保证每次拿到的都是最新资料
    let response = await fetch(
      `${SERVER_URL}/user-profile?username=${currentUser}&t=${new Date().getTime()}`,
    );
    let result = await response.json();

    if (result.success) {
      let u = result.data;

      // 注入左侧只读名片
      document.getElementById("prof-val-user").innerText = u.username;
      document.getElementById("prof-val-role").innerText = u.role || "Not Set";
      document.getElementById("prof-val-email").innerText =
        u.email || "Not Set";
      document.getElementById("prof-val-phone").innerText =
        u.phone || "Not Set";
      document.getElementById("prof-val-status").innerText = u.status;
      document.getElementById("prof-val-date").innerText = u.createdAt
        ? u.createdAt
        : "N/A";

      // 状态颜色逻辑
      let statusEl = document.getElementById("prof-val-status");
      if (u.status === "approved") {
        statusEl.style.background = "#e6f4ea";
        statusEl.style.color = "#28a745";
      } else if (u.status === "rejected") {
        statusEl.style.background = "#fce8e6";
        statusEl.style.color = "#dc3545";
      } else {
        statusEl.style.background = "#fff0d4";
        statusEl.style.color = "#ff9800";
      }

      // 注入右侧表单数据
      document.getElementById("prof-input-email").value = u.email || "";
      document.getElementById("prof-input-phone").value = u.phone || "";

      // 读取本地头像
      const savedAvatar = localStorage.getItem(`avatar_${u.username}`);
      if (savedAvatar) {
        document.getElementById("avatarIcon").style.display = "none";
        document.getElementById("avatarPreview").style.backgroundImage =
          `url(${savedAvatar})`;
      } else {
        document.getElementById("avatarIcon").style.display = "block";
        document.getElementById("avatarPreview").style.backgroundImage = "none";
      }
    } else {
      document.getElementById("prof-val-user").innerText = "⚠️ 找不到该账号";
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    document.getElementById("prof-val-user").innerText = "🚨 网络请求失败";
  }
};

window.closeProfileModal = function () {
  document.getElementById("profileModal").classList.remove("show");
};

// ==========================================
// 退出登录逻辑 (彻底重置版)
// ==========================================
window.handleLogout = function () {
  if (confirm("Confirm Logout?")) {
    // 1. 彻底清除本地缓存里的账号记忆
    localStorage.removeItem("loggedInUser");
    if (typeof closeProfileModal === "function") closeProfileModal();

    // 2. 🔴 终极大招：强制刷新当前网页
    // 刷新后，系统检测不到缓存，会自动将所有 UI 和状态完美重置回最初的 Login 界面
    window.location.reload();
  }
};

// 主菜单切换
window.switchProfTab = function (tab) {
  document.getElementById("ptab-settings").classList.remove("active");
  document.getElementById("ptab-prefs").classList.remove("active");
  document.getElementById("pcontent-settings").style.display = "none";
  document.getElementById("pcontent-prefs").style.display = "none";

  document.getElementById(`ptab-${tab}`).classList.add("active");
  document.getElementById(`pcontent-${tab}`).style.display = "block";
};

// 子菜单切换
window.switchSubTab = function (tab) {
  document.getElementById("subtab-profile").classList.remove("active");
  document.getElementById("subtab-security").classList.remove("active");
  document.getElementById("subcontent-profile").style.display = "none";
  document.getElementById("subcontent-security").style.display = "none";

  document.getElementById(`subtab-${tab}`).classList.add("active");
  document.getElementById(`subcontent-${tab}`).style.display = "block";
};

// 🔴 真实保存普通资料与新头像
window.handleUpdateProfile = async function () {
  let email = document.getElementById("prof-input-email").value;
  let phone = document.getElementById("prof-input-phone").value;
  const currentUser = localStorage.getItem("loggedInUser");

  if (!currentUser) {
    // alert("❌ 请先正常登录系统！");
    return;
  }

  try {
    // 1. 发送真实数据给后端保存
    let response = await fetch(`${SERVER_URL}/update-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser,
        email: email,
        phone: phone,
      }),
    });

    let result = await response.json();

    if (result.success) {
      // 2. 如果后端保存成功，再保存头像到本地
      if (window.pendingAvatarUpdate) {
        localStorage.setItem(
          `avatar_${currentUser}`,
          window.pendingAvatarUpdate,
        );
        window.pendingAvatarUpdate = null;
      }
      syncGlobalAvatar();

      // alert("✅ 资料保存成功！");

      // 3. 刷新弹窗，让你立刻看到左侧名片更新
      closeProfileModal();
      setTimeout(() => openProfileModal(), 300);
    } else {
      // 如果邮箱/电话和别人撞了，这里会弹窗报错
      // alert("❌ " + result.message);
    }
  } catch (error) {
    console.error(error);
    // alert("🚨 网络请求失败，请检查后端是否运行。");
  }
};

// ==========================================
// 独立修改密码逻辑 (防呆与直接修改)
// ==========================================
window.handleUpdatePassword = async function () {
  let oldPass = document.getElementById("prof-input-oldpass").value;
  let newPass = document.getElementById("prof-input-newpass").value;
  let confPass = document.getElementById("prof-input-confpass").value;
  const currentUser = localStorage.getItem("loggedInUser");

  // 1. 基础防呆拦截
  if (!currentUser) return;
  if (!oldPass || !newPass || !confPass) {
    // alert("🚨 请将三个密码框填写完整！");
    return;
  }
  if (newPass !== confPass) {
    // alert("🚨 两次输入的新密码不一致，请重新输入！");
    return;
  }

  // 2. 发送给专属换密码接口
  try {
    let response = await fetch(`${SERVER_URL}/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser,
        oldPassword: oldPass,
        newPassword: newPass,
      }),
    });

    let result = await response.json();

    if (result.success) {
      // alert("✅ 密码修改成功！下次登录请使用新密码。");

      // 修改成功后，把三个输入框清空，假装什么都没发生
      document.getElementById("prof-input-oldpass").value = "";
      document.getElementById("prof-input-newpass").value = "";
      document.getElementById("prof-input-confpass").value = "";
    } else {
      // 如果旧密码填错了，后端会在这里拦截
      // alert(result.message);
    }
  } catch (error) {
    console.error(error);
    // alert("🚨 网络请求失败，请检查后端运行状态。");
  }
};
// 🔴 处理头像上传与即时预览
window.previewAvatar = function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatarBase64 = e.target.result;
      // 隐藏默认的 👤 图标，设置背景图
      document.getElementById("avatarIcon").style.display = "none";
      document.getElementById("avatarPreview").style.backgroundImage =
        `url(${avatarBase64})`;

      // 把图片数据暂存到全局变量，等待用户点击 Update Profile 保存
      window.pendingAvatarUpdate = avatarBase64;
    };
    reader.readAsDataURL(file); // 将图片转为 Base64
  }
};

// ==========================================
// 全局头像同步逻辑
// ==========================================
window.syncGlobalAvatar = function () {
  const currentUser = localStorage.getItem("loggedInUser");
  const globalBtn = document.getElementById("globalAvatarBtn");
  const globalIcon = document.getElementById("globalAvatarIcon");

  if (!globalBtn || !globalIcon) return;

  if (currentUser) {
    // 去缓存里找当前用户的专属头像
    const savedAvatar = localStorage.getItem(`avatar_${currentUser}`);
    if (savedAvatar) {
      globalBtn.style.backgroundImage = `url(${savedAvatar})`;
      globalIcon.style.display = "none"; // 隐藏默认的文字小人
      return;
    }
  }

  // 如果没找到照片，或者没登录，恢复默认小人
  globalBtn.style.backgroundImage = "none";
  globalIcon.style.display = "block";
};

// 页面一加载就偷偷执行一次，防止刷新后头像掉线
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(syncGlobalAvatar, 500);
});

// ==========================================
// 侧边栏折叠与展开逻辑
// ==========================================
window.toggleSidebar = function () {
  const sidebar = document.getElementById("mainSidebar");
  const mainContent = document.getElementById("mainContent");
  const headerBtn = document.getElementById("headerSidebarBtn");

  // 切换折叠状态的 CSS class
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");

  // 如果侧边栏被收起了，就在左上角显示出那个小按钮
  if (sidebar.classList.contains("collapsed")) {
    headerBtn.style.display = "block";
  } else {
    headerBtn.style.display = "none";
  }
};

// ==========================================
// Developer：加载我名下的所有项目
// ==========================================
window.loadMyProjects = async function () {
  const currentUser = localStorage.getItem("loggedInUser");
  if (!currentUser) return;

  try {
    let response = await fetch(
      `${SERVER_URL}/my-projects?username=${currentUser}`,
    );
    let result = await response.json();

    if (result.success) {
      const tbody = document.getElementById("myProjectsTableBody");
      tbody.innerHTML = ""; // 清空旧数据

      if (result.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #a3aed1;">No projects found. Go to "Submit Project" to create one! 🌱</td></tr>`;
        return;
      }

      result.data.forEach((p) => {
        // 根据状态生成不同颜色的炫酷 UI 标签
        let statusHtml = "";
        if (p.status === "approved" && !p.minted) {
          statusHtml = `<span style="background: #e6f9f0; color: #05cd99; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">✅ Approved</span>
                        <button type="button" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background-color: #4318ff; margin-left: 5px;" onclick="event.stopPropagation(); mintProjectToken(${p.id})">⛏️ Mint</button>`;
        } else if (p.status === "approved" && p.minted) {
          statusHtml = `<span style="background: #e9edf7; color: #4318ff; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">🌊 Minted</span>`;
        } else if (p.status === "rejected") {
          statusHtml = `<span style="background: #fce8e6; color: #ee5d50; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">❌ Rejected</span>`;
        } else {
          statusHtml = `<span style="background: #fff0d4; color: #ff9800; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">⏳ Pending</span>`;
        }

        // 组装每一行数据
        let tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #f4f7fe";
        tr.style.cursor = "pointer"; // 🔴 鼠标放上去变小手
        // 🔴 加个 hover 效果，并且点击触发查看详情 (把 p.id 传进去)
        tr.onmouseover = () => (tr.style.background = "#f8fafc");
        tr.onmouseout = () => (tr.style.background = "transparent");
        tr.onclick = () => openProjectModal(p.id);
        tr.innerHTML = `
                    <td style="padding: 15px 12px;">
                        <div style="font-weight: 700; color: #2b3674; font-size: 14px;">${p.projName || "Unnamed Project"}</div>
                        <div style="font-size: 12px; color: #a3aed1; margin-top: 4px;">ID: #${p.id}</div>
                    </td>
                    <td style="padding: 15px 12px;">
                        <div style="font-size: 13px; color: #2b3674;">${p.location || "Unknown"}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${p.capacity} Hectares</div>
                    </td>
                    <td style="padding: 15px 12px; font-weight: bold; color: #4318ff; font-size: 15px;">
                        ${p.carbonVolume}
                    </td>
                    <td style="padding: 15px 12px;">
                        ${statusHtml}
                    </td>
                `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("加载我的项目失败:", error);
  }
};

// ==========================================
// Developer Dashboard：核心数据加载
// ==========================================
let devPipelineChartInstance = null;

window.loadDevDashboard = async function () {
  const currentUser = localStorage.getItem("loggedInUser");
  if (!currentUser) return;

  // ---------- 1. 先从数据库拉取项目列表（不需要钱包） ----------
  let myProjects = [];
  try {
    let res = await fetch(`${SERVER_URL}/my-projects?username=${currentUser}`);
    let result = await res.json();
    if (result.success) myProjects = result.data;
  } catch (error) {
    console.error("加载 My Projects 失败:", error);
  }

  const totalProjects = myProjects.length;
  const pendingCount = myProjects.filter((p) => p.status === "pending").length;
  const approvedCount = myProjects.filter((p) => p.status === "approved").length;
  const rejectedCount = myProjects.filter((p) => p.status === "rejected").length;
  const awaitingMint = myProjects.filter((p) => p.status === "approved" && !p.minted);

  document.getElementById("dev-total-projects").innerText = totalProjects;
  document.getElementById("dev-pipe-pending").innerText = pendingCount;
  document.getElementById("dev-pipe-approved").innerText = approvedCount;
  document.getElementById("dev-pipe-rejected").innerText = rejectedCount;

  // 待铸币提醒横幅
  const banner = document.getElementById("devActionBanner");
  const bannerText = document.getElementById("devActionText");
  const bannerCta = document.getElementById("devActionCta");
  if (awaitingMint.length > 0) {
    banner.classList.remove("no-action");
    bannerText.innerHTML = `⚠️ 您有 <strong>${awaitingMint.length}</strong> 个项目已通过 Admin 审批！点击这里支付 Gas 费并 Mint 您的 BCC 代币。`;
    bannerCta.innerText = "去 Mint →";
  } else {
    banner.classList.add("no-action");
    bannerText.innerText = "✅ 目前没有待处理的 Mint 任务，所有已批准项目都已铸币。";
    bannerCta.innerText = "";
  }

  // 项目管道甜甜圈图
  const ctxPipe = document.getElementById("devPipelineChart");
  if (ctxPipe) {
    if (devPipelineChartInstance) devPipelineChartInstance.destroy();
    devPipelineChartInstance = new Chart(ctxPipe, {
      type: "doughnut",
      data: {
        labels: ["Pending", "Approved", "Rejected"],
        datasets: [
          {
            data: [pendingCount, approvedCount, rejectedCount],
            backgroundColor: ["#ff9800", "#05cd99", "#ee5d50"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false } },
      },
    });
  }

  // Total BCC Minted：用数据库里已 mint 项目的碳汇总量（和 Admin Dashboard 逻辑一致）
  const totalMintedFromDb = myProjects
    .filter((p) => p.minted)
    .reduce((sum, p) => sum + (p.carbonVolume || 0), 0);
  document.getElementById("dev-total-minted").innerText = totalMintedFromDb.toLocaleString();

  // ---------- 2. 需要连接钱包才能拉取的真实链上数据 ----------
  const salesFeedList = document.getElementById("devSalesFeedList");

  try {
    const devAddress = await ensureWalletConnected();
    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;
    const carbonToken = contracts.carbonToken;

    const allChainProjects = await registry.methods.getAllProjects().call();

    // 只看属于当前钱包地址的项目
    const myChainProjects = allChainProjects.filter(
      (p) => p.developer && p.developer.toLowerCase() === devAddress.toLowerCase()
    );

    const projectNameMap = {};
    myChainProjects.forEach((p) => {
      projectNameMap[p.projectID.toString()] = p.projectName;
    });

    // 计算目前手上还持有（尚未卖出）的可用额度
    let availableQuota = 0n;
    for (const p of myChainProjects) {
      try {
        const bal = await carbonToken.methods.balanceOf(devAddress, p.projectID).call();
        availableQuota += BigInt(bal);
      } catch (e) {
        console.warn("读取项目余额失败:", p.projectID, e);
      }
    }
    document.getElementById("dev-available-quota").innerText = availableQuota.toString();

    // 已卖出数量 + 收入：读取 TokensPurchased 事件（developer 是 indexed 字段，可直接过滤）
    let totalSold = 0n;
    let totalRevenueWei = 0n;
    let salesEvents = [];

    try {
      const purchaseEvents = await carbonToken.getPastEvents("TokensPurchased", {
        filter: { developer: devAddress },
        fromBlock: CARBON_TOKEN_DEPLOYMENT_BLOCK,
        toBlock: "latest",
      });

      for (const ev of purchaseEvents) {
        totalSold += BigInt(ev.returnValues.amount);
        totalRevenueWei += BigInt(ev.returnValues.totalPrice);
      }

      salesEvents = purchaseEvents;
    } catch (e) {
      console.warn("读取销售事件失败:", e);
    }

    document.getElementById("dev-total-sold").innerText = totalSold.toString();
    document.getElementById("dev-revenue").innerText =
      Web3.utils.fromWei(totalRevenueWei.toString(), "ether") + " ETH";

    // 近期销售动态：按区块号倒序，取最新 5 条
    salesEvents.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
    const recentSales = salesEvents.slice(0, 5);

    if (recentSales.length === 0) {
      salesFeedList.innerHTML = `<div style="text-align: center; color: #a3aed1; padding: 30px 0; font-size: 13px;">暂时还没有任何销售记录。</div>`;
    } else {
      salesFeedList.innerHTML = "";
      for (const ev of recentSales) {
        let dateDisplay = "";
        try {
          const block = await web3.eth.getBlock(ev.blockNumber);
          dateDisplay = new Date(Number(block.timestamp) * 1000).toLocaleDateString();
        } catch (e) {
          dateDisplay = "N/A";
        }
        const buyerShort = `${ev.returnValues.buyer.substring(0, 6)}...${ev.returnValues.buyer.substring(38)}`;
        const projName = projectNameMap[ev.returnValues.projectID.toString()] || `Project #${ev.returnValues.projectID}`;

        salesFeedList.innerHTML += `
          <div class="sales-feed-item">
            <div>
              <div style="font-weight: 700; color: #2b3674;">${buyerShort}</div>
              <div style="color: #a3aed1; font-size: 11px; margin-top: 2px;">${projName} · ${dateDisplay}</div>
            </div>
            <div style="font-weight: 800; color: #05cd99;">+${ev.returnValues.amount} BCC</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.warn("链上数据加载失败（可能未连接钱包）:", error);
    salesFeedList.innerHTML = `<div style="text-align: center; color: #a3aed1; padding: 30px 0; font-size: 13px;">🦊 请先连接 MetaMask 查看真实的额度与销售数据。</div>`;
    document.getElementById("dev-available-quota").innerText = "-";
    document.getElementById("dev-total-sold").innerText = "-";
    document.getElementById("dev-revenue").innerText = "-";
  }
};

// ==========================================
// Developer：打开项目详情，查看额度和买家
// ==========================================
window.openProjectModal = async function (projectId) {
  try {
    let response = await fetch(`${SERVER_URL}/project-details?id=${projectId}`);
    let result = await response.json();

    if (result.success) {
      const p = result.project;
      const stats = result.stats;
      const sales = result.sales;

      // 填充数据
      document.getElementById("det-title").innerText =
        p.projName || "Unnamed Project";
      document.getElementById("det-loc").innerText = p.location || "Unknown";
      document.getElementById("det-cap").innerText = p.capacity;
      document.getElementById("det-total").innerText = p.carbonVolume;

      // 填充剩余和已售
      document.getElementById("det-avail").innerText = stats.remaining;
      document.getElementById("det-sold").innerText = stats.sold;

      // 填充销售记录表
      const tbody = document.getElementById("det-sales-body");
      tbody.innerHTML = "";

      if (sales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 15px; color: #a3aed1;">No purchases yet.</td></tr>`;
      } else {
        sales.forEach((tx) => {
          tbody.innerHTML += `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px; color: #64748b;">${tx.txDate || "N/A"}</td>
                            <td style="padding: 10px; font-weight: bold; color: #2b3674;">${tx.buyerName}</td>
                            <td style="padding: 10px; text-align: right; color: #ff9800; font-weight: bold;">+${tx.amount}</td>
                        </tr>
                    `;
        });
      }

      // 显示弹窗
      document.getElementById("projectDetailModal").classList.add("show");
    } else {
      // alert("无法获s取项目详情");
    }
  } catch (error) {
    console.error(error);
  }
};

window.closeProjectModal = function () {
  document.getElementById("projectDetailModal").classList.remove("show");
};


// ==========================================
// Developer：点击 Mint 按钮，自己付 gas 上链铸币
// ==========================================
window.mintProjectToken = async function (projectId) {
  try {
    // 1. 拿项目最新详情
    let res = await fetch(`${SERVER_URL}/project-details?id=${projectId}`);
    let result = await res.json();
    if (!result.success) throw new Error("找不到项目详情");
    const p = result.project;

    if (p.status !== "approved") {
      alert("⚠️ 项目还没被 Admin 批准，不能 mint。");
      return;
    }
    if (p.minted) {
      alert("✅ 这个项目已经 mint 过了。");
      return;
    }

    // 2. 连接 dev 自己的钱包
    const devAddress = await ensureWalletConnected();
    const contracts = await ensureContractsReady();

    const priceInWei = web3.utils.toWei(String(p.pricePerToken || "0"), "ether");

    // 3. 先在 ProjectRegistry 上注册项目
    await contracts.projectRegistry.methods
      .createProject(
        p.id,
        p.projName,
        p.location,
        p.ecosystemType || "Unspecified",
        priceInWei,
        p.carbonVolume
      )
      .send({ from: devAddress });

    // 4. 再调用 CarbonToken 的 mintTokens 真正铸币
    await contracts.carbonToken.methods
      .mintTokens(p.id)
      .send({ from: devAddress });

    // 5. 通知后端把 SQLite 状态也标记为 minted
    await fetch(`${SERVER_URL}/mark-project-minted`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });

    alert("✅ Mint 成功！");
    loadMyProjects(); // 刷新表格
  } catch (error) {
    console.error("Mint failed:", error);
    alert("❌ Mint 失败：" + (error.message || error));
  }
};

function isBuyerRole(role) {
  return Number(role) === 1;
}

async function ensureWalletConnected() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed.");
  }

  // Make sure we are on Sepolia
  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (chainId.toLowerCase() !== "0xaa36a7") {
    throw new Error("Please switch MetaMask to Sepolia Test Network.");
  }

  // Get currently connected accounts
  let accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  // No wallet connected
  if (!accounts || accounts.length === 0) {
    accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet connected.");
  }

  // Keep your existing global variable updated
  currentAccount = accounts[0];

  // Make sure Web3 exists
  if (!web3) {
    web3 = new Web3(window.ethereum);
  }

  // Make sure contracts exist
  if (
    !projectRegistryContract ||
    !userRegistryContract ||
    !carbonTokenContract
  ) {
    const initialized = initializeBlockchainContracts();

    if (!initialized) {
      throw new Error("Unable to initialize blockchain contracts.");
    }
  }

  return currentAccount;
}

async function ensureBuyerWallet() {
  const walletAddress = await ensureWalletConnected();

  const contracts = await ensureContractsReady();

  const isBuyer = await contracts.userRegistry.methods
    .isBuyer(walletAddress)
    .call();

  if (!isBuyer) {
    throw new Error("Connected wallet is not an approved Buyer.");
  }

  return walletAddress;
}

window.loadMarketplace = async function () {
  const grid = document.getElementById("marketplaceGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML = `
        <div style="
            color: #a3aed1;
            padding: 30px;
            text-align: center;
        ">
            Loading marketplace...
        </div>
    `;

  try {
    // ==========================================
    // Make sure Web3 + contracts are ready
    // ==========================================

    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    console.log("ProjectRegistry address:", PROJECT_REGISTRY_ADDRESS);

    // ==========================================
    // Check that contract actually exists
    // ==========================================

    const code = await web3.eth.getCode(PROJECT_REGISTRY_ADDRESS);

    console.log("ProjectRegistry bytecode:", code);

    if (!code || code === "0x") {
      throw new Error(
        "No contract found at PROJECT_REGISTRY_ADDRESS. Check MetaMask network and contract address.",
      );
    }

    // projectIDs is a mapping-like getter,
    // so we need to discover IDs another way.
    //
    // The contract does NOT expose projectIDs.length.
    // Therefore we use getAllProjects as a fallback
    // only if we don't have a known project count.

    let projects = [];

    try {
      projects = await registry.methods.getAllProjects().call();

      console.log("getAllProjects() result:", projects);
    } catch (error) {
      console.warn("getAllProjects() failed:", error);

      throw new Error(
        "ProjectRegistry contract/ABI mismatch. Check that the deployed contract matches your current Solidity code.",
      );
    }

    // ==========================================
    // No projects
    // ==========================================

    if (!projects || projects.length === 0) {
      grid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    color: #a3aed1;
                ">
                    🌱 No projects found on blockchain.
                </div>
            `;

      return;
    }

    grid.innerHTML = "";

    // ==========================================
    // Render every project
    // ==========================================

    for (const project of projects) {
      const projectID = Number(project.projectID);

      if (!projectID) {
        continue;
      }

      const projectName = project.projectName || "Unnamed Project";

      const location = project.location || "Unknown";

      const ecosystemType = project.ecosystemType || "Unknown";

      const capacity = project.availableCapacity;

      const price = project.pricePerToken;

      const developer = project.developer;

      const minted = project.minted;

      console.log("Rendering project:", project);

      const card = document.createElement("div");

      card.style.cssText = `
                background: white;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.04);
                border: 1px solid #f0f2f8;
            `;

      card.innerHTML = `

                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                ">

                    <div>

                        <h3 style="
                            margin: 0;
                            color: #2b3674;
                            font-size: 17px;
                        ">
                            ${projectName}
                        </h3>

                        <div style="
                            color: #a3aed1;
                            font-size: 12px;
                            margin-top: 5px;
                        ">
                            Project #${projectID}
                        </div>

                    </div>


                    <span style="
                        background: ${minted ? "#e6f9f0" : "#fff4e5"};

                        color: ${minted ? "#05cd99" : "#ff9f43"};

                        padding: 5px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: bold;
                    ">
                        ${minted ? "VERIFIED" : "PENDING"}
                    </span>

                </div>


                <div style="
                    margin-bottom: 15px;
                    font-size: 13px;
                    color: #64748b;
                    line-height: 1.8;
                ">

                    <div>
                        📍 ${location}
                    </div>

                    <div>
                        🌱 ${ecosystemType}
                    </div>

                    <div>
                        📐 ${capacity} Hectares
                    </div>

                </div>


                <div style="
                    background: #f8fafc;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 15px;
                ">

                    <div style="
                        font-size: 11px;
                        color: #a3aed1;
                    ">
                        Available BCC
                    </div>

                    <div style="
                        font-size: 21px;
                        font-weight: 800;
                        color: #4318ff;
                    ">
                        ${capacity}
                    </div>

                </div>


                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                ">

                    <div>

                        <div style="
                            font-size: 11px;
                            color: #a3aed1;
                        ">
                            Price per BCC
                        </div>

                        <div style="
                            font-weight: 800;
                            color: #2b3674;
                        ">
                            ${formatEthPrice(price)}
                        </div>

                    </div>


                    <div style="
                        font-size: 11px;
                        color: #a3aed1;
                        text-align: right;
                        max-width: 120px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    ">
                        ${developer}
                    </div>

                </div>


                <input
                    type="number"
                    id="marketAmount-${projectID}"
                    min="1"
                    max="${capacity}"
                    value="1"
                    placeholder="Amount"
                    style="
                        width: 100%;
                        box-sizing: border-box;
                        margin-bottom: 10px;
                    "
                >


                <button
                    class="primary-btn"
                    onclick="
                        purchaseMarketplaceCredits(
                            ${projectID}
                        )
                    "
                    style="
                        width: 100%;
                        background: #4318ff;
                    "
                >
                    🛒 Buy BCC
                </button>

            `;

      grid.appendChild(card);
    }
  } catch (error) {
    console.error("Marketplace loading failed:", error);

    grid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #ee5d50;
            ">
                Unable to load marketplace.
                <br><br>
                <small>
                    ${error.message || error}
                </small>
            </div>
        `;
  }
};

function formatEthPrice(weiPrice) {
  try {
    return Web3.utils.fromWei(String(weiPrice), "ether") + " ETH";
  } catch (error) {
    return String(weiPrice) + " Wei";
  }
}

window.purchaseMarketplaceCredits = async function (projectID) {
  try {
    // ==========================================
    // 1. Get amount
    // ==========================================

    const amountInput = document.getElementById(`marketAmount-${projectID}`);

    if (!amountInput) {
      throw new Error("Amount input not found.");
    }

    const amount = amountInput.value.trim();

    if (!amount || !/^\d+$/.test(amount) || BigInt(amount) <= 0n) {
      throw new Error("Please enter a valid whole number of BCC.");
    }

    // ==========================================
    // 2. Make sure wallet is connected
    // ==========================================

    const buyerAddress = await ensureBuyerWallet();

    // ==========================================
    // 3. Make sure contracts are ready
    // ==========================================

    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;

    // ==========================================
    // 4. Check project exists
    // ==========================================

    const project = await registry.methods.projects(projectID).call();

    if (!project || Number(project.projectID) === 0) {
      throw new Error("Project does not exist.");
    }

    // ==========================================
    // 5. Check project is minted
    // ==========================================

    const minted = await registry.methods.isMinted(projectID).call();

    if (!minted) {
      throw new Error("This project has not been minted yet.");
    }

    // ==========================================
    // 6. Check available capacity
    // ==========================================

    const capacity = await registry.methods.getCapacity(projectID).call();

    if (BigInt(amount) > BigInt(capacity)) {
      throw new Error(`Only ${capacity} BCC are available.`);
    }

    // ==========================================
    // 7. Get price
    // ==========================================

    const pricePerToken = await registry.methods
      .getPricePerToken(projectID)
      .call();

    // ==========================================
    // 8. Calculate total price
    // ==========================================

    const totalPrice = BigInt(amount) * BigInt(pricePerToken);

    const totalEth = Web3.utils.fromWei(totalPrice.toString(), "ether");

    console.log("========== BCC PURCHASE ==========");

    console.log("Buyer:", buyerAddress);

    console.log("Project:", projectID);

    console.log("Project name:", project.projectName);

    console.log("Amount:", amount, "BCC");

    console.log(
      "Price per BCC:",
      Web3.utils.fromWei(pricePerToken.toString(), "ether"),
      "ETH",
    );

    console.log("Total:", totalEth, "ETH");

    // ==========================================
    // 9. Confirm purchase
    // ==========================================

    const confirmed = window.confirm(
      `Buy ${amount} BCC from "${project.projectName}" for ${totalEth} ETH?`,
    );

    if (!confirmed) {
      return;
    }

    // ==========================================
    // 10. Send transaction
    // ==========================================

    console.log("Waiting for MetaMask confirmation...");

    const receipt = await carbonToken.methods
      .purchaseCredits(projectID, amount)
      .send({
        from: buyerAddress,
        value: totalPrice.toString(),
      });

    // ==========================================
    // 11. Success
    // ==========================================

    console.log("========== PURCHASE SUCCESS ==========");

    console.log("Transaction:", receipt.transactionHash);

    alert(
      `✅ Purchase successful!\n\n` +
      `${amount} BCC purchased\n` +
      `Total paid: ${totalEth} ETH`,
    );

    // ==========================================
    // 12. Refresh marketplace
    // ==========================================

    await loadMarketplace();

    // ==========================================
    // 13. Refresh buyer portfolio
    // ==========================================

    if (typeof loadBuyerPortfolio === "function") {
      await loadBuyerPortfolio();
    }

    // ==========================================
    // 14. Refresh transaction history
    // ==========================================

    if (typeof loadBuyerTransactions === "function") {
      await loadBuyerTransactions();
    }
  } catch (error) {
    console.error("========== BCC PURCHASE FAILED ==========");

    console.error(error);

    let message = error?.message || String(error);

    // User rejected MetaMask
    if (
      message.includes("User denied") ||
      message.includes("User rejected") ||
      message.includes("denied transaction")
    ) {
      message = "Transaction was cancelled in MetaMask.";
    }

    alert(`❌ BCC purchase failed:\n\n${message}`);
  }
};

// ==========================================
// BUYER PORTFOLIO
// ==========================================
window.loadBuyerPortfolio = async function () {
  const tbody = document.getElementById("buyerPortfolioBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="
                    text-align: center;
                    padding: 30px;
                    color: #a3aed1;
                "
            >
                Loading portfolio...
            </td>
        </tr>
    `;

  try {
    // ==========================================
    // Wallet
    // ==========================================

    const buyerAddress = await ensureBuyerWallet();

    // ==========================================
    // Contracts
    // ==========================================

    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;

    console.log("Loading portfolio for:", buyerAddress);

    // ==========================================
    // Get all blockchain projects
    // ==========================================

    const projects = await registry.methods.getAllProjects().call();

    console.log("Portfolio blockchain projects:", projects);

    tbody.innerHTML = "";

    let totalBalance = 0n;
    let totalValueWei = 0n;
    let ownedProjects = 0;

    // ==========================================
    // Check every project
    // ==========================================

    for (const project of projects) {
      const projectID = project.projectID;

      if (!projectID || Number(projectID) === 0) {
        continue;
      }

      // ======================================
      // Get buyer balance
      // ======================================

      let balance;

      try {
        balance = await carbonToken.methods
          .balanceOf(buyerAddress, projectID)
          .call();
      } catch (error) {
        console.error(
          `Unable to read balance for project #${projectID}`,
          error,
        );

        continue;
      }

      // Skip projects the buyer doesn't own
      if (BigInt(balance) === 0n) {
        continue;
      }

      ownedProjects++;

      // ======================================
      // Project information
      // ======================================

      const projectName = project.projectName || `Project #${projectID}`;

      const location = project.location || "Unknown";

      const ecosystem = project.ecosystemType || "Unknown";

      const pricePerToken = BigInt(project.pricePerToken);

      const buyerBalance = BigInt(balance);

      const projectValue = buyerBalance * pricePerToken;

      totalBalance += buyerBalance;

      totalValueWei += projectValue;

      const totalElement = document.getElementById("totalBccHolding");

      if (totalElement) {
        totalElement.textContent = totalBalance.toString();
      }

      // ======================================
      // Create row
      // ======================================

      const row = document.createElement("tr");

      row.style.borderBottom = "1px solid #f4f7fe";

      row.innerHTML = `

                <td style="
                    padding: 15px 12px;
                ">

                    <strong style="
                        color: #2b3674;
                    ">
                        ${projectName}
                    </strong>

                    <div style="
                        color: #a3aed1;
                        font-size: 11px;
                        margin-top: 3px;
                    ">
                        #${projectID}
                    </div>

                </td>


                <td style="
                    padding: 15px 12px;
                    color: #64748b;
                ">

                    ${location}

                    <div style="
                        font-size: 10px;
                        color: #a3aed1;
                        margin-top: 3px;
                    ">
                        ${ecosystem}
                    </div>

                </td>


                <td style="
                    padding: 15px 12px;
                    color: #2b3674;
                ">

                    ${formatEthPrice(pricePerToken.toString())}

                </td>


                <td style="
                    padding: 15px 12px;
                    font-weight: 800;
                    color: #4318ff;
                ">

                    ${buyerBalance.toString()}
                    BCC

                </td>


                <td style="
                    padding: 15px 12px;
                    font-weight: 800;
                    color: #05cd99;
                ">

                    ${formatEthPrice(projectValue.toString())}

                </td>

            `;

      tbody.appendChild(row);
    }

    // ==========================================
    // No holdings
    // ==========================================

    if (ownedProjects === 0) {
      tbody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        style="
                            text-align: center;
                            padding: 50px;
                            color: #a3aed1;
                        "
                    >
                        🌱 You don't own any BCC yet.
                        <br><br>

                        <button
                            class="primary-btn"
                            onclick="
                                loadMarketplace()
                            "
                        >
                            Browse Marketplace
                        </button>

                    </td>
                </tr>
            `;

      return;
    }

    // ==========================================
    // Portfolio summary
    // ==========================================

    console.log("========== PORTFOLIO ==========");

    console.log("Projects owned:", ownedProjects);

    console.log("Total BCC:", totalBalance.toString());

    console.log(
      "Total portfolio value:",
      formatEthPrice(totalValueWei.toString()),
    );
  } catch (error) {
    console.error("Portfolio loading failed:", error);

    tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align: center;
                        padding: 40px;
                        color: #ee5d50;
                    "
                >
                    Unable to load portfolio.
                    <br><br>

                    <small>
                        ${error.message || error}
                    </small>

                </td>
            </tr>
        `;
  }
};

// ==========================================
// Load projects into Offset dropdown
// ==========================================

window.loadOffsetProjects = async function () {
  const select = document.getElementById("offsetProjectSelect");

  if (!select) {
    return;
  }

  try {
    // ==========================================
    // Wallet
    // ==========================================

    const buyerAddress = await ensureBuyerWallet();

    // ==========================================
    // Contracts
    // ==========================================

    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;

    // ==========================================
    // Load blockchain projects
    // ==========================================

    const projects = await registry.methods.getAllProjects().call();

    select.innerHTML = `
            <option value="">
                Select a project
            </option>
        `;

    // ==========================================
    // Only show projects the buyer owns
    // ==========================================

    for (const project of projects) {
      const projectID = project.projectID;

      if (!projectID || Number(projectID) === 0) {
        continue;
      }

      const balance = await carbonToken.methods
        .balanceOf(buyerAddress, projectID)
        .call();

      if (BigInt(balance) === 0n) {
        continue;
      }

      const option = document.createElement("option");

      option.value = projectID;

      option.textContent = `${project.projectName || "Project #" + projectID
        } — ${balance} BCC`;

      select.appendChild(option);
    }

    // ==========================================
    // Nothing available
    // ==========================================

    if (select.options.length === 1) {
      const option = document.createElement("option");

      option.disabled = true;

      option.textContent = "No BCC available to offset";

      select.appendChild(option);
    }
  } catch (error) {
    console.error("Unable to load offset projects:", error);

    select.innerHTML = `
            <option value="">
                Unable to load projects
            </option>
        `;
  }
};

// ==========================================
// Quick button from Portfolio
// ==========================================

window.openOffsetForProject = function (projectID, balance) {
  navTo("buyerOffsetPage", "Offset & Claim");

  setTimeout(async () => {
    await loadOffsetProjects();

    const select = document.getElementById("offsetProjectSelect");

    const amount = document.getElementById("offsetAmount");

    if (select) {
      select.value = projectID;
    }

    if (amount) {
      amount.max = balance;
    }
  }, 100);
};

// ==========================================
// Retire BCC
// ==========================================
window.retireBuyerCredits = async function () {
  try {
    // ==========================================
    // Get selected project
    // ==========================================

    const select = document.getElementById("offsetProjectSelect");

    const amountInput = document.getElementById("offsetAmount");

    if (!select || !amountInput) {
      throw new Error("Offset form not found.");
    }

    const projectID = select.value;

    const amount = amountInput.value.trim();

    if (!projectID) {
      throw new Error("Please select a project.");
    }

    if (!amount || !/^\d+$/.test(amount) || BigInt(amount) <= 0n) {
      throw new Error("Please enter a valid whole number of BCC.");
    }

    // ==========================================
    // Wallet
    // ==========================================

    const buyerAddress = await ensureBuyerWallet();

    // ==========================================
    // Contracts
    // ==========================================

    const contracts = await ensureContractsReady();

    const carbonToken = contracts.carbonToken;

    const registry = contracts.projectRegistry;

    // ==========================================
    // Get project
    // ==========================================

    const project = await registry.methods.projects(projectID).call();

    if (!project || Number(project.projectID) === 0) {
      throw new Error("Project does not exist.");
    }

    // ==========================================
    // Check BCC balance
    // ==========================================

    const balance = await carbonToken.methods
      .balanceOf(buyerAddress, projectID)
      .call();

    if (BigInt(amount) > BigInt(balance)) {
      throw new Error(`You only own ${balance} BCC from this project.`);
    }

    // ==========================================
    // Confirm
    // ==========================================

    const confirmed = window.confirm(
      `Offset ${amount} BCC from "${project.projectName}"?\n\n` +
      `This will permanently retire these credits.`,
    );

    if (!confirmed) {
      return;
    }

    console.log("Retiring BCC:", {
      buyer: buyerAddress,
      projectID,
      amount,
    });

    // ==========================================
    // Send transaction
    // ==========================================

    const receipt = await carbonToken.methods.retire(projectID, amount).send({
      from: buyerAddress,
    });

    console.log("BCC retirement successful:", receipt.transactionHash);

    alert(
      `✅ Offset successful!\n\n` +
      `${amount} BCC retired from "${project.projectName}".`,
    );

    // ==========================================
    // Clear amount
    // ==========================================

    amountInput.value = "";

    // ==========================================
    // Refresh everything
    // ==========================================

    await loadBuyerPortfolio();

    await loadOffsetProjects();

    await loadBuyerTransactions();
  } catch (error) {
    console.error("BCC retirement failed:", error);

    alert(`❌ Offset failed:\n\n${error.message || error}`);
  }
};

// ==========================================
// Buyer Transaction History
//
// Reads CarbonToken events directly.
//
// TokensPurchased
// TokensRetired
// ==========================================

window.loadBuyerTransactions = async function () {
  const tbody = document.getElementById("buyerTxBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="
                    text-align: center;
                    padding: 30px;
                    color: #a3aed1;
                "
            >
                Loading transactions...
            </td>
        </tr>
    `;

  try {
    // ==========================================
    // Wallet
    // ==========================================

    const buyerAddress = await ensureBuyerWallet();

    // ==========================================
    // Contracts
    // ==========================================

    const contracts = await ensureContractsReady();

    const carbonToken = contracts.carbonToken;

    const registry = contracts.projectRegistry;

    // ==========================================
    // Get blockchain projects
    // ==========================================

    const projects = await registry.methods.getAllProjects().call();

    const projectMap = {};

    for (const project of projects) {
      projectMap[project.projectID.toString()] = project;
    }

    const transactions = await syncBuyerTransactionEvents(
      carbonToken,
      buyerAddress,
    );

    transactions.sort((a, b) => b.blockNumber - a.blockNumber);
    // ==========================================
    // // No transactions
    // // ==========================================
    if (transactions.length === 0) {
      tbody.innerHTML = `<tr> <td colspan="5" 
            style=" text-align: center; padding: 30px; 
            color: #a3aed1; " > 
            No transactions yet. 
            </td> </tr>`;
      return;
    }

    // ==========================================
    // Render transactions
    // ==========================================

    tbody.innerHTML = "";

    for (const tx of transactions) {
      const project = projectMap[tx.projectID.toString()];
      const projectName = project?.projectName || `Project #${tx.projectID}`;
      const isPurchase = tx.type === "Purchase";
      const amount = BigInt(tx.amount);
      let dateDisplay = "Date unavailable";
      if (tx.timestamp) {
        dateDisplay = new Date(tx.timestamp * 1000).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid #f4f7fe";
      row.innerHTML = ` <!-- DATE --> <td style=" padding: 15px 12px; color: #64748b; font-size: 12px; white-space: nowrap; "> ${dateDisplay} </td> <!-- PROJECT --> <td style=" padding: 15px 12px; "> <strong style=" color: #2b3674; "> ${projectName} </strong> <div style=" color: #a3aed1; font-size: 11px; margin-top: 3px; "> Project #${tx.projectID} </div> </td> <!-- TYPE --> <td style=" padding: 15px 12px; "> <span style=" display: inline-block; padding: 5px 9px; border-radius: 6px; background: ${isPurchase ? "#eef2ff" : "#fff4e5"}; color: ${isPurchase ? "#4318ff" : "#ff9f43"}; font-size: 11px; font-weight: 700; "> ${isPurchase ? "Purchase" : "Retirement"} </span> </td> <!-- AMOUNT --> <td style=" padding: 15px 12px; font-weight: 800; color: ${isPurchase ? "#4318ff" : "#e94560"}; "> ${isPurchase ? "+" : "-"}${amount.toString()} BCC </td> <!-- STATUS --> <td style=" padding: 15px 12px; "> <span style=" color: #05cd99; font-weight: 700; font-size: 12px; "> ✓ Completed </span> <div style=" margin-top: 5px; "> <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" rel="noopener noreferrer" style=" color: #4318ff; font-size: 11px; text-decoration: none; " > View transaction ↗ </a> </div> </td> `;
      tbody.appendChild(row);
    }

    console.log("Transaction history loaded:", transactions);
  } catch (error) {
    console.error("Transaction history failed:", error);

    tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align: center;
                        padding: 40px;
                        color: #ee5d50;
                    "
                >
                    Unable to load transaction history.

                    <br><br>

                    <small>
                        ${error.message || error}
                    </small>
                </td>
            </tr>
        `;
  }
};

const CARBON_TOKEN_DEPLOYMENT_BLOCK = 11606852;
// ↑ Replace with your REAL CarbonToken deployment block.

async function syncBuyerTransactionEvents(carbonToken, buyerAddress) {
  const chainId = Number(await web3.eth.getChainId());

  const currentBlock = Number(await web3.eth.getBlockNumber());

  const TX_SYNC_KEY = `bcc_transaction_sync_${chainId}_${CARBON_TOKEN_ADDRESS.toLowerCase()}_${buyerAddress.toLowerCase()}`;

  // ==========================================
  // Load saved state
  // ==========================================

  let savedState = null;

  try {
    const raw = localStorage.getItem(TX_SYNC_KEY);

    if (raw) {
      savedState = JSON.parse(raw);
    }
  } catch (error) {
    console.warn("Unable to read saved transaction state:", error);

    savedState = null;
  }

  // ==========================================
  // Verify saved state belongs to this
  // contract/network/buyer
  // ==========================================

  const validState =
    savedState &&
    Number(savedState.chainId) === chainId &&
    savedState.contractAddress.toLowerCase() ===
    CARBON_TOKEN_ADDRESS.toLowerCase() &&
    savedState.buyerAddress.toLowerCase() === buyerAddress.toLowerCase();

  if (!validState) {
    savedState = {
      chainId,

      contractAddress: CARBON_TOKEN_ADDRESS,

      buyerAddress,

      deploymentBlock: CARBON_TOKEN_DEPLOYMENT_BLOCK,

      lastSyncedBlock: CARBON_TOKEN_DEPLOYMENT_BLOCK - 1,

      events: [],
    };
  }

  // ==========================================
  // Nothing new to scan
  // ==========================================

  if (savedState.lastSyncedBlock >= currentBlock) {
    console.log("Transaction history already synced.");

    return savedState.events;
  }

  // ==========================================
  // Scan in chunks
  // ==========================================

  const CHUNK_SIZE = 9000;

  let fromBlock = Math.max(
    Number(savedState.lastSyncedBlock) + 1,
    CARBON_TOKEN_DEPLOYMENT_BLOCK,
  );

  while (fromBlock <= currentBlock) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);

    console.log(`Syncing transaction events: ${fromBlock} → ${toBlock}`);

    // ======================================
    // Purchases
    // ======================================

    const purchaseEvents = await carbonToken.getPastEvents("TokensPurchased", {
      filter: {
        buyer: buyerAddress,
      },

      fromBlock,

      toBlock,
    });

    // ======================================
    // Retirements
    // ======================================

    const retiredEvents = await carbonToken.getPastEvents("TokensRetired", {
      filter: {
        buyer: buyerAddress,
      },

      fromBlock,

      toBlock,
    });

    const newEvents = [];

    const blockTimestamps = new Map();
    const allEvents = [...purchaseEvents, ...retiredEvents];

    for (const event of allEvents) {
      const blockNumber = Number(event.blockNumber);
      if (!blockTimestamps.has(blockNumber)) {
        const block = await web3.eth.getBlock(blockNumber);
        blockTimestamps.set(blockNumber, Number(block.timestamp));
      }
    }

    // ======================================
    // Convert purchase events
    // ======================================

    for (const event of purchaseEvents) {
      newEvents.push({
        id: `${event.transactionHash}-${event.logIndex}`,

        type: "Purchase",

        projectID: event.returnValues.projectID,

        amount: event.returnValues.amount,

        totalPrice: event.returnValues.totalPrice,

        blockNumber: Number(event.blockNumber),

        transactionHash: event.transactionHash,

        logIndex: Number(event.logIndex),

        status: "Completed",
        timestamp: blockTimestamps.get(Number(event.blockNumber)),
      });
    }

    // ======================================
    // Convert retirement events
    // ======================================

    for (const event of retiredEvents) {
      newEvents.push({
        id: `${event.transactionHash}-${event.logIndex}`,

        type: "Retirement",

        projectID: event.returnValues.projectID,

        amount: event.returnValues.amount,

        totalPrice: "0",

        blockNumber: Number(event.blockNumber),

        transactionHash: event.transactionHash,

        logIndex: Number(event.logIndex),

        status: "Completed",
        timestamp: blockTimestamps.get(Number(event.blockNumber)),
      });
    }

    // ======================================
    // Prevent duplicates
    // ======================================

    const existingIDs = new Set(savedState.events.map((event) => event.id));

    for (const event of newEvents) {
      if (!existingIDs.has(event.id)) {
        savedState.events.push(event);

        existingIDs.add(event.id);
      }
    }

    // ======================================
    // IMPORTANT:
    // Save checkpoint after every successful
    // chunk.
    // ======================================

    savedState.lastSyncedBlock = toBlock;

    localStorage.setItem(TX_SYNC_KEY, JSON.stringify(savedState));

    fromBlock = toBlock + 1;
  }

  console.log("Transaction sync complete.", {
    lastSyncedBlock: savedState.lastSyncedBlock,

    eventCount: savedState.events.length,
  });

  return savedState.events;
}
