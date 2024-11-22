export class GethListenerLog {
    token: string;
    transactionHash: string;
    targetWallet: string;
    step: string;
    group: GethListenerGroup;
    message: any;
  
    constructor(
      token: string,
      transactionHash: string,
      targetWallet: string,
      step: string,
      group: GethListenerGroup,
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

  export enum GethListenerGroup {
    OnMessage = 'OnMessage',
    OnOpen = 'OnOpen',
    OnClose = 'OnClose',
    OnError = 'OnError',
  }

  export enum GethListenerSteps {
    InitializeSubscription = 'Initialize Subscription',
    InitializeWebSocketConnection = 'Initialize WebSocket Connection',
    OnCloseEvent = 'OnClose Event',
    EventError = 'Event Error',
  }
  