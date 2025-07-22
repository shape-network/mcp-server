export const abi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'AttestationExpired', type: 'error' },
  { inputs: [], name: 'ECDSAInvalidSignature', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'length', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 's', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
    type: 'error',
  },
  { inputs: [], name: 'ERC721EnumerableForbiddenBatchMint', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'approver', type: 'address' }],
    name: 'ERC721InvalidApprover',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
    name: 'ERC721InvalidOperator',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'ERC721InvalidOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'receiver', type: 'address' }],
    name: 'ERC721InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'ERC721InvalidSender',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
    type: 'error',
  },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  { inputs: [], name: 'InvalidMedalUID', type: 'error' },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'MedalAlreadyClaimed', type: 'error' },
  { inputs: [], name: 'NoAttestation', type: 'error' },
  { inputs: [], name: 'NonExistentAttestation', type: 'error' },
  { inputs: [], name: 'NonExistentToken', type: 'error' },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  { inputs: [], name: 'NotTheOwner', type: 'error' },
  { inputs: [], name: 'NotTheRevoker', type: 'error' },
  { inputs: [], name: 'NothingToRemove', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  { inputs: [], name: 'StackAlreadyMinted', type: 'error' },
  { inputs: [], name: 'TransfersNotAllowed', type: 'error' },
  { inputs: [], name: 'UsedSignature', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'medalUIDs',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'schemaUID',
        type: 'bytes32',
      },
    ],
    name: 'ClusteredMedalAttestationsRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newEAS',
        type: 'address',
      },
    ],
    name: 'EASUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'medalUID',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'schemaUID',
        type: 'bytes32',
      },
    ],
    name: 'MedalAttestationRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'stackOwner',
        type: 'address',
      },
      {
        components: [
          { internalType: 'bytes32', name: 'medalUID', type: 'bytes32' },
          { internalType: 'uint16', name: 'medalTier', type: 'uint16' },
          { internalType: 'bytes', name: 'medalData', type: 'bytes' },
          { internalType: 'bool', name: 'revocable', type: 'bool' },
        ],
        indexed: false,
        internalType: 'struct MedalInfo[]',
        name: 'medals',
        type: 'tuple[]',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'attestationUIDs',
        type: 'bytes32[]',
      },
    ],
    name: 'MultipleMedalAttestationsAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'medalUIDs',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'schemaUIDs',
        type: 'bytes32[]',
      },
    ],
    name: 'MultipleMedalAttestationsRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newRevoker',
        type: 'address',
      },
    ],
    name: 'RevokerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newSigner',
        type: 'address',
      },
    ],
    name: 'SignerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newStackRenderer',
        type: 'address',
      },
    ],
    name: 'StackRendererUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'addressToTokenId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'medalUID',
            type: 'bytes32',
          },
          {
            internalType: 'uint16',
            name: 'medalTier',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'medalData',
            type: 'bytes',
          },
          {
            internalType: 'bool',
            name: 'revocable',
            type: 'bool',
          },
        ],
        internalType: 'struct MedalInfo[]',
        name: 'medals',
        type: 'tuple[]',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'attestMedals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eas',
    outputs: [
      {
        internalType: 'contract IEAS',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'medalUID',
        type: 'bytes32',
      },
    ],
    name: 'getMedalAttestationUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'medalUID',
        type: 'bytes32',
      },
    ],
    name: 'getMedalByMedalUID',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'stackOwner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'stackId',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'medalUID',
            type: 'bytes32',
          },
          {
            internalType: 'uint16',
            name: 'medalTier',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'medalData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
        ],
        internalType: 'struct ShapeMedalSchema',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: 'medalTier',
        type: 'uint16',
      },
    ],
    name: 'getMedalCountByTier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
      {
        internalType: 'uint16[]',
        name: 'medalTiers',
        type: 'uint16[]',
      },
    ],
    name: 'getMedalCounts',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
    ],
    name: 'getStackMedalUIDs',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stackId',
        type: 'uint256',
      },
    ],
    name: 'getStackMedals',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'stackOwner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'stackId',
            type: 'uint256',
          },
          { internalType: 'bytes32', name: 'medalUID', type: 'bytes32' },
          { internalType: 'uint16', name: 'medalTier', type: 'uint16' },
          { internalType: 'bytes', name: 'medalData', type: 'bytes' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct ShapeMedalSchema[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'stackId', type: 'uint256' }],
    name: 'getStackOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'easAddress', type: 'address' },
      {
        internalType: 'address',
        name: 'shapeSchemaResolverAddress',
        type: 'address',
      },
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'address', name: 'revoker', type: 'address' },
      {
        internalType: 'address',
        name: 'stackRendererAddress',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32[]', name: 'medalUIDs', type: 'bytes32[]' }],
    name: 'removeClusteredMedals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32[]', name: 'medalUIDs', type: 'bytes32[]' }],
    name: 'removeMedals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'easAddress', type: 'address' }],
    name: 'setEAS',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'revoker', type: 'address' }],
    name: 'setRevoker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
    name: 'setSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'stackRendererAddress',
        type: 'address',
      },
    ],
    name: 'setStackRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'shapeSchemaResolver',
    outputs: [
      {
        internalType: 'contract IShapeSchemaResolver',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stackRenderer',
    outputs: [{ internalType: 'contract IStackRenderer', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
