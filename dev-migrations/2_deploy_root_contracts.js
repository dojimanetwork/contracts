// Deploy minimal number of contracts to link the libraries with the contracts

const bluebird = require('bluebird')
const utils = require('../deploy-migrations/utils')

const SafeMath = artifacts.require(
  'openzeppelin-solidity/contracts/math/SafeMath.sol'
)

const RLPReader = artifacts.require('solidity-rlp/contracts/RLPReader.sol')

//const DojimaToken = artifacts.require('DojimaToken')

const BytesLib = artifacts.require('BytesLib')
const Common = artifacts.require('Common')
const ECVerify = artifacts.require('ECVerify')
const Merkle = artifacts.require('Merkle')
const MerklePatriciaProof = artifacts.require('MerklePatriciaProof')
const PriorityQueue = artifacts.require('PriorityQueue')
const RLPEncode = artifacts.require('RLPEncode')

const Registry = artifacts.require('Registry')
const Governance = artifacts.require('Governance')
const RootChain = artifacts.require('RootChain')
const DepositManager = artifacts.require('DepositManager')
const WithdrawManager = artifacts.require('WithdrawManager')
const StakeManager = artifacts.require('StakeManager')
const StakeManagerProxy = artifacts.require('StakeManagerProxy')
const SlashingManager = artifacts.require('SlashingManager')
const StakingInfo = artifacts.require('StakingInfo')
const StakingNFT = artifacts.require('StakingNFT')
const TestToken = artifacts.require('TestToken')
const ValidatorShareFactory = artifacts.require('ValidatorShareFactory')
const ERC20Predicate = artifacts.require('ERC20Predicate')
const ERC721Predicate = artifacts.require('ERC721Predicate')
const MintableERC721Predicate = artifacts.require('MintableERC721Predicate')
const Marketplace = artifacts.require('Marketplace')
const MarketplacePredicate = artifacts.require('MarketplacePredicate')
const MarketplacePredicateTest = artifacts.require('MarketplacePredicateTest')
const TransferWithSigPredicate = artifacts.require('TransferWithSigPredicate')
const TransferWithSigUtils = artifacts.require('TransferWithSigUtils')

const StateSender = artifacts.require('StateSender')

const StakeManagerTestable = artifacts.require('StakeManagerTestable')
const StakeManagerTest = artifacts.require('StakeManagerTest')

const libDeps = [
  {
    lib: BytesLib,
    contracts: [WithdrawManager, ERC20Predicate, ERC721Predicate, MintableERC721Predicate]
  },
  {
    lib: Common,
    contracts: [
      WithdrawManager,
      ERC20Predicate,
      ERC721Predicate,
      MintableERC721Predicate,
      MarketplacePredicate,
      MarketplacePredicateTest,
      TransferWithSigPredicate
    ]
  },
  {
    lib: ECVerify,
    contracts: [
      StakeManager,
      SlashingManager,
      StakeManagerTestable,
      MarketplacePredicate,
      MarketplacePredicateTest,
      TransferWithSigPredicate
    ]
  },
  {
    lib: Merkle,
    contracts: [
      WithdrawManager,
      ERC20Predicate,
      ERC721Predicate,
      MintableERC721Predicate,
      StakeManager,
      StakeManagerTestable,
      StakeManagerTest
    ]
  },
  {
    lib: MerklePatriciaProof,
    contracts: [WithdrawManager, ERC20Predicate, ERC721Predicate, MintableERC721Predicate]
  },
  {
    lib: PriorityQueue,
    contracts: [WithdrawManager]
  },
  {
    lib: RLPEncode,
    contracts: [
      WithdrawManager,
      ERC20Predicate,
      ERC721Predicate,
      MintableERC721Predicate,
      MarketplacePredicate,
      MarketplacePredicateTest
    ]
  },
  {
    lib: RLPReader,
    contracts: [
      RootChain,
      StakeManager,
      ERC20Predicate,
      ERC721Predicate,
      MintableERC721Predicate,
      MarketplacePredicate,
      MarketplacePredicateTest
    ]
  },
  {
    lib: SafeMath,
    contracts: [
      RootChain,
      ERC20Predicate,
      ERC721Predicate,
      MintableERC721Predicate,
      MarketplacePredicate,
      MarketplacePredicateTest,
      TransferWithSigPredicate,
      StakeManager,
      SlashingManager,
      StakingInfo,
      StateSender
    ]
  },
  {
    lib: SafeMath,
    contracts: [RootChain, ERC20Predicate]
  },
  {
    lib: TransferWithSigUtils,
    contracts: [
      TransferWithSigPredicate,
      MarketplacePredicate,
      MarketplacePredicateTest
    ]
  }
]

