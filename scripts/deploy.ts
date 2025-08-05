import { ethers, run } from 'hardhat';

const main = async () => {
  console.log('🚀 Deploying NFTMinter to Shape Sepolia...');

  const [deployer] = await ethers.getSigners();
  console.log('📋 Deploying from account:', deployer.address);

  const NFTMinter = await ethers.getContractFactory('NFTMinter');
  const nftMinterContract = await NFTMinter.deploy();
  await nftMinterContract.waitForDeployment();

  const contractAddress = await nftMinterContract.getAddress();
  console.log('✅ NFTMinter deployed to:', contractAddress);

  // Get contract instance for verification
  const nftMinter = await ethers.getContractAt('NFTMinter', contractAddress);

  // Verify contract info
  console.log('\n📋 Contract Details:');
  console.log('- Name:', await nftMinter.name());
  console.log('- Symbol:', await nftMinter.symbol());
  console.log('- Owner:', await nftMinter.owner());
  console.log('- Next Token ID:', await nftMinter.getNextTokenId());

  console.log('\n Verifying the on Shapescan...');
  await run('verify:verify', {
    address: contractAddress,
    constructorArguments: [],
  });

  console.log('\n🌐 Explorer Links:');
  console.log('- Contract:', `https://sepolia.shapescan.xyz/address/${contractAddress}`);

  console.log('\n🔧 Add this to your MCP server config:');
  console.log(`NFT_CONTRACT_ADDRESS=${contractAddress}`);

  return contractAddress;
};

main();
