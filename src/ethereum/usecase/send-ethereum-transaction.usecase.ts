
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';
import { fromWei, toWei } from '../../common/functions/cryptoFunction';
import { join } from 'path';
import * as fs from 'fs';
import GetGasPriceUseCase from './get-gas-price.usecase';

@Injectable()
export default class SendEthereumTransactionUseCase {
private rpcUrl: string;
private web3Object : any;
private tokenDecimalCount: number;
private erc20TokenContractAddress : any;

constructor(private getGasPriceUseCase: GetGasPriceUseCase) {
    this.rpcUrl = process.env.RPC_URL;

    //Initialize RPC connection for Web3 Functions
    this.web3Object = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    // console.log("web3Object", this.web3Object);

    //ERC-20 Token decimal holder 
    this.tokenDecimalCount = Number(process.env.ERC20_DECIMAL_COUNT);

    //Define ERC-20 Token Contract Address.
    this.erc20TokenContractAddress = process.env.ERC20_CONTRACT;
}

  async sendEthereumTransaction(fromWalletAddress: string, toWalletAddress: string, transferAmount: number): Promise<any> {
    let returnValue: any = {
        transactionHash: '',
        blockNumber: '',
        result: 'Failed' // Failed or Successful
    };
    let sendEthereumTransactionResult : any;

    //Initialize contract ABI
    let jsonContractAbiFilePath = join(__dirname, '../abi/balance-and-transfer.json');
    let jsonContractAbiData = fs.readFileSync(jsonContractAbiFilePath, 'utf8');
    let contractABI = JSON.parse(jsonContractAbiData);

    //Get Gas Price in Gwei
    let getGasPriceResult = await this.getGasPriceUseCase.getGasPrice(); 
    if (!getGasPriceResult) {
        Logger.error(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.GetGasPrice,
                EthereumGroup.SendEthereumTransaction,
                {
                    getGasPriceResult: getGasPriceResult,
                    error: 'Error in fetching gas price'
                }
            )
        );

        return returnValue;
    }

    //Convert transfer amount to Wei from Ether
    var transferValue = this.web3Object.utils.toWei(transferAmount, "ether")
    console.log('transferValue', transferValue);
    
    //Initialize Transaction Object
    let txObj = {
        gasPrice: this.web3Object.utils.toHex(BigInt(getGasPriceResult.gasPrice)), //Current Gas Price in Gwei
        to: toWalletAddress, //Target Wallet
        value: transferValue, //Wei
        from: fromWalletAddress //Source Wallet
    }

    //INSERT LOGIC to Fetch fromWalletAddress PRIVATE KEY from DB
    let fromWalletAddressPrivateKey = '0x333cc3f51e569fc304bbb738c0b63c7d15b6307e368ba33bfd039c6001d14de9'; //Temporary hardcoded value

    //Sign Transaction
    let signedTransaction: any;
    try {
        signedTransaction = await this.web3Object.eth.accounts.signTransaction(txObj, fromWalletAddressPrivateKey);
        console.log('signedTransaction hash', signedTransaction.transactionHash); //TransactionHash to be populated in the EVM BlockChain
    } catch (error) {
        Logger.error(
            new EthereumLog(
                '',
                '',
                toWalletAddress,
                EthereumSteps.SignTransaction,
                EthereumGroup.SendEthereumTransaction,
                {
                    error: error.message
                }
            )
        );

        return returnValue;
    }
    
    //Send Ethereum Signed Transaction
    try {
        sendEthereumTransactionResult = await this.web3Object.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('sendEthereumTransactionResult', sendEthereumTransactionResult);
    } catch (error) {
        Logger.error(
            new EthereumLog(
                '',
                signedTransaction.transactionHash,
                toWalletAddress,
                EthereumSteps.SendSignedTransaction,
                EthereumGroup.SendEthereumTransaction,
                {
                    error: error.message
                }
            )
        );

        return returnValue;
    }

    returnValue.transactionHash = sendEthereumTransactionResult.transactionHash;
    returnValue.blockNumber = sendEthereumTransactionResult.blockNumber.toString();
    returnValue.result = sendEthereumTransactionResult.status == 1 ? 'Success' : 'Failed';

    return returnValue;
  }
}