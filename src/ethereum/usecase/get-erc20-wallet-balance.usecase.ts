
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';
import { fromWei } from '../../common/functions/cryptoFunction';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export default class GetErc20WalletBalanceUseCase {
private rpcUrl: string;
private web3Object : any;
private tokenDecimalCount: number;
private erc20TokenContractAddress : any;


constructor() {
    this.rpcUrl = process.env.RPC_URL;

    //Initialize RPC connection for Web3 Functions
    this.web3Object = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    // console.log("web3Object", this.web3Object);

    //ERC-20 Token decimal holder 
    this.tokenDecimalCount = Number(process.env.ERC20_DECIMAL_COUNT);

    //Define ERC-20 Token Contract Address.
    this.erc20TokenContractAddress = process.env.ERC20_CONTRACT;
}

  async getErc20TokenWalletBalance(walletAddress: string): Promise<any> {
    let returnValue: any;

    //Initialize contract ABI
    let jsonContractAbiFilePath = join(__dirname, '../abi/balance-and-transfer.json');
    let jsonContractAbiData = fs.readFileSync(jsonContractAbiFilePath, 'utf8');
    let contractABI = JSON.parse(jsonContractAbiData);

    //Initialize ERC-20 Token ETH Contract object for Transaction
    let contract = new this.web3Object.eth.Contract(contractABI, this.erc20TokenContractAddress);

    try {
        const getWalletBalanceResult = await contract.methods.balanceOf(walletAddress).call();
        console.log('getWalletBalanceResult', getWalletBalanceResult);

        returnValue = { 
            walletBalance: Number(fromWei(getWalletBalanceResult, this.tokenDecimalCount))
        };
        console.log('walletBalance', returnValue);

        Logger.log(
            new EthereumLog(
                '',
                walletAddress,
                '',
                EthereumSteps.GetWalletBalance,
                EthereumGroup.GetWalletBalance,
                {
                    getWalletBalanceResult: getWalletBalanceResult,
                    walletBalance: returnValue,
                }
            )
        );
    }
    catch (error) {
        console.log('getWalletBalanceResult Error', error);
        Logger.error(
            new EthereumLog(
                '',
                walletAddress,
                '',
                EthereumSteps.GetWalletBalance,
                EthereumGroup.GetWalletBalance,
                {
                    error: error.message
                }
            )
        );
    }

    return returnValue;
  }
}