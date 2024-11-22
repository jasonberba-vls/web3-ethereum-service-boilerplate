export class EthereumLog {
    token: string;
    transactionHash: string;
    targetWallet: string;
    step: string;
    group: EthereumGroup;
    message: any;
  
    constructor(
      token: string,
      transactionHash: string,
      targetWallet: string,
      step: string,
      group: EthereumGroup,
      message: any
    ) {
      this.token = token;
      this.transactionHash = transactionHash;
      this.targetWallet = targetWallet;
      this.step = step;
      this.group = group;
      this.message = message;
    }
  }

  export enum EthereumGroup {
    CreateWallet = 'CreateWallet',
    GetTransactionReceipt = 'GetTransactionReceipt',
    GetWalletBalance = 'GetWalletBalance',
    GetGasPrice = 'GetGasPrice',
    GetTransactionGasEstimate = 'GetTransactionGasEstimate',
    SendErc20Transaction = 'SendErc20Transaction',
    SendEthereumTransaction = 'SendEthereumTransaction'
  }

  export enum EthereumSteps {
    CreateWalletResult = 'Create Wallet Result',
    CreatePrivateKeyResult = 'Create Private Key Result',
    GetTransactionReceipt = 'Get Transaction Receipt',
    GetWalletBalance = 'Get Wallet Balance',
    GetGasPrice = 'Get Gas Price',
    GetGasEstimateFromContract = 'Get Gas Estimate From Contract',
    GetTransactionGasEstimateResult = 'Get Transaction Ga Estimate Result',
    GenerateEncodedTransferData = 'Generate Encoded Transfer Data',
    SignTransaction = 'Sign Transaction',
    SendSignedTransaction = 'Send Signed Transaction',
  }
  