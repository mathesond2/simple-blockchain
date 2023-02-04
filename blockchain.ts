const sha256 = require('crypto-js/sha256');

type Account = 'accountA' | 'accountB';

type Txn = {
  from: Account,
  to: Account,
  value: number,
};

const acctA = 'accountA';
const acctB = 'accountB';
class Block {
  hash: string;
  constructor(
    public txn: Txn,
    public prevHash: string = '',
  ) {
    this.txn = txn;
    this.prevHash = prevHash;
    this.hash = this.computeHash();
  }

  computeHash(): string {
    return sha256(this.prevHash + JSON.stringify(this.txn)).toString();
  }
}

class BlockChain {
  public blockchain: Block[];
  public state: {
    accountA: number,
    accountB: number,
  };
  constructor(public blockSize: number) {
    this.blockchain = [this.startGenesisBlock()];
    this.blockSize = blockSize;
    this.state = {
      accountA: 0,
      accountB: 0,
    };
  }

  startGenesisBlock() {
    return new Block({} as Txn);
  }

  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  isValidBlock(newBlock: Block) {
    const { txn } = newBlock;
    const txnKeys = Object.keys(txn);

    // if (txn.length !== this.blockSize) {
    //   return false;
    // }

    const isSendingValueToAnotherAcct = txnKeys.map(key => {
      if (key === 'from') {
        if (txn[key] === acctA && txn.to === acctB) {
          return true;
        } else if (txn[key] === acctB && txn.to === acctA) {
          return true;
        }

        return false;
      }
    });

    if (isSendingValueToAnotherAcct.some(key => key === false)) {
      return false;
    };

    const areCorrectKeys = txnKeys.map(key => ['from', 'to', 'value'].includes(key) ? true : false);
    return areCorrectKeys.every(key => key === true);
  }

  calculateNewState(txn: Txn) {
    let { accountA, accountB } = this.state;
    if (txn.from === acctA) {
      accountA -= txn.value;
      accountB += txn.value;
    } else {
      accountB -= txn.value;
      accountA += txn.value;
    }
    return {accountA, accountB};
  }

  addNewBlock(newBlock: Block) {
    if (!this.isValidBlock(newBlock)) {
      return;
    }
    newBlock.prevHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.computeHash();
    this.blockchain.push(newBlock);
    this.state = this.calculateNewState(newBlock.txn);
  }

  getBlock(hash: string): Block | undefined {
    return this.blockchain.find((block: Block) => block.hash === hash);
  }

  // getCurrentBalance(account: Account) {
  //   const foundAcct = Object.keys(this.state).find(acct => acct === account);
  //   if (foundAcct) {
  //     return this.state[foundAcct];
  //   }
  // }

  isValidChain() {
    for (let i = 1; i < this.blockchain.length; i++) {
      const currBlock = this.blockchain[i];
      const prevBlock = this.blockchain[i -1];

      // Is the hash correctly computed, or was it tampered with?
      if (currBlock.hash !== currBlock.computeHash()) {
        return false;
      }

      // Does it have the correct prevHash value?; ie: What a previous block tampered with?
      if (currBlock.prevHash !== prevBlock.hash) {
        return false;
      }
    }
    return true;
  }
}



const a = new Block({from: acctA, to: acctB, value: 10})
const b = new Block({from: acctB, to: acctA, value: 5})

const chain = new BlockChain(2);
chain.addNewBlock(a);
chain.addNewBlock(b);
console.log(chain);
console.log(`is valid chain: ${chain.isValidChain()}`);