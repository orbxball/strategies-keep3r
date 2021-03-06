const hre = require('hardhat');
const ethers = hre.ethers;

const gwei = ethers.BigNumber.from(10).pow(9);
const e18 = ethers.BigNumber.from(10).pow(18);
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SIX_HOURS = 6 * 60 * 60;
const P = 100000;
const e18ToDecimal = (number) => number.mul(P).div(e18).toNumber() / P;

module.exports = {
    gwei,
    e18,
    ZERO_ADDRESS,
    SIX_HOURS,
    e18ToDecimal,
}
