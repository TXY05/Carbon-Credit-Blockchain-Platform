let web3;
let currentAccount;

const USER_REGISTRY_ADDRESS = "0xC65B8dB9C7CD0985083bB42A4bbc421F8DCEC6Ea";
const PROJECT_REGISTRY_ADDRESS = "0x327d399a187593c7CdD33d166463EA55871E4f74";
const CARBON_TOKEN_ADDRESS = "0xe48aBBBCBbEef612287da5e91677DcFc886EF4aB";

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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "projectName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ecosystemType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pricePerToken",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableCapacity",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userRegistry",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "developer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "projectName",
        "type": "string"
      }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "ProjectMinted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "reduceAvailableCapacity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_carbonToken",
        "type": "address"
      }
    ],
    "name": "setCarbonToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "setMinted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "carbonToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProjects",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "projectID",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "developer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "projectName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ecosystemType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "pricePerToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "availableCapacity",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "minted",
            "type": "bool"
          },
          {
            "internalType": "enum ProjectRegistry.ProjectStatus",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct ProjectRegistry.Project[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "getCapacity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "getDeveloper",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "getPricePerToken",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProjectCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "isApproved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "isMinted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projectIDs",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projects",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "developer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "projectName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ecosystemType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pricePerToken",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableCapacity",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "minted",
        "type": "bool"
      },
      {
        "internalType": "enum ProjectRegistry.ProjectStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "userRegistry",
    "outputs": [
      {
        "internalType": "contract IUserRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


const CARBON_TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_IProjectRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_IUserRegistry",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "mintTokens",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "purchaseCredits",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "retire",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "developer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrice",
        "type": "uint256"
      }
    ],
    "name": "TokensPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokensRetired",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "remaining",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allowed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "projectID",
        "type": "uint256"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projectBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectRegistry",
    "outputs": [
      {
        "internalType": "contract IProjectRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projectRetired",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "retired",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMinted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRetired",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "userRegistry",
    "outputs": [
      {
        "internalType": "contract IUserRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
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

const SERVER_URL = "http://localhost:3000";

let connectedWallet = null;



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



window.connectMetaMask = async function () {

  if (typeof window.ethereum === "undefined") {

    alert(
      "MetaMask is not installed. Please install MetaMask first."
    );

    return null;
  }

  try {

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


function shortenAddress(address) {

  if (!address) return "";

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(address.length - 4)
  );

}

window.connectAndLogin = async function () {

  try {

    const walletAddress =
      await ensureWalletConnected();

    if (!walletAddress) {
      return;
    }

    localStorage.setItem("loggedInWallet", walletAddress);

    console.log(
      "Connected wallet:",
      walletAddress
    );

    try {
      const profRes = await fetch(`${SERVER_URL}/user-profile?walletAddress=${walletAddress}`);
      const profData = await profRes.json();
      if (profData.success && profData.data && profData.data.username) {
        localStorage.setItem("loggedInUser", profData.data.username);
      }
    } catch (e) {
      console.warn("Unable to cache username:", e);
    }



    const contracts =
      await ensureContractsReady();



    const owner =
      await contracts.userRegistry.methods
        .owner()
        .call();

    const isOwner =
      owner.toLowerCase() ===
      walletAddress.toLowerCase();



    const isAdmin =
      await contracts.userRegistry.methods
        .isAdmin(walletAddress)
        .call();


    console.log("Contract owner:", owner);
    console.log("Is owner:", isOwner);
    console.log("Is admin:", isAdmin);



    if (isOwner || isAdmin) {

      console.log(
        "✅ Admin/Owner login successful"
      );


      switchRole("admin");
      navTo("adminDashPage", "Admin Dashboard");

      return;
    }

    const role =
      await contracts.userRegistry.methods
        .getUserRole(walletAddress)
        .call();


    console.log(
      "Blockchain role:",
      role
    );

    if (Number(role) === 0) {

      alert(
        "This wallet is not registered yet.\n\n" +
        "Please register first or wait for Admin approval."
      );

      toggleAuthMode("register");

      return;
    }


    if (Number(role) === 1) {

      switchRole("buyer");
      navTo("marketPage", "Marketplace");
    }

    else if (Number(role) === 2) {

      switchRole("developer");
      navTo("devDashPage", "Developer Dashboard");

    }

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



window.handleRegister = async function () {

  try {


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

    const contracts =
      await ensureContractsReady();


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


    alert(
      "✅ Registration submitted!\n\n" +
      "Your account is now waiting for Admin approval."
    );


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

document.getElementById("submitBtn").onclick = async function () {
  let projName = document.getElementById("projName").value.trim();
  let location = document.getElementById("location").value.trim();
  let capacity = document.getElementById("capacity").value;
  let deadline = document.getElementById("deadline").value;
  let ecosystemType = document.getElementById("ecosystemType").value;
  let pricePerToken = document.getElementById("pricePerToken").value;

  if (!projName || !location || !capacity || !deadline || !pricePerToken) {
    alert("🚨 Please fill in all project information!");
    return;
  }

  try {
    const devAddress = await ensureWalletConnected();
    const contracts = await ensureContractsReady();
    const onChainProjectID = Date.now();

    const carbonVolume = capacity * 5;

    const priceInWei = web3.utils.toWei(String(pricePerToken), "ether");

    await contracts.projectRegistry.methods
      .createProject(
        onChainProjectID,
        projName,
        location,
        ecosystemType,
        priceInWei,
        carbonVolume
      )
      .send({ from: devAddress });

    await fetch(`${SERVER_URL}/submit-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: localStorage.getItem("loggedInUser"),
        projName, devAddress, location, capacity, deadline,
        ecosystemType, pricePerToken,
        onChainProjectID: String(onChainProjectID)
      })
    });

    alert("✅ Project submitted successfully! It's on-chain, waiting for Admin review.");

    document.getElementById("projName").value = "";
    document.getElementById("location").value = "";
    document.getElementById("capacity").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("pricePerToken").value = "";

    navTo("devHistoryPage", "My Projects");
  } catch (error) {
    console.error("Project submission failed:", error);
    alert("❌ Submission failed: " + (error.message || error));
  }
};

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

window.loadPendingProjects = async function () {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a3aed1; padding: 30px 0;">Loading...</td></tr>`;

  try {
    const res = await fetch(`${SERVER_URL}/pending-projects`);
    const pendingProjects = await res.json();

    tbody.innerHTML = "";

    if (pendingProjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 No projects need review right now</td></tr>`;
      return;
    }

    pendingProjects.forEach((proj) => {
      let row = `<tr>
                <td><strong>${proj.projName || "Unnamed Project"}</strong></td>
                <td>${proj.location}</td>
                <td>${proj.ecosystemType}</td>
                <td><strong style="color: #5640fa;">${proj.carbonVolume} BCC</strong></td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <button type="button" class="primary-btn" onclick="approveProject(${proj.id})" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">
                        Approve
                    </button>
                    <button type="button" class="primary-btn" onclick="rejectProject(${proj.id})" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">
                        Reject
                    </button>
                </td>
            </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Failed to load pending projects:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ee5d50; padding: 30px 0;">Loading failed: ${error.message || error}</td></tr>`;
  }
};

window.approveProject = async function (id) {
  try {
    const res = await fetch(`${SERVER_URL}/approve-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await res.json();
    if (!result.success) throw new Error("Backend rejected the update");

    alert("✅ Project approved!");
    loadPendingProjects();
  } catch (error) {
    console.error("Approval failed:", error);
    alert("❌ Approval failed: " + (error.message || error));
  }
};

window.rejectProject = async function (id) {
  if (!confirm("⚠️ Are you sure you want to reject this project?")) return;
  try {
    const res = await fetch(`${SERVER_URL}/reject-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await res.json();
    if (!result.success) throw new Error("Backend rejected the update");

    alert("🚫 Project rejected.");
    loadPendingProjects();
  } catch (error) {
    console.error("Rejection failed:", error);
    alert("❌ Rejection failed: " + (error.message || error));
  }
};

let allProjectsData = [];

window.loadAllProjects = async function () {
  try {
    const res = await fetch(`${SERVER_URL}/all-projects`);
    const rows = await res.json();
    allProjectsData = Array.isArray(rows) ? rows : [];
    applyProjectFilters();
  } catch (error) {
    console.error("Failed to load full project list:", error);
    alert("🚨 Failed to fetch data: " + (error.message || error));
  }
};

window.applyProjectFilters = function () {
  const statusFilter = document.getElementById("filterProjectStatus").value;

  let filtered = allProjectsData.filter((p) => {
    return statusFilter === "all" || p.status === statusFilter;
  });

  let tbody = document.getElementById("allProjectsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a3aed1; padding: 30px 0;">No projects match the filter</td></tr>`;
    return;
  }

  filtered.forEach((p) => {
    let statusColor =
      p.status === "approved" ? "#28a745" : p.status === "rejected" ? "#dc3545" : "#ff9800";
    let statusBg =
      p.status === "approved" ? "#e6f4ea" : p.status === "rejected" ? "#fce8e6" : "#fff0d4";

    let clickable = !!p.minted && !!p.onChainProjectID;
    let rowStyle = clickable ? `cursor: pointer;` : `cursor: default;`;
    let rowOnclick = clickable ? `onclick="openProjectModal(${p.onChainProjectID})"` : ``;

    let row = `<tr style="${rowStyle}" ${rowOnclick} onmouseover="if(${clickable}) this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td>#${p.id}</td>
            <td><strong>${p.projName || "Unnamed Project"}</strong></td>
            <td>${p.location}</td>
            <td>${p.ecosystemType}</td>
            <td><strong style="color: #5640fa;">${p.carbonVolume} BCC</strong></td>
            <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 13px; text-transform: capitalize;">${p.status}</span></td>
        </tr>`;
    tbody.innerHTML += row;
  });
};

window.switchUserTab = function (tab) {
  if (tab === "pending") {
    document.getElementById("panel-pending-users").style.display = "block";
    document.getElementById("panel-all-users").style.display = "none";
    document.getElementById("tab-pending-users").style.background = "#5640fa";
    document.getElementById("tab-pending-users").style.color = "white";
    document.getElementById("tab-all-users").style.background = "#f4f7fe";
    document.getElementById("tab-all-users").style.color = "#2b3674";
    loadPendingUsers();
  } else {
    document.getElementById("panel-pending-users").style.display = "none";
    document.getElementById("panel-all-users").style.display = "block";
    document.getElementById("tab-all-users").style.background = "#5640fa";
    document.getElementById("tab-all-users").style.color = "white";
    document.getElementById("tab-pending-users").style.background = "#f4f7fe";
    document.getElementById("tab-pending-users").style.color = "#2b3674";
    loadAllUsers();
  }
};

window.loadPendingUsers = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/pending-users`);
    let pendingUsers = await response.json();

    let tbody = document.getElementById("userTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (pendingUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 No users need review right now</td></tr>`;
      return;
    }

    pendingUsers.forEach((u) => {
      let row = `<tr>
                <td><strong>${u.username}</strong></td>
                <td style="text-transform: capitalize;">${u.role}</td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <button type="button" class="primary-btn" onclick="approveUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">Approve</button>
                    
                    <button type="button" class="primary-btn" onclick="rejectUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">Reject</button>
                </td>
            </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
  }
};

window.approveUser = async function (userId) {

  try {


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


    if (!user.walletAddress) {

      alert(
        "This user does not have a MetaMask wallet address."
      );

      return;
    }


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



    const adminWallet =
      await ensureWalletConnected();



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


    alert(
      "✅ User approved successfully!\n\n" +
      "Wallet has been registered on blockchain."
    );



    loadPendingUsers();


  } catch (error) {

    console.error(
      "❌ User approval failed:",
      error
    );


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
  if (!confirm("⚠️ Are you sure you want to reject this user's application?")) return;
  try {
    let response = await fetch(`${SERVER_URL}/reject-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId }),
    });

    if ((await response.json()).success) {
      loadPendingUsers();
    }
  } catch (error) {
    console.error(error);
  }
};

let allUsersData = [];

window.loadAllUsers = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/all-users`);
    allUsersData = await response.json();

    console.log("🔥 Raw user data from backend: ", allUsersData);

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

    let matchDate = true;
    if (u.createdAt) {
      let rowDate = u.createdAt.split(" ")[0];
      if (startDate && rowDate < startDate) matchDate = false;
      if (endDate && rowDate > endDate) matchDate = false;
    } else {
      if (startDate || endDate) matchDate = false;
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
window.deleteUser = async function (userId) {
  if (
    !confirm(
      "⚠️ Are you sure you want to permanently delete this account? Once deleted, anyone can re-register with this Username.",
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
      loadAllUsers();
    }
  } catch (error) {
    console.error("Deletion request error:", error);
  }
};

let dashChartQueue = null;
let dashChartLiquidity = null;
let dashChartTx = null;

window.loadAdminDashboard = async function () {
  try {
    let response = await fetch(`${SERVER_URL}/admin-stats`);
    let stats = await response.json();

    if (stats.success) {
      document.getElementById("dash-pending-users").innerText =
        stats.pendingUsers + " ";

      const ctxQueue = document.getElementById("queueChart");
      if (ctxQueue) {
        if (dashChartQueue) dashChartQueue.destroy();
        dashChartQueue = new Chart(ctxQueue, {
          type: "doughnut",
          data: {
            labels: ["Project Approvals", "User Approvals"],
            datasets: [
              {
                data: [stats.pendingProjects, stats.pendingUsers],
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

    let contracts;
    try {
      contracts = await ensureContractsReady();
      const totalMintedOnChain = await contracts.carbonToken.methods.totalMinted().call();
      const totalRetired = await contracts.carbonToken.methods.totalRetired().call();

      const mintedEl = document.getElementById("dash-minted");
      if (mintedEl) {
        mintedEl.innerText = BigInt(totalMintedOnChain).toLocaleString();
      }

      const offsetEl = document.getElementById("dash-offset");
      if (offsetEl) {
        offsetEl.innerText = BigInt(totalRetired).toLocaleString();
      }

      const circulatingEl = document.getElementById("dash-circulating");
      if (circulatingEl) {
        const circulating = BigInt(totalMintedOnChain) - BigInt(totalRetired);
        circulatingEl.innerText = circulating.toLocaleString();
      }

      const pendingProjEl = document.getElementById("dash-pending-proj");
      if (pendingProjEl) {
        pendingProjEl.innerText = stats.pendingProjects + " ";
      }

      try {
        const userCurrentBlock = Number(await web3.eth.getBlockNumber());
        const CHUNK_SIZE = 9000;
        let fromBlock = CARBON_TOKEN_DEPLOYMENT_BLOCK;
        let registeredEvents = [];

        while (fromBlock <= userCurrentBlock) {
          const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, userCurrentBlock);
          const chunk = await contracts.userRegistry.getPastEvents("UserRegistered", {
            fromBlock,
            toBlock,
          });
          registeredEvents = registeredEvents.concat(chunk);
          fromBlock = toBlock + 1;
        }

        const roleByAddress = new Map();
        for (const ev of registeredEvents) {
          roleByAddress.set(ev.returnValues.user.toLowerCase(), Number(ev.returnValues.role));
        }

        let onChainDevCount = 0;
        let onChainBuyerCount = 0;
        for (const role of roleByAddress.values()) {
          if (role === 2) onChainDevCount++;
          if (role === 1) onChainBuyerCount++;
        }

        const onChainTotalActive = onChainDevCount + onChainBuyerCount;
        const onChainRatioText =
          onChainBuyerCount === 0
            ? `${onChainDevCount} : 0`
            : `${(onChainDevCount / onChainBuyerCount).toFixed(2)} : 1`;

        document.getElementById("dash-ratio").innerText = onChainRatioText;

        if (onChainTotalActive > 0) {
          const dPercent = Math.round((onChainDevCount / onChainTotalActive) * 100);
          document.getElementById("bar-dev").style.width = dPercent + "%";
          document.getElementById("bar-buyer").style.width = 100 - dPercent + "%";
        }
      } catch (e) {
        console.warn("Failed to read on-chain user registrations:", e);
      }

      const ctxQueueLive = document.getElementById("queueChart");
      if (ctxQueueLive && stats.success) {
        if (dashChartQueue) dashChartQueue.destroy();
        dashChartQueue = new Chart(ctxQueueLive, {
          type: "doughnut",
          data: {
            labels: ["Project Approvals", "User Approvals"],
            datasets: [
              {
                data: [onChainPendingProjects, stats.pendingUsers],
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
    } catch (e) {
      console.warn("Failed to read on-chain admin data:", e);
    }

    try {
      if (!contracts) contracts = await ensureContractsReady();

      const currentBlock = Number(await web3.eth.getBlockNumber());
      const CHUNK_SIZE = 9000;
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

      let mintEvents = [];
      let retireEvents = [];
      let fromBlock = CARBON_TOKEN_DEPLOYMENT_BLOCK;

      while (fromBlock <= currentBlock) {
        const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);

        const mintChunk = await contracts.carbonToken.getPastEvents("Transfer", {
          filter: { from: ZERO_ADDRESS },
          fromBlock,
          toBlock,
        });
        mintEvents = mintEvents.concat(mintChunk);

        const retireChunk = await contracts.carbonToken.getPastEvents("TokensRetired", {
          fromBlock,
          toBlock,
        });
        retireEvents = retireEvents.concat(retireChunk);

        fromBlock = toBlock + 1;
      }

      const blockNumbers = new Set([
        ...mintEvents.map((e) => Number(e.blockNumber)),
        ...retireEvents.map((e) => Number(e.blockNumber)),
      ]);
      const blockTimestamps = new Map();
      for (const bn of blockNumbers) {
        const block = await web3.eth.getBlock(bn);
        blockTimestamps.set(bn, Number(block.timestamp));
      }

      const deltas = [];
      for (const ev of mintEvents) {
        deltas.push({
          timestamp: blockTimestamps.get(Number(ev.blockNumber)),
          amount: BigInt(ev.returnValues.value),
        });
      }
      for (const ev of retireEvents) {
        deltas.push({
          timestamp: blockTimestamps.get(Number(ev.blockNumber)),
          amount: -BigInt(ev.returnValues.amount),
        });
      }
      deltas.sort((a, b) => a.timestamp - b.timestamp);

      const dailyMap = new Map();
      let running = 0n;
      for (const d of deltas) {
        running += d.amount;
        const dateLabel = new Date(d.timestamp * 1000).toLocaleDateString();
        dailyMap.set(dateLabel, running);
      }

      const labels = Array.from(dailyMap.keys());
      const values = Array.from(dailyMap.values()).map((v) => Number(v));

      const ctxLiquidity = document.getElementById("liquidityChart");
      if (ctxLiquidity) {
        if (dashChartLiquidity) dashChartLiquidity.destroy();

        if (labels.length === 0) {
        } else {
          dashChartLiquidity = new Chart(ctxLiquidity, {
            type: "line",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Circulating Supply",
                  data: values,
                  borderColor: "#4318ff",
                  backgroundColor: "rgba(67, 24, 255, 0.1)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
              },
            },
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load liquidity trend:", e);
    }
    try {
      if (!contracts) contracts = await ensureContractsReady();

      const txCurrentBlock = Number(await web3.eth.getBlockNumber());
      const TX_CHUNK_SIZE = 9000;
      let txFromBlock = CARBON_TOKEN_DEPLOYMENT_BLOCK;
      let purchaseEventsAll = [];

      while (txFromBlock <= txCurrentBlock) {
        const txToBlock = Math.min(txFromBlock + TX_CHUNK_SIZE - 1, txCurrentBlock);
        const chunk = await contracts.carbonToken.getPastEvents("TokensPurchased", {
          fromBlock: txFromBlock,
          toBlock: txToBlock,
        });
        purchaseEventsAll = purchaseEventsAll.concat(chunk);
        txFromBlock = txToBlock + 1;
      }

      const txBlockNumbers = new Set(purchaseEventsAll.map((e) => Number(e.blockNumber)));
      const txBlockTimestamps = new Map();
      for (const bn of txBlockNumbers) {
        const block = await web3.eth.getBlock(bn);
        txBlockTimestamps.set(bn, Number(block.timestamp));
      }

      const dailyVolume = new Map();
      for (const ev of purchaseEventsAll) {
        const ts = txBlockTimestamps.get(Number(ev.blockNumber));
        const dateLabel = new Date(ts * 1000).toLocaleDateString();
        const prev = dailyVolume.get(dateLabel) || 0n;
        dailyVolume.set(dateLabel, prev + BigInt(ev.returnValues.amount));
      }

      const txLabels = Array.from(dailyVolume.keys());
      const txValues = Array.from(dailyVolume.values()).map((v) => Number(v));

      const ctxTx = document.getElementById("txChart");
      if (ctxTx) {
        if (dashChartTx) dashChartTx.destroy();

        if (txLabels.length > 0) {
          dashChartTx = new Chart(ctxTx, {
            type: "bar",
            data: {
              labels: txLabels,
              datasets: [
                {
                  label: "Tokens Purchased",
                  data: txValues,
                  backgroundColor: "#4318ff",
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
              },
            },
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load recent transaction volume:", e);
    }

    try {
      if (!contracts) contracts = await ensureContractsReady();
      await web3.eth.getBlockNumber();

      const healthEl = document.getElementById("dash-node-health");
      const healthBar = document.getElementById("node-health-bar");
      if (healthEl) healthEl.innerText = "Operational";
      if (healthBar) {
        healthBar.style.width = "100%";
        healthBar.style.background = "#05cd99";
      }
    } catch (e) {
      const healthEl = document.getElementById("dash-node-health");
      const healthBar = document.getElementById("node-health-bar");
      if (healthEl) healthEl.innerText = "Offline";
      if (healthBar) {
        healthBar.style.width = "10%";
        healthBar.style.background = "#e53e3e";
      }
    }
  } catch (error) {
    console.error("Failed to load real Dashboard data:", error);
  }
};

window.switchDashTab = function (tabName) {
  document.getElementById("dash-section-market").style.display = "none";
  document.getElementById("dash-section-queue").style.display = "none";
  document.getElementById("dash-section-eco").style.display = "none";

  document.getElementById("dash-btn-market").classList.remove("active");
  document.getElementById("dash-btn-queue").classList.remove("active");
  document.getElementById("dash-btn-eco").classList.remove("active");

  document.getElementById(`dash-section-${tabName}`).style.display = "block";
  document.getElementById(`dash-btn-${tabName}`).classList.add("active");
};

window.openProfileModal = async function () {
  document.getElementById("profileModal").classList.add("show");

  const currentWallet =
    localStorage.getItem("loggedInWallet") ||
    (await getConnectedWallet());

  if (!currentWallet) {
    document.getElementById("prof-val-user").innerText = "⚠️ Please connect MetaMask to log in first";
    document.getElementById("prof-val-wallet").innerText = "-";
    document.getElementById("prof-val-role").innerText = "-";
    document.getElementById("prof-val-status").innerText = "-";
    document.getElementById("prof-val-date").innerText = "-";
    return;
  }

  document.getElementById("prof-val-wallet").innerText = currentWallet;

  try {
    let response = await fetch(
      `${SERVER_URL}/user-profile?walletAddress=${currentWallet}&t=${new Date().getTime()}`,
    );
    let result = await response.json();

    if (result.success) {
      let u = result.data;

      localStorage.setItem("loggedInUser", u.username);

      document.getElementById("prof-val-user").innerText = u.username;
      document.getElementById("prof-val-role").innerText = u.role || "Not Set";
      document.getElementById("prof-val-email").innerText = u.email || "Not Set";
      document.getElementById("prof-val-phone").innerText = u.phone || "Not Set";
      document.getElementById("prof-val-status").innerText = u.status;
      document.getElementById("prof-val-date").innerText = u.createdAt ? u.createdAt : "N/A";

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

      document.getElementById("prof-input-email").value = u.email || "";
      document.getElementById("prof-input-phone").value = u.phone || "";

      const savedAvatar = localStorage.getItem(`avatar_${u.username}`);
      if (savedAvatar) {
        document.getElementById("avatarIcon").style.display = "none";
        document.getElementById("avatarPreview").style.backgroundImage = `url(${savedAvatar})`;
      } else {
        document.getElementById("avatarIcon").style.display = "block";
        document.getElementById("avatarPreview").style.backgroundImage = "none";
      }
    } else {
      document.getElementById("prof-val-user").innerText = "Admin (Owner)";
      document.getElementById("prof-val-role").innerText = "admin";
      document.getElementById("prof-val-status").innerText = "-";
      document.getElementById("prof-val-date").innerText = "-";
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    document.getElementById("prof-val-user").innerText = "🚨 Network request failed";
  }
};

window.closeProfileModal = function () {
  document.getElementById("profileModal").classList.remove("show");
};


window.handleLogout = function () {
  if (!confirm("Confirm Logout?")) {
    return;
  }

  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("loggedInWallet");

  currentAccount = null;

  switchRole("guest");
  navTo("loginPage", "Welcome Back");
};


window.handleUpdateProfile = async function () {
  let email = document.getElementById("prof-input-email").value;
  let phone = document.getElementById("prof-input-phone").value;
  const currentUser = localStorage.getItem("loggedInUser");

  if (!currentUser) {
    return;
  }

  try {
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
      if (window.pendingAvatarUpdate) {
        localStorage.setItem(
          `avatar_${currentUser}`,
          window.pendingAvatarUpdate,
        );
        window.pendingAvatarUpdate = null;
      }
      syncGlobalAvatar();


      closeProfileModal();
      setTimeout(() => openProfileModal(), 300);
    }
  } catch (error) {
    console.error(error);
  }
};

window.previewAvatar = function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatarBase64 = e.target.result;
      document.getElementById("avatarIcon").style.display = "none";
      document.getElementById("avatarPreview").style.backgroundImage =
        `url(${avatarBase64})`;

      window.pendingAvatarUpdate = avatarBase64;
    };
    reader.readAsDataURL(file);
  }
};

window.syncGlobalAvatar = function () {
  const currentUser = localStorage.getItem("loggedInUser");
  const globalBtn = document.getElementById("globalAvatarBtn");
  const globalIcon = document.getElementById("globalAvatarIcon");

  if (!globalBtn || !globalIcon) return;

  if (currentUser) {
    const savedAvatar = localStorage.getItem(`avatar_${currentUser}`);
    if (savedAvatar) {
      globalBtn.style.backgroundImage = `url(${savedAvatar})`;
      globalIcon.style.display = "none";
      return;
    }
  }

  globalBtn.style.backgroundImage = "none";
  globalIcon.style.display = "block";
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(syncGlobalAvatar, 500);
});

window.toggleSidebar = function () {
  const sidebar = document.getElementById("mainSidebar");
  const mainContent = document.getElementById("mainContent");
  const headerBtn = document.getElementById("headerSidebarBtn");

  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");

  if (sidebar.classList.contains("collapsed")) {
    headerBtn.style.display = "block";
  } else {
    headerBtn.style.display = "none";
  }
};

window.loadMyProjects = async function () {
  const tbody = document.getElementById("myProjectsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align: center; padding: 30px; color: #a3aed1;">
        Loading...
      </td>
    </tr>
  `;

  try {
    const devAddress = await ensureWalletConnected();

    if (!devAddress) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 30px; color: #ee5d50;">
            Please connect MetaMask first.
          </td>
        </tr>
      `;
      return;
    }

    const res = await fetch(
      `${SERVER_URL}/my-projects?devAddress=${encodeURIComponent(devAddress)}`
    );

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to load projects.");
    }

    let myProjects = result.data || [];

    const contracts = await ensureContractsReady();
    const registry = contracts.projectRegistry;

    const allChainProjects =
      await registry.methods.getAllProjects().call();

    const myChainProjects = allChainProjects.filter(
      (p) =>
        p.developer &&
        p.developer.toLowerCase() === devAddress.toLowerCase()
    );

    console.log("📦 DB projects:", myProjects);
    console.log("⛓️ My on-chain projects:", myChainProjects);

    myProjects = myProjects.map((dbProject) => {
      const chainProject = myChainProjects.find(
        (cp) =>
          String(cp.projectID) ===
          String(dbProject.onChainProjectID)
      );

      if (!chainProject) {
        return dbProject;
      }

      return {
        ...dbProject,

        onChainProjectID: String(chainProject.projectID),
        projName: chainProject.projectName || dbProject.projName,
        location: chainProject.location || dbProject.location,
        ecosystemType:
          chainProject.ecosystemType || dbProject.ecosystemType,

        carbonVolume:
          chainProject.carbonVolume?.toString() ||
          dbProject.carbonVolume,

        status: dbProject.status,

        minted: dbProject.minted
      };
    });

    const needsFix = myProjects.filter(
      (p) => !p.onChainProjectID
    );

    if (needsFix.length > 0) {
      needsFix.forEach((dbProject) => {
        const match = myChainProjects.find(
          (cp) =>
            cp.projectName === dbProject.projName &&
            cp.developer &&
            cp.developer.toLowerCase() === devAddress.toLowerCase()
        );

        if (match) {
          dbProject.onChainProjectID =
            String(match.projectID);

          fetch(`${SERVER_URL}/sync-onchain-id`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              id: dbProject.id,
              onChainProjectID: String(match.projectID)
            })
          }).catch((e) => {
            console.warn(
              "Failed to sync on-chain project ID:",
              e
            );
          });
        }
      });
    }

    tbody.innerHTML = "";

    if (myProjects.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4"
              style="text-align: center; padding: 30px; color: #a3aed1;">
            No projects found. Go to "Submit Project" to create one! 🌱
          </td>
        </tr>
      `;
      return;
    }

    myProjects.forEach((p) => {
      let statusHtml = "";

      if (p.status === "approved" && !p.minted) {
        statusHtml = `
          <span style="
            background: #e6f9f0;
            color: #05cd99;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
          ">
            ✅ Approved
          </span>

          <button
            type="button"
            class="primary-btn"
            style="
              padding: 4px 10px;
              font-size: 11px;
              background-color: #4318ff;
              margin-left: 5px;
            "
            ${!p.onChainProjectID
            ? "disabled title='Still syncing on-chain ID, refresh in a moment'"
            : ""
          }
            onclick="
              event.stopPropagation();
              mintProjectToken(${p.id}, ${p.onChainProjectID})
            "
          >
            ⛏️ Mint
          </button>
        `;
      } else if (p.status === "approved" && p.minted) {
        statusHtml = `
          <span style="
            background: #e9edf7;
            color: #4318ff;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
          ">
            🌊 Minted
          </span>
        `;
      } else if (p.status === "rejected") {
        statusHtml = `
          <span style="
            background: #fce8e6;
            color: #ee5d50;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
          ">
            ❌ Rejected
          </span>
        `;
      } else {
        statusHtml = `
          <span style="
            background: #fff0d4;
            color: #ff9800;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
          ">
            ⏳ Pending
          </span>
        `;
      }

      const tr = document.createElement("tr");

      tr.style.borderBottom = "1px solid #f4f7fe";
      tr.style.cursor = "pointer";

      tr.onmouseover = () => {
        tr.style.background = "#f8fafc";
      };

      tr.onmouseout = () => {
        tr.style.background = "transparent";
      };

      tr.onclick = () => {
        if (p.onChainProjectID) {
          openProjectModal(p.onChainProjectID);
        }
      };

      tr.innerHTML = `
        <td style="padding: 15px 12px;">
          <div style="
            font-weight: 700;
            color: #2b3674;
            font-size: 14px;
          ">
            ${p.projName || "Unnamed Project"}
          </div>

          <div style="
            font-size: 12px;
            color: #a3aed1;
            margin-top: 4px;
          ">
            ID: #${p.onChainProjectID || p.id}
          </div>
        </td>

        <td style="padding: 15px 12px;">
          <div style="
            font-size: 13px;
            color: #2b3674;
          ">
            ${p.location || "Unknown"}
          </div>

          <div style="
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          ">
            ${p.ecosystemType || "Unknown"}
          </div>
        </td>

        <td style="
          padding: 15px 12px;
          font-weight: bold;
          color: #4318ff;
          font-size: 15px;
        ">
          ${p.carbonVolume || 0}
        </td>

        <td style="padding: 15px 12px;">
          ${statusHtml}
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error(
      "Failed to load my projects:",
      error
    );

    tbody.innerHTML = `
      <tr>
        <td colspan="4"
            style="text-align: center; padding: 30px; color: #ee5d50;">
          Loading failed: ${error.message || error}
        </td>
      </tr>
    `;
  }
};


let devPipelineChartInstance = null;
let devDashboardRequestId = 0;

window.loadDevDashboard = async function () {
  const requestId = ++devDashboardRequestId;

  const currentUser = localStorage.getItem("loggedInWallet");
  if (!currentUser) return;

  const banner = document.getElementById("devActionBanner");
  const bannerText = document.getElementById("devActionText");
  const bannerCta = document.getElementById("devActionCta");
  const salesFeedList = document.getElementById("devSalesFeedList");

  let myDbProjects = [];
  try {
    const res = await fetch(
      `${SERVER_URL}/my-projects?devAddress=${encodeURIComponent(currentUser)}`
    );
    const result = await res.json();
    if (result.success) myDbProjects = result.data;
  } catch (error) {
    console.error("Failed to load My Projects from DB:", error);
  }

  if (requestId !== devDashboardRequestId) return;

  const totalProjects = myDbProjects.length;
  const pendingCount = myDbProjects.filter((p) => p.status === "pending").length;
  const approvedCount = myDbProjects.filter((p) => p.status === "approved").length;
  const rejectedCount = myDbProjects.filter((p) => p.status === "rejected").length;
  const awaitingMint = myDbProjects.filter((p) => p.status === "approved" && !p.minted);

  document.getElementById("dev-total-projects").innerText = totalProjects;
  document.getElementById("dev-pipe-pending").innerText = pendingCount;
  document.getElementById("dev-pipe-approved").innerText = approvedCount;
  document.getElementById("dev-pipe-rejected").innerText = rejectedCount;

  if (awaitingMint.length > 0) {
    banner.classList.remove("no-action");
    bannerText.innerHTML = `⚠️ You have <strong>${awaitingMint.length}</strong> project(s) approved by Admin! Click here to pay gas and mint your BCC tokens.`;
    bannerCta.innerText = "Go Mint →";
  } else {
    banner.classList.add("no-action");
    bannerText.innerText = "No pending mint tasks right now, all approved projects have been minted.";
    bannerCta.innerText = "";
  }

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

  try {
    const devAddress = await ensureWalletConnected();
    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;
    const carbonToken = contracts.carbonToken;

    const allChainProjects = await registry.methods.getAllProjects().call();
    const myChainProjects = allChainProjects.filter(
      (p) => p.developer && p.developer.toLowerCase() === devAddress.toLowerCase()
    );

    if (requestId !== devDashboardRequestId) return;

    const projectNameMap = {};
    myChainProjects.forEach((p) => {
      projectNameMap[p.projectID.toString()] = p.projectName;
    });

    let availableQuota = 0n;
    for (const p of myChainProjects) {
      try {
        const bal = await carbonToken.methods.balanceOf(devAddress, p.projectID).call();
        availableQuota += BigInt(bal);
      } catch (e) {
        console.warn("Failed to read project balance:", p.projectID, e);
      }
    }

    if (requestId !== devDashboardRequestId) return;
    document.getElementById("dev-available-quota").innerText = availableQuota.toString();

    let totalSold = 0n;
    let totalRevenueWei = 0n;
    let salesEvents = [];
    let salesFetchFailed = false;

    try {
      const currentBlock = Number(await web3.eth.getBlockNumber());
      const CHUNK_SIZE = 9000;
      let fromBlock = CARBON_TOKEN_DEPLOYMENT_BLOCK;
      let purchaseEvents = [];

      while (fromBlock <= currentBlock) {
        const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
        const chunkEvents = await carbonToken.getPastEvents("TokensPurchased", {
          filter: { developer: devAddress },
          fromBlock,
          toBlock,
        });
        purchaseEvents = purchaseEvents.concat(chunkEvents);
        fromBlock = toBlock + 1;
      }

      for (const ev of purchaseEvents) {
        totalSold += BigInt(ev.returnValues.amount);
        totalRevenueWei += BigInt(ev.returnValues.totalPrice);
      }

      salesEvents = purchaseEvents;
    } catch (e) {
      console.warn("Failed to read sales events:", e);
      salesFetchFailed = true;
    }

    if (requestId !== devDashboardRequestId) return;

    document.getElementById("dev-total-sold").innerText = salesFetchFailed ? "-" : totalSold.toString();
    document.getElementById("dev-revenue").innerText = salesFetchFailed
      ? "-"
      : Web3.utils.fromWei(totalRevenueWei.toString(), "ether") + " ETH";

    document.getElementById("dev-total-minted").innerText = salesFetchFailed
      ? "-"
      : (availableQuota + totalSold).toLocaleString();

    salesEvents.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
    const recentSales = salesEvents.slice(0, 5);

    if (recentSales.length === 0) {
      if (requestId !== devDashboardRequestId) return;
      salesFeedList.innerHTML = salesFetchFailed
        ? `<div style="text-align: center; color: #a3aed1; padding: 30px 0; font-size: 13px;">Failed to load sales data, please refresh.</div>`
        : `<div style="text-align: center; color: #a3aed1; padding: 30px 0; font-size: 13px;">No sales records yet.</div>`;
    } else {
      let rowsHtml = "";
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

        rowsHtml += `
          <div class="sales-feed-item">
            <div>
              <div style="font-weight: 700; color: #2b3674;">${buyerShort}</div>
              <div style="color: #a3aed1; font-size: 11px; margin-top: 2px;">${projName} · ${dateDisplay}</div>
            </div>
            <div style="font-weight: 800; color: #05cd99;">+${ev.returnValues.amount} BCC</div>
          </div>
        `;
      }

      if (requestId !== devDashboardRequestId) return;
      salesFeedList.innerHTML = rowsHtml;
    }
  } catch (error) {
    console.warn("Failed to load on-chain data (possibly not connected to a wallet):", error);
    if (requestId !== devDashboardRequestId) return;
    salesFeedList.innerHTML = `<div style="text-align: center; color: #a3aed1; padding: 30px 0; font-size: 13px;">🦊 Please connect MetaMask first to view real quota and sales data.</div>`;
    document.getElementById("dev-available-quota").innerText = "-";
    document.getElementById("dev-total-sold").innerText = "-";
    document.getElementById("dev-revenue").innerText = "-";
    document.getElementById("dev-total-minted").innerText = "-";
  }
};

let projectModalRequestId = 0;

window.openProjectModal = async function (onChainProjectID) {
  const requestId = ++projectModalRequestId;
  onChainProjectID = String(onChainProjectID).split(".")[0];
  try {
    const contracts = await ensureContractsReady();

    const p = await contracts.projectRegistry.methods.projects(onChainProjectID).call();

    if (requestId !== projectModalRequestId) return;

    document.getElementById("det-title").innerText = p.projectName || "Unnamed Project";
    document.getElementById("det-loc").innerText = p.location || "Unknown";
    document.getElementById("det-cap").innerText = "-";

    const tbody = document.getElementById("det-sales-body");
    tbody.innerHTML = "";

    if (!p.minted) {
      document.getElementById("det-total").innerText = "-";
      document.getElementById("det-avail").innerText = "-";
      document.getElementById("det-sold").innerText = "-";
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 15px; color: #a3aed1;">Project not minted yet, no on-chain sales data available.</td></tr>`;
      document.getElementById("projectDetailModal").classList.add("show");
      return;
    }

    const devAddress = p.developer;
    const devBalance = await contracts.carbonToken.methods.balanceOf(devAddress, onChainProjectID).call();

    if (requestId !== projectModalRequestId) return;

    const currentBlock = Number(await web3.eth.getBlockNumber());
    const CHUNK_SIZE = 9000;
    let purchaseEvents = [];
    let fromBlock = CARBON_TOKEN_DEPLOYMENT_BLOCK;

    while (fromBlock <= currentBlock) {
      const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
      const chunkEvents = await contracts.carbonToken.getPastEvents("TokensPurchased", {
        filter: { projectID: onChainProjectID },
        fromBlock,
        toBlock,
      });
      purchaseEvents = purchaseEvents.concat(chunkEvents);
      fromBlock = toBlock + 1;
    }

    if (requestId !== projectModalRequestId) return;

    let totalSold = 0n;
    for (const ev of purchaseEvents) {
      totalSold += BigInt(ev.returnValues.amount);
    }

    const totalGenerated = BigInt(devBalance) + totalSold;

    document.getElementById("det-total").innerText = totalGenerated.toString();
    document.getElementById("det-avail").innerText = devBalance;
    document.getElementById("det-sold").innerText = totalSold.toString();

    if (purchaseEvents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 15px; color: #a3aed1;">No purchases yet.</td></tr>`;
    } else {
      let rowsHtml = "";
      for (const ev of purchaseEvents) {
        let dateDisplay = "N/A";
        try {
          const block = await web3.eth.getBlock(ev.blockNumber);
          dateDisplay = new Date(Number(block.timestamp) * 1000).toLocaleDateString();
        } catch (e) { }

        const buyerShort = `${ev.returnValues.buyer.substring(0, 6)}...${ev.returnValues.buyer.substring(38)}`;

        rowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; color: #64748b;">${dateDisplay}</td>
            <td style="padding: 10px; font-weight: bold; color: #2b3674;">${buyerShort}</td>
            <td style="padding: 10px; text-align: right; color: #ff9800; font-weight: bold;">+${ev.returnValues.amount}</td>
          </tr>
        `;
      }

      if (requestId !== projectModalRequestId) return;
      tbody.innerHTML = rowsHtml;
    }

    document.getElementById("projectDetailModal").classList.add("show");
  } catch (error) {
    console.error("Failed to open project details:", error);
    alert("Failed to load project details: " + (error.message || error));
  }
};

window.closeProjectModal = function () {
  document.getElementById("projectDetailModal").classList.remove("show");
};

window.mintProjectToken = async function (dbId, onChainProjectID) {
  try {
    const devAddress = await ensureWalletConnected();
    const contracts = await ensureContractsReady();

    const project = await contracts.projectRegistry.methods.projects(onChainProjectID).call();
    if (project.minted) {
      alert("✅ This project has already been minted.");
      return;
    }

    await contracts.carbonToken.methods
      .mintTokens(onChainProjectID)
      .send({ from: devAddress, gas: 500000 });

    await fetch(`${SERVER_URL}/mark-project-minted`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dbId, onChainProjectID })
    });

    alert("✅ Mint successful!");
    loadMyProjects();
  } catch (error) {
    console.error("Mint failed:", error);
    alert("❌ Mint failed: " + (error.message || error));
  }
};

function isBuyerRole(role) {
  return Number(role) === 1;
}

async function ensureWalletConnected() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed.");
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (chainId.toLowerCase() !== "0xaa36a7") {
    throw new Error("Please switch MetaMask to Sepolia Test Network.");
  }

  let accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  if (!accounts || accounts.length === 0) {
    accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet connected.");
  }

  currentAccount = accounts[0];

  if (!web3) {
    web3 = new Web3(window.ethereum);
  }

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


    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    console.log("ProjectRegistry address:", PROJECT_REGISTRY_ADDRESS);


    const code = await web3.eth.getCode(PROJECT_REGISTRY_ADDRESS);

    console.log("ProjectRegistry bytecode:", code);

    if (!code || code === "0x") {
      throw new Error(
        "No contract found at PROJECT_REGISTRY_ADDRESS. Check MetaMask network and contract address.",
      );
    }


    let projects = [];

    try {
      projects = await registry.methods.getAllProjects().call();

      projects = projects.filter(
        (project) => Number(project.status) === 1
      );
      console.log("getAllProjects() result:", projects);
    } catch (error) {
      console.warn("getAllProjects() failed:", error);

      throw new Error(
        "ProjectRegistry contract/ABI mismatch. Check that the deployed contract matches your current Solidity code.",
      );
    }


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


    const amountInput = document.getElementById(`marketAmount-${projectID}`);

    if (!amountInput) {
      throw new Error("Amount input not found.");
    }

    const amount = amountInput.value.trim();

    if (!amount || !/^\d+$/.test(amount) || BigInt(amount) <= 0n) {
      throw new Error("Please enter a valid whole number of BCC.");
    }


    const buyerAddress = await ensureBuyerWallet();



    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;



    const project = await registry.methods.projects(projectID).call();

    if (!project || Number(project.projectID) === 0) {
      throw new Error("Project does not exist.");
    }


    const minted = await registry.methods.isMinted(projectID).call();

    if (!minted) {
      throw new Error("This project has not been minted yet.");
    }


    const capacity = await registry.methods.getCapacity(projectID).call();

    if (BigInt(amount) > BigInt(capacity)) {
      throw new Error(`Only ${capacity} BCC are available.`);
    }


    const pricePerToken = await registry.methods
      .getPricePerToken(projectID)
      .call();

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



    const confirmed = window.confirm(
      `Buy ${amount} BCC from "${project.projectName}" for ${totalEth} ETH?`,
    );

    if (!confirmed) {
      return;
    }



    console.log("Waiting for MetaMask confirmation...");

    const receipt = await carbonToken.methods
      .purchaseCredits(projectID, amount)
      .send({
        from: buyerAddress,
        value: totalPrice.toString(),
      });

    console.log("========== PURCHASE SUCCESS ==========");

    console.log("Transaction:", receipt.transactionHash);

    alert(
      `✅ Purchase successful!\n\n` +
      `${amount} BCC purchased\n` +
      `Total paid: ${totalEth} ETH`,
    );


    await loadMarketplace();


    if (typeof loadBuyerPortfolio === "function") {
      await loadBuyerPortfolio();
    }


    if (typeof loadBuyerTransactions === "function") {
      await loadBuyerTransactions();
    }
  } catch (error) {
    console.error("========== BCC PURCHASE FAILED ==========");

    console.error(error);

    let message = error?.message || String(error);

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


    const buyerAddress = await ensureBuyerWallet();

    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;

    console.log("Loading portfolio for:", buyerAddress);


    const projects = await registry.methods.getAllProjects().call();

    const transactions = await syncBuyerTransactionEvents(
      carbonToken,
      buyerAddress
    );

    console.log("Portfolio blockchain projects:", projects);

    tbody.innerHTML = "";
    let totalBalance = 0n;
    let totalTransferredOut = 0n;
    let totalRetired = 0n;
    let totalValueWei = 0n;
    let ownedProjects = 0;



    for (const project of projects) {
      const projectID = project.projectID;

      if (!projectID || Number(projectID) === 0) {
        continue;
      }


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

      let retired;

      try {
        retired = await carbonToken.methods
          .retired(buyerAddress, projectID)
          .call();
      } catch (error) {
        console.error(
          `Unable to read retired amount for project #${projectID}`,
          error
        );

        retired = "0";
      }
      const projectTransferredOut = transactions
        .filter(
          tx =>
            tx.type === "Transfer Sent" &&
            tx.projectID.toString() === projectID.toString()
        )
        .reduce(
          (total, tx) => total + BigInt(tx.amount),
          0n
        );

      if (
        BigInt(balance) === 0n &&
        BigInt(retired) === 0n &&
        projectTransferredOut === 0n
      ) {
        continue;
      }

      ownedProjects++;


      const projectName = project.projectName || `Project #${projectID}`;

      const location = project.location || "Unknown";

      const ecosystem = project.ecosystemType || "Unknown";

      const pricePerToken = BigInt(project.pricePerToken);

      const buyerBalance = BigInt(balance);

      const projectValue = buyerBalance * pricePerToken;

      const buyerRetired = BigInt(retired);

      totalBalance += buyerBalance;
      totalTransferredOut += projectTransferredOut;
      totalRetired += buyerRetired;



      totalValueWei += projectValue;

      const totalElement = document.getElementById("totalBccHolding");

      if (totalElement) {
        totalElement.textContent = totalBalance.toString();
      }


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
    color: #ff9f43;
">
    ${projectTransferredOut.toString()}
    BCC
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
    color: #ee5d50;
">

    ${buyerRetired.toString()}
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

    const retiredElement =
      document.getElementById("totalBccRetired");

    if (retiredElement) {
      retiredElement.textContent =
        totalRetired.toString();
    }


    if (ownedProjects === 0) {
      tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            text-align: center;
                            padding: 50px;
                            color: #a3aed1;
                        "
                    >
                        🌱 No BCC holdings or retirement history yet..
                        <br><br>

                    </td>
                </tr>
            `;

      return;
    }


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

window.loadTransferProjects = async function () {

  const select =
    document.getElementById("transferProjectSelect");

  if (!select) {
    return;
  }

  try {

    const buyerAddress =
      await ensureBuyerWallet();

    const contracts =
      await ensureContractsReady();

    const registry =
      contracts.projectRegistry;

    const carbonToken =
      contracts.carbonToken;

    const projects =
      await registry.methods
        .getAllProjects()
        .call();

    select.innerHTML = `
            <option value="">
                Select a project
            </option>
        `;

    for (const project of projects) {

      const projectID =
        project.projectID;

      if (
        !projectID ||
        Number(projectID) === 0
      ) {
        continue;
      }

      const balance =
        await carbonToken.methods
          .balanceOf(
            buyerAddress,
            projectID
          )
          .call();

      if (BigInt(balance) === 0n) {
        continue;
      }

      const option =
        document.createElement("option");

      option.value = projectID;

      option.textContent =
        `${project.projectName || "Project #" + projectID} — ${balance} BCC`;

      select.appendChild(option);
    }

    if (select.options.length === 1) {

      const option =
        document.createElement("option");

      option.disabled = true;

      option.textContent =
        "No BCC available to transfer";

      select.appendChild(option);
    }

  } catch (error) {

    console.error(
      "Unable to load transfer projects:",
      error
    );

    select.innerHTML = `
            <option value="">
                Unable to load projects
            </option>
        `;
  }
};

window.transferBuyerCredits = async function () {

  try {


    const recipientInput =
      document.getElementById(
        "transferRecipient"
      );

    const projectSelect =
      document.getElementById(
        "transferProjectSelect"
      );

    const amountInput =
      document.getElementById(
        "transferAmount"
      );

    if (
      !recipientInput ||
      !projectSelect ||
      !amountInput
    ) {
      throw new Error(
        "Transfer form not found."
      );
    }

    const recipient =
      recipientInput.value.trim();

    const projectID =
      projectSelect.value;

    const amount =
      amountInput.value.trim();



    if (!recipient) {

      throw new Error(
        "Please enter the recipient wallet address."
      );
    }

    if (!web3.utils.isAddress(recipient)) {

      throw new Error(
        "Invalid recipient wallet address."
      );
    }


    if (!projectID) {

      throw new Error(
        "Please select a project."
      );
    }

    if (
      !amount ||
      !/^\d+$/.test(amount) ||
      BigInt(amount) <= 0n
    ) {

      throw new Error(
        "Please enter a valid whole number of BCC."
      );
    }



    const buyerAddress =
      await ensureBuyerWallet();



    if (
      recipient.toLowerCase() ===
      buyerAddress.toLowerCase()
    ) {

      throw new Error(
        "You cannot transfer BCC to yourself."
      );
    }



    const contracts =
      await ensureContractsReady();

    const carbonToken =
      contracts.carbonToken;

    const userRegistry =
      contracts.userRegistry;



    const recipientRole =
      await userRegistry.methods
        .getUserRole(recipient)
        .call();

    if (Number(recipientRole) !== 1) {

      throw new Error(
        "Recipient is not a registered buyer."
      );
    }



    const balance =
      await carbonToken.methods
        .balanceOf(
          buyerAddress,
          projectID
        )
        .call();

    if (BigInt(amount) > BigInt(balance)) {

      throw new Error(
        `You only have ${balance} BCC available for this project.`
      );
    }


    const confirmed =
      window.confirm(
        `Transfer ${amount} BCC?\n\n` +
        `Recipient:\n${recipient}\n\n` +
        `Project ID: ${projectID}\n\n` +
        `This transfer will be recorded on the blockchain.`
      );

    if (!confirmed) {
      return;
    }


    console.log(
      "Transferring BCC:",
      {
        from: buyerAddress,
        to: recipient,
        projectID: projectID,
        amount: amount
      }
    );

    const receipt =
      await carbonToken.methods
        .transfer(
          projectID,
          recipient,
          amount
        )
        .send({
          from: buyerAddress
        });



    console.log(
      "BCC transfer successful:",
      receipt.transactionHash
    );

    alert(
      `✅ Transfer successful!\n\n` +
      `${amount} BCC transferred.`
    );


    recipientInput.value = "";
    amountInput.value = "";



    if (
      typeof loadBuyerPortfolio ===
      "function"
    ) {

      await loadBuyerPortfolio();
    }


    await loadTransferProjects();

  } catch (error) {

    console.error(
      "BCC transfer failed:",
      error
    );

    if (error.code === 4001) {

      alert(
        "Transaction was rejected in MetaMask."
      );

      return;
    }

    alert(
      "❌ Transfer failed:\n\n" +
      (error.message || error)
    );
  }
};

window.loadOffsetProjects = async function () {
  let totalRetirableBCC = 0n;

  const select = document.getElementById("offsetProjectSelect");

  if (!select) {
    return;
  }

  try {

    const buyerAddress = await ensureBuyerWallet();


    const contracts = await ensureContractsReady();

    const registry = contracts.projectRegistry;

    const carbonToken = contracts.carbonToken;



    const projects = await registry.methods.getAllProjects().call();

    select.innerHTML = `
            <option value="">
                Select a project
            </option>
        `;



    for (const project of projects) {
      const projectID = project.projectID;

      if (!projectID || Number(projectID) === 0) {
        continue;
      }

      const balance = await carbonToken.methods
        .balanceOf(buyerAddress, projectID)
        .call();

      totalRetirableBCC += BigInt(balance);

      if (BigInt(balance) === 0n) {
        continue;
      }

      const option = document.createElement("option");

      option.value = projectID;

      option.textContent = `${project.projectName || "Project #" + projectID
        } — ${balance} BCC`;

      select.appendChild(option);
    }

    const totalBalanceEl = document.getElementById("offsetTotalBalance");

    if (totalBalanceEl) {
      totalBalanceEl.innerText =
        totalRetirableBCC.toLocaleString();
    }



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

window.loadRetirementHistory = async function () {

  const tbody =
    document.getElementById("retirementHistoryBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
        <tr>
            <td colspan="3"
                style="
                    text-align: center;
                    padding: 30px;
                    color: #a3aed1;
                ">
                Loading retirement history...
            </td>
        </tr>
    `;

  try {



    const buyerAddress =
      await ensureBuyerWallet();



    const contracts =
      await ensureContractsReady();

    const carbonToken =
      contracts.carbonToken;

    const registry =
      contracts.projectRegistry;


    const projects =
      await registry.methods
        .getAllProjects()
        .call();

    tbody.innerHTML = "";

    let hasHistory = false;

    for (const project of projects) {

      const projectID =
        project.projectID;

      if (!projectID || Number(projectID) === 0) {
        continue;
      }

      let retiredAmount;

      try {

        retiredAmount =
          await carbonToken.methods
            .retired(
              buyerAddress,
              projectID
            )
            .call();

      } catch (error) {

        console.error(
          `Unable to read retired amount for project #${projectID}`,
          error
        );

        continue;
      }

      if (BigInt(retiredAmount) === 0n) {
        continue;
      }

      hasHistory = true;

      const projectName =
        project.projectName ||
        `Project #${projectID}`;



      const row =
        document.createElement("tr");

      row.style.borderBottom =
        "1px solid #f4f7fe";

      row.innerHTML = `
                <td style="
                    padding: 12px;
                    color: #2b3674;
                    font-weight: 600;
                ">
                    ${projectName}

                    <div style="
                        color: #a3aed1;
                        font-size: 11px;
                        margin-top: 3px;
                    ">
                        #${projectID}
                    </div>
                </td>

                <td style="
                    padding: 12px;
                    color: #4318ff;
                    font-weight: 700;
                ">
                    ${BigInt(retiredAmount).toLocaleString()} BCC
                </td>

                <td style="
                    padding: 12px;
                ">
                    <span style="
                        color: #05cd99;
                        font-weight: 600;
                    ">
                        Retired
                    </span>
                </td>
            `;

      tbody.appendChild(row);
    }



    if (!hasHistory) {

      tbody.innerHTML = `
                <tr>
                    <td colspan="3"
                        style="
                            text-align: center;
                            padding: 30px;
                            color: #a3aed1;
                        ">
                        No retirement history yet.
                    </td>
                </tr>
            `;
    }

  } catch (error) {

    console.error(
      "Error loading retirement history:",
      error
    );

    tbody.innerHTML = `
            <tr>
                <td colspan="3"
                    style="
                        text-align: center;
                        padding: 30px;
                        color: #ee5d50;
                    ">
                    Unable to load retirement history.
                    <br><br>
                    <small>
                        ${error.message || error}
                    </small>
                </td>
            </tr>
        `;
  }
};

window.openBuyerTransfer = function () {

  navTo(
    "buyerTransferPage",
    "Transfer BCC"
  );

  setTimeout(async () => {

    await loadTransferProjects();

  }, 100);

};

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

window.retireBuyerCredits = async function () {
  try {

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



    const buyerAddress = await ensureBuyerWallet();



    const contracts = await ensureContractsReady();

    const carbonToken = contracts.carbonToken;

    const registry = contracts.projectRegistry;


    const project = await registry.methods.projects(projectID).call();

    if (!project || Number(project.projectID) === 0) {
      throw new Error("Project does not exist.");
    }

    const balance = await carbonToken.methods
      .balanceOf(buyerAddress, projectID)
      .call();

    if (BigInt(amount) > BigInt(balance)) {
      throw new Error(`You only own ${balance} BCC from this project.`);
    }


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

    const receipt = await carbonToken.methods.retire(projectID, amount).send({
      from: buyerAddress,
    });

    console.log("BCC retirement successful:", receipt.transactionHash);

    alert(
      `✅ Offset successful!\n\n` +
      `${amount} BCC retired from "${project.projectName}".`,
    );


    amountInput.value = "";


    await loadBuyerPortfolio();

    await loadOffsetProjects();

    await loadBuyerTransactions();

    await loadRetirementHistory();
  } catch (error) {
    console.error("BCC retirement failed:", error);

    alert(`❌ Offset failed:\n\n${error.message || error}`);
  }
};



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

    const buyerAddress = await ensureBuyerWallet();
    const contracts = await ensureContractsReady();
    const carbonToken = contracts.carbonToken;
    const registry = contracts.projectRegistry;



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

    if (transactions.length === 0) {
      tbody.innerHTML = `<tr> <td colspan="5" 
            style=" text-align: center; padding: 30px; 
            color: #a3aed1; " > 
            No transactions yet. 
            </td> </tr>`;
      return;
    }


    tbody.innerHTML = "";

    for (const tx of transactions) {
      const project = projectMap[tx.projectID.toString()];
      const projectName = project?.projectName || `Project #${tx.projectID}`;
      const isPurchase =
        tx.type === "Purchase";

      const isRetirement =
        tx.type === "Retirement";

      const isTransferSent =
        tx.type === "Transfer Sent";

      const isTransferReceived =
        tx.type === "Transfer Received";

      let transactionLabel;
      let amountPrefix;

      if (isPurchase) {

        transactionLabel = "Purchase";
        amountPrefix = "+";

      } else if (isRetirement) {

        transactionLabel = "Retirement";
        amountPrefix = "-";

      } else if (isTransferSent) {

        transactionLabel = "Transfer Sent";
        amountPrefix = "-";

      } else if (isTransferReceived) {

        transactionLabel = "Transfer Received";
        amountPrefix = "+";

      } else {

        transactionLabel = tx.type;
        amountPrefix = "";
      }

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
      row.innerHTML = ` 
          <td style=" padding: 15px 12px; 
                color: #64748b; font-size: 12px; white-space: nowrap; ">
              ${dateDisplay}
          </td>
          <td style=" padding: 15px 12px; ">
              <strong style=" color: #2b3674; ">
                  ${projectName}
              </strong>
              <div style=" color: #a3aed1; font-size: 11px; margin-top: 3px; "> Project #${tx.projectID}
              </div>
          </td>
          <td style=" padding: 15px 12px; "> <span
                  style=" display: inline-block; padding: 5px 9px; border-radius: 6px; background: ${isPurchase ? " #eef2ff"
          : "#fff4e5"}; color: ${isPurchase ? "#4318ff" : "#ff9f43"}; font-size: 11px; font-weight:
                  700; "> ${transactionLabel} </span> </td>
          <td style=" padding: 15px 12px; font-weight: 800; color: ${isPurchase ? " #4318ff" : "#e94560"}; "> ${amountPrefix}${amount.toString()} BCC </td> 
          <td style=" padding: 15px 12px; "> <span style=" color: #05cd99; font-weight: 700; font-size: 12px; "> ✓ Completed
              </span>
              <div style=" margin-top: 5px; "> <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank"
                      rel="noopener noreferrer" style=" color: #4318ff; font-size: 11px; text-decoration: none; "> View
                      transaction ↗ </a> </div>
          </td>`;
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

const CARBON_TOKEN_DEPLOYMENT_BLOCK = 11654441;

async function syncBuyerTransactionEvents(carbonToken, buyerAddress) {
  const chainId = Number(await web3.eth.getChainId());

  const currentBlock = Number(await web3.eth.getBlockNumber());

  const TX_SYNC_KEY =
    `bcc_transaction_sync_v2_${chainId}_${CARBON_TOKEN_ADDRESS.toLowerCase()}_${buyerAddress.toLowerCase()}`;


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
  if (savedState.lastSyncedBlock >= currentBlock) {
    console.log("Transaction history already synced.");

    return savedState.events;
  }
  const CHUNK_SIZE = 9000;

  let fromBlock = Math.max(
    Number(savedState.lastSyncedBlock) + 1,
    CARBON_TOKEN_DEPLOYMENT_BLOCK,
  );

  while (fromBlock <= currentBlock) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);

    console.log(`Syncing transaction events: ${fromBlock} → ${toBlock}`);


    const purchaseEvents = await carbonToken.getPastEvents("TokensPurchased", {
      filter: {
        buyer: buyerAddress,
      },

      fromBlock,

      toBlock,
    });

    const purchaseTxHashes = new Set(
      purchaseEvents.map(
        event => event.transactionHash.toLowerCase()
      )
    );

    const retiredEvents = await carbonToken.getPastEvents("TokensRetired", {
      filter: { buyer: buyerAddress, },
      fromBlock,
      toBlock,
    });

    const retirementTxHashes = new Set(
      retiredEvents.map(event =>
        event.transactionHash.toLowerCase()
      )
    );


    const transferSentEvents =
      await carbonToken.getPastEvents("Transfer", {
        filter: {
          from: buyerAddress,
        },

        fromBlock,
        toBlock,
      });

    const transferReceivedEvents =
      await carbonToken.getPastEvents("Transfer", {
        filter: {
          to: buyerAddress,
        },

        fromBlock,
        toBlock,
      });

    const newEvents = [];

    const blockTimestamps = new Map();
    const allEvents = [
      ...purchaseEvents,
      ...retiredEvents,
      ...transferSentEvents,
      ...transferReceivedEvents
    ];

    for (const event of allEvents) {
      const blockNumber = Number(event.blockNumber);
      if (!blockTimestamps.has(blockNumber)) {
        const block = await web3.eth.getBlock(blockNumber);
        blockTimestamps.set(blockNumber, Number(block.timestamp));
      }
    }



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

    for (const event of transferSentEvents) {

      if (
        purchaseTxHashes.has(
          event.transactionHash.toLowerCase()
        )
      ) {
        continue;
      }

      if (retirementTxHashes.has(event.transactionHash.toLowerCase())) {
        continue;
      }

      newEvents.push({
        id:
          `${event.transactionHash}-${event.logIndex}`,

        type:
          "Transfer Sent",

        projectID:
          event.returnValues.projectID,

        amount:
          event.returnValues.value,

        totalPrice:
          "0",

        from:
          event.returnValues.from,

        to:
          event.returnValues.to,

        blockNumber:
          Number(event.blockNumber),

        transactionHash:
          event.transactionHash,

        logIndex:
          Number(event.logIndex),

        status:
          "Completed",

        timestamp:
          blockTimestamps.get(
            Number(event.blockNumber)
          ),
      });
    }



    for (const event of transferReceivedEvents) {

      if (
        event.returnValues.from.toLowerCase() ===
        buyerAddress.toLowerCase()
      ) {
        continue;
      }
      if (
        purchaseTxHashes.has(
          event.transactionHash.toLowerCase()
        )
      ) {
        continue;
      }

      if (retirementTxHashes.has(event.transactionHash.toLowerCase())) {
        continue;
      }

      if (
        event.returnValues.from.toLowerCase() ===
        buyerAddress.toLowerCase()
      ) {
        continue;
      }


      newEvents.push({
        id:
          `${event.transactionHash}-${event.logIndex}`,

        type:
          "Transfer Received",

        projectID:
          event.returnValues.projectID,

        amount:
          event.returnValues.value,

        totalPrice:
          "0",

        from:
          event.returnValues.from,

        to:
          event.returnValues.to,

        blockNumber:
          Number(event.blockNumber),

        transactionHash:
          event.transactionHash,

        logIndex:
          Number(event.logIndex),

        status:
          "Completed",

        timestamp:
          blockTimestamps.get(
            Number(event.blockNumber)
          ),
      });
    }


    const existingIDs = new Set(savedState.events.map((event) => event.id));

    for (const event of newEvents) {
      if (!existingIDs.has(event.id)) {
        savedState.events.push(event);

        existingIDs.add(event.id);
      }
    }

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