import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying NFTMinter to Shape Sepolia...');

  // Get the contract factory
  const NFTMinter = await ethers.getContractFactory('NFTMinter');

  // Deploy the contract
  console.log('📝 Deploying contract...');
  const nftMinter = await NFTMinter.deploy();

  // Wait for deployment to be mined
  await nftMinter.waitForDeployment();

  const contractAddress = await nftMinter.getAddress();

  console.log('✅ NFTMinter deployed to:', contractAddress);

  // Get deployment transaction details
  const deploymentTx = nftMinter.deploymentTransaction();
  if (deploymentTx) {
    console.log('📦 Transaction hash:', deploymentTx.hash);
    console.log('⛽ Gas used:', deploymentTx.gasLimit?.toString());
  }

  // Verify contract info
  console.log('\n📋 Contract Details:');
  console.log('- Name:', await nftMinter.name());
  console.log('- Symbol:', await nftMinter.symbol());
  console.log('- Owner:', await nftMinter.owner());
  console.log('- Next Token ID:', await nftMinter.getNextTokenId());

  console.log('\n🌐 Explorer Links:');
  console.log('- Contract:', `https://shape-sepolia.blockscout.com/address/${contractAddress}`);
  if (deploymentTx) {
    console.log('- Transaction:', `https://shape-sepolia.blockscout.com/tx/${deploymentTx.hash}`);
  }

  console.log('\n🔧 Add this to your MCP server config:');
  console.log(`NFT_CONTRACT_ADDRESS=${contractAddress}`);

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log('🎉 Deployment completed successfully!');
    console.log('🔧 Add this to your MCP server config:');
    console.log(`NFT_CONTRACT_ADDRESS=${address}`);
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exitCode = 1;
  });