module.exports = async function(deployer, network, accounts) {
  deployer.then(async() => {
    console.log('linking libs...')
    await bluebird.map(libDeps, async e => {
      await deployer.deploy(e.lib)
      deployer.link(e.lib, e.contracts)
    })

    console.log('deploying contracts...')

    await deployer.deploy(StateSender)

    await deployer.deploy(Governance)
    await deployer.deploy(Registry, Governance.address)
    await deployer.deploy(ValidatorShareFactory)
    await deployer.deploy(TestToken, 'Dojima Test', 'DOJIMATEST')
    //await deployer.deploy(DojimaToken, 'Dojima', 'DJM' , 18 , 5000000000)
    await deployer.deploy(StakingInfo, Registry.address)
    await deployer.deploy(StakingNFT, 'Dojima Validator', 'DV')
    await Promise.all([
      deployer.deploy(RootChain, Registry.address, 'watchman-1001'),

      deployer.deploy(WithdrawManager),
      deployer.deploy(DepositManager)
    ])

    await deployer.deploy(StakeManagerTestable)
    await deployer.deploy(StakeManagerTest)
    const stakeManager = await deployer.deploy(StakeManager)
    const proxy = await deployer.deploy(StakeManagerProxy, '0x0000000000000000000000000000000000000000')
    await proxy.updateAndCall(
      StakeManager.address,
      stakeManager.contract.methods.initialize(
        Registry.address,
        RootChain.address,
        TestToken.address,
        StakingNFT.address,
        StakingInfo.address,
        ValidatorShareFactory.address,
        Governance.address,
        accounts[0]
      ).encodeABI()
    )

    await deployer.deploy(SlashingManager, Registry.address, StakingInfo.address, 'watchman-1001')
    let stakingNFT = await StakingNFT.deployed()
    await stakingNFT.transferOwnership(StakeManagerProxy.address)

    await Promise.all([
      deployer.deploy(
        ERC20Predicate,
        WithdrawManager.address,
        DepositManager.address,
        Registry.address
      ),
      deployer.deploy(
        ERC721Predicate,
        WithdrawManager.address,
        DepositManager.address
      ),
      deployer.deploy(
        MintableERC721Predicate,
        WithdrawManager.address,
        DepositManager.address
      ),
      deployer.deploy(Marketplace),
      deployer.deploy(MarketplacePredicateTest),
      deployer.deploy(
        MarketplacePredicate,
        RootChain.address,
        WithdrawManager.address,
        Registry.address
      ),
      deployer.deploy(
        TransferWithSigPredicate,
        RootChain.address,
        WithdrawManager.address,
        Registry.address
      )
    ])
    console.log('writing contract addresses to file...')
    const contractAddressesDevelopment = {
      root: {
         //Dojima_Token: DojimaToken.address,
         Registry: Registry.address,
         ValidatorShareFactory: ValidatorShareFactory.address,
         RootChain: RootChain.address,
         Governance: Governance.address,
       
         DepositManager: DepositManager.address,
       
         WithdrawManager: WithdrawManager.address,
      
        StakeManagerTestable: StakeManagerTestable.address,
        StakeManagerTest: StakeManagerTest.address,
        StakeManager: StakeManager.address,
        StakeManagerProxy: StakeManagerProxy.address,
        StateSender: StateSender.address,
      
         SlashingManager: SlashingManager.address,
         StakingInfo: StakingInfo.address,
         StakingNFT: StakingNFT.address,
       
         predicates: {
           ERC20Predicate: ERC20Predicate.address,
           ERC721Predicate: ERC721Predicate.address,
           MintableERC721Predicate: MintableERC721Predicate.address,
           Marketplace: Marketplace.address,
           MarketplacePredicate: MarketplacePredicate.address,
           MarketplacePredicateTest: MarketplacePredicateTest.address,
          TransferWithSigPredicate: TransferWithSigPredicate.address
         },
         tokens: {
        
           TestToken: TestToken.address,
        
         }
      }
    }
    utils.writeContractAddresses(contractAddressesDevelopment)

  })
}
