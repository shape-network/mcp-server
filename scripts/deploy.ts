import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying SVGNFTMinter to Shape Sepolia...');

  // Get the contract factory
  const SVGNFTMinter = await ethers.getContractFactory('SVGNFTMinter');

  // Deploy the contract
  console.log('📝 Deploying contract...');
  const svgNFTMinter = await SVGNFTMinter.deploy();

  // Wait for deployment to be mined
  await svgNFTMinter.waitForDeployment();

  const contractAddress = await svgNFTMinter.getAddress();

  console.log('✅ SVGNFTMinter deployed to:', contractAddress);

  // Get deployment transaction details
  const deploymentTx = svgNFTMinter.deploymentTransaction();
  if (deploymentTx) {
    console.log('📦 Transaction hash:', deploymentTx.hash);
    console.log('⛽ Gas used:', deploymentTx.gasLimit?.toString());
  }

  // Verify contract info
  console.log('\n📋 Contract Details:');
  console.log('- Name:', await svgNFTMinter.name());
  console.log('- Symbol:', await svgNFTMinter.symbol());
  console.log('- Owner:', await svgNFTMinter.owner());
  console.log('- Next Token ID:', await svgNFTMinter.getNextTokenId());

  console.log('\n🌐 Explorer Links:');
  console.log('- Contract:', `https://shape-sepolia.blockscout.com/address/${contractAddress}`);
  if (deploymentTx) {
    console.log('- Transaction:', `https://shape-sepolia.blockscout.com/tx/${deploymentTx.hash}`);
  }

  console.log('\n🔧 Add this to your MCP server config:');
  console.log(`SVG_NFT_CONTRACT_ADDRESS=${contractAddress}`);

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log('\n🎉 Deployment completed successfully!');
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exitCode = 1;
  });
