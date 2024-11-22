
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';
import { fromWei } from '../../common/functions/cryptoFunction';

@Injectable()
export default class GetTransactionReceiptUseCase {
private rpcUrl: string;
private web3Object : any;
private tokenDecimalCount: number;

constructor() {
    this.rpcUrl = process.env.RPC_URL;

    //Initialize RPC connection for Web3 Functions
    this.web3Object = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    // console.log("web3Object", this.web3Object);

    //ERC-20 Token decimal holder 
    this.tokenDecimalCount = Number(process.env.ERC20_DECIMAL_COUNT);
}

  async getTransactionReceipt(transactionHash: string): Promise<any> {
    let returnValue: ethereumModels.TransactionReceiptDto = {};
    let getTransactionReceiptResult : any;

    try {
        getTransactionReceiptResult = await this.web3Object.eth.getTransactionReceipt(transactionHash); 
        console.log('getTransactionReceiptResult', getTransactionReceiptResult);

        Logger.log(
            new EthereumLog(
                '',
                transactionHash,
                '',
                EthereumSteps.GetTransactionReceipt,
                EthereumGroup.GetTransactionReceipt,
                {
                    transactionReceipt: getTransactionReceiptResult,
                }
            )
        );
    }
    catch (error) {
        console.log('getTransactionReceiptResult Error', error);
        Logger.error(
            new EthereumLog(
                '',
                transactionHash,
                '',
                EthereumSteps.GetTransactionReceipt,
                EthereumGroup.GetTransactionReceipt,
                {
                    error: error.message
                }
            )
        );
    }

    if (getTransactionReceiptResult) {
        let logs = getTransactionReceiptResult.logs[0]

        returnValue.blockNumber =  parseInt(getTransactionReceiptResult.blockNumber)
        returnValue.fromWallet =  this.web3Object.eth.abi.decodeParameter('address', logs.topics[1]);
        returnValue.toWallet =  this.web3Object.eth.abi.decodeParameter('address', logs.topics[2]);
        returnValue.transactionAmount = Number(fromWei(logs.data, this.tokenDecimalCount));
        returnValue.status = parseInt(getTransactionReceiptResult.status)

        console.log('getTransactionReceiptResult returnValue', returnValue);
    }

    return returnValue;
  }
}