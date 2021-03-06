const Confirm = require('prompt-confirm');
const hre = require('hardhat');
const ethers = hre.ethers;
const config = require('../../.config.json');
const { e18, ZERO_ADDRESS, SIX_HOURS } = require('../../utils/web3-utils');

const prompt = new Confirm('Do you wish to calculate keep3r vaults earn?');

async function main() {
  await hre.run('compile');
  await promptAndSubmit();
}

function promptAndSubmit() {
  return new Promise((resolve) => {
    try {
      prompt.ask(async (answer) => {
        if (answer) {
          const [owner] = await ethers.getSigners();
          // Setup deployer
          await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [config.accounts.mainnet.deployer] });
          const deployer = owner.provider.getUncheckedSigner(config.accounts.mainnet.deployer);
          
          // Setup vault keep3r
          const vaultKeep3r = await ethers.getContractAt('VaultKeep3r', config.contracts.mainnet.vaultKeep3r.address, deployer);

          const vaults = {
            'ycrvVault': {},
            'busdVault': {},
            'sbtcVault': {},
            'pool3Vault': {},
            'compVault': {},
            'usdtVault': {},
            'tusdVault': {},
            'musdVault': {},
            'gusdVault': {},
            'yvUSDC': {},
            'musdVault2': {},
            'eursVault': {},
            // 'newVaultToAdd': { requiredEarnAmount: e18.mul(20000) },
          };

          // Setup vaults
          for (const vault in vaults) {
            vaults[vault].contract = await ethers.getContractAt('yVault', config.contracts.mainnet[vault].address, deployer);
            vaults[vault].token = await ethers.getContractAt('ERC20Token', await vaults[vault].contract.callStatic.token(), deployer);
            vaults[vault].decimals = ethers.BigNumber.from(10).pow(await vaults[vault].token.decimals());
          }

          // Setup vaults
          console.time('vaultKeep3r addVault');
          for (const vault in vaults) {
            if (vaults[vault].requiredEarnAmount) {
              console.log(`vaultKeep3r.addVault(${vault})`, config.contracts.mainnet[vault].address, vaults[vault].requiredEarnAmount.div(vaults[vault].decimals).toNumber());
              await vaultKeep3r.addVault(config.contracts.mainnet[vault].address, vaults[vault].requiredEarnAmount);
            }
          }
          console.timeEnd('vaultKeep3r addVault');


          console.time('required earn of vault')
          for (const vault in vaults) {
            try {
              console.log(
                `required earn of vault(${vault})`,
                (await vaultKeep3r.callStatic.requiredEarn(vaults[vault].contract.address)).div(vaults[vault].decimals).toNumber()
                )
            } catch (error) {
              
            }
          }
          console.timeEnd('required earn of vault')

          console.time('balance of vault')
          for (const vault in vaults) {
            console.log(
              `balance of vault(${vault})`,
              (await vaults[vault].token.callStatic.balanceOf(vaults[vault].contract.address)).div(vaults[vault].decimals).toNumber()
            )
          }
          console.timeEnd('balance of vault')


          console.log(`calculating earn for: ${Object.keys(vaults)}. please wait ...`)
          console.time('calculateEarn')
          for (const vault in vaults) {
            console.log(
              `calculateEarn(${vault})`,
              (await vaultKeep3r.callStatic.calculateEarn(vaults[vault].contract.address)).div(vaults[vault].decimals).toNumber()
            )
          }
          console.timeEnd('calculateEarn')

          console.log(`checking if workable for: ${Object.keys(vaults).join(', ').slice(0, -2)}. please wait ...`)
          console.time('workable')
          for (const vault in vaults) {
            console.log(
              `workable(${vault})`,
              await vaultKeep3r.callStatic.workable(vaults[vault].contract.address)
            )
          }
          console.timeEnd('workable')

          console.time('working...')
          for (const vault in vaults) {
            if (await vaultKeep3r.callStatic.workable(vaults[vault].contract.address)) {
              console.log(`working(${vault})`);
              await vaultKeep3r.forceEarn(vaults[vault].contract.address);
            }
          }
          console.timeEnd('working...')

          console.log(`calculating earn for: ${Object.keys(vaults)}. please wait ...`)
          console.time('calculateEarn')
          for (const vault in vaults) {
            console.log(
              `calculateEarn(${vault})`,
              (await vaultKeep3r.callStatic.calculateEarn(vaults[vault].contract.address)).div(vaults[vault].decimals).toNumber()
            )
          }
          console.timeEnd('calculateEarn')

          console.log(`checking if workable for: ${Object.keys(vaults).join(', ').slice(0, -2)}. please wait ...`)
          console.time('workable')
          for (const vault in vaults) {
            console.log(
              `workable(${vault})`,
              await vaultKeep3r.callStatic.workable(vaults[vault].contract.address)
            )
          }
          console.timeEnd('workable')

          console.time('balance of vault')
          for (const vault in vaults) {
            console.log(
              `balance of vault(${vault})`,
              (await vaults[vault].token.callStatic.balanceOf(vaults[vault].contract.address)).div(vaults[vault].decimals).toNumber()
            )
          }
          console.timeEnd('balance of vault')

          resolve();
        } else {
          console.error('Aborted!');
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
