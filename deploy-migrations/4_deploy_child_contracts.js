const utils = require('./utils')

const SafeMath = artifacts.require(
  'openzeppelin-solidity/contracts/math/SafeMath.sol'
)
const ChildChain = artifacts.require('ChildChain')
const DRC20 = artifacts.require('DRC20')

module.exports = async function(deployer, network, accounts) {
  deployer.then(async() => {
    await deployer.deploy(SafeMath)
    await deployer.link(SafeMath, [ChildChain])
    await deployer.deploy(ChildChain)

    const childChain = await ChildChain.deployed()
    const contractAddresses = utils.getContractAddresses()

    let DojimaWeth = await childChain.addToken(
      accounts[0],
      contractAddresses.root.tokens.DojimaWeth,
      'ETH on Dojima',
      'ETH',
      18,
      false // _isERC721
    )

    let TestToken = await childChain.addToken(
      accounts[0],
      contractAddresses.root.tokens.TestToken,
      'Test Token',
      'TST',
      18,
      false // _isERC721
    )

    let RootERC721 = await childChain.addToken(
      accounts[0],
      contractAddresses.root.tokens.RootERC721,
      'Test ERC721',
      'TST721',
      0,
      true // _isERC721
    )

    const dojimaToken = await DRC20.at('0x0000000000000000000000000000000000001010')
    const dojimaOwner = await dojimaToken.owner()
    if (dojimaOwner === '0x0000000000000000000000000000000000000000') {
      // dojima contract at 0x1010 can only be initialized once, after the bor image starts to run
      await dojimaToken.initialize(ChildChain.address, contractAddresses.root.tokens.DojimaToken)
    }
    await childChain.mapToken(contractAddresses.root.tokens.DojimaToken, '0x0000000000000000000000000000000000001010', false)

    contractAddresses.child = {
      ChildChain: ChildChain.address,
      tokens: {
        DojimaWeth: DojimaWeth.logs.find(log => log.event === 'NewToken').args.token,
        DojimaToken: '0x0000000000000000000000000000000000001010',
        TestToken: TestToken.logs.find(log => log.event === 'NewToken').args.token,
        RootERC721: RootERC721.logs.find(log => log.event === 'NewToken').args.token
      }
    }
    utils.writeContractAddresses(contractAddresses)
  })
}
