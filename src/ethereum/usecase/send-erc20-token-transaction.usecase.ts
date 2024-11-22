
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
export default class SendErc20TransactionUseCase {
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

  async sendErc20Transaction(fromWalletAddress: string, toWalletAddress: string, transferAmount: number): Promise<any> {
    let returnValue: any = {
        transactionHash: '',
        blockNumber: '',
        result: 'Failed' // Failed or Successful
    };
    let sendErc20TransactionResult : any;

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
                EthereumGroup.SendErc20Transaction,
                {
                    getGasPriceResult: getGasPriceResult,
                    error: 'Error in fetching gas price'
                }
            )
        );

        return returnValue;
    }

    //Convert transfer amount using Custom function derived from Web3 method to Wei
    var transferValue = toWei(transferAmount, this.tokenDecimalCount);
    console.log('transferValue', transferValue);

    //Initialize ERC-20 Token ETH Contract object
    let contract = new this.web3Object.eth.Contract(contractABI, this.erc20TokenContractAddress);

    //Generate Encoded Data
    let transferdata: any;
    try {
        transferdata = await contract.methods.transfer(toWalletAddress, transferValue, { from: fromWalletAddress }).encodeABI();
        console.log('transferdata', transferdata);
    } catch (error) {
        Logger.error(
            new EthereumLog(
                '',
                '',
                toWalletAddress,
                EthereumSteps.GenerateEncodedTransferData,
                EthereumGroup.SendErc20Transaction,
                {
                    error: error.message
                }
            )
        );

        return returnValue;
    }

    //Initialize Transaction Object
    let txObj = {
        gasPrice: this.web3Object.utils.toHex(BigInt(getGasPriceResult.gasPrice)), //Current Gas Price in Gwei
        //gasPrice: this.web3Object.utils.toHex(gasPrice), //Current Gas Price in Gwei
        to: this.erc20TokenContractAddress, //ERC-20 Token Smart Contract
        value: "0x00", //Set to Zero for ERC-20 Txn
        data: transferdata, //Value generated from contract transfer().encodeABI() method
        from: fromWalletAddress //Source Wallet
    }
    console.log('txObj', txObj);

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
                EthereumGroup.SendErc20Transaction,
                {
                    error: error.message
                }
            )
        );

        return returnValue;
    }
    
    //Send ERC-20 Signed Transaction
    try {
        sendErc20TransactionResult = await this.web3Object.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('sendErc20TransactionResult', sendErc20TransactionResult);
    } catch (error) {
        Logger.error(
            new EthereumLog(
                '',
                signedTransaction.transactionHash,
                toWalletAddress,
                EthereumSteps.SendSignedTransaction,
                EthereumGroup.SendErc20Transaction,
                {
                    error: error.message
                }
            )
        );

        return returnValue;
    }

    returnValue.transactionHash = sendErc20TransactionResult.transactionHash;
    returnValue.blockNumber = sendErc20TransactionResult.blockNumber.toString();
    returnValue.result = sendErc20TransactionResult.status == 1 ? 'Success' : 'Failed';

    return returnValue;
  }
}