
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';
import { fromWei } from '../../common/functions/cryptoFunction';

@Injectable()
export default class GetGasPriceUseCase {
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

  async getGasPrice(): Promise<any> {
    let returnValue: any;
    let getGasPriceResult : any;

    try {
        getGasPriceResult = await this.web3Object.eth.getGasPrice(); //Return value is in Gwei
        console.log('getGasPriceResult', getGasPriceResult);

        Logger.log(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.GetGasPrice,
                EthereumGroup.GetGasPrice,
                {
                    getGasPriceResult: getGasPriceResult,
                }
            )
        );
    }
    catch (error) {
        console.log('getGasPriceResult Error', error);
        Logger.error(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.GetGasPrice,
                EthereumGroup.GetGasPrice,
                {
                    error: error.message
                }
            )
        );
    }

    let getGasPriceResultEther: any;
    if (getGasPriceResult) {
        //Convert value from gwei to ether
        getGasPriceResultEther = this.web3Object.utils.fromWei(getGasPriceResult, "gwei");
        console.log('getGasPriceResultEther', getGasPriceResultEther);

        returnValue = {
            gasPrice : getGasPriceResult.toString(),
            gasPriceEther : getGasPriceResultEther
        };
    }

    return returnValue;
  }
}