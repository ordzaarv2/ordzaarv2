declare module '@omnisat/lasereyes-core' {
  export class LaserEyesClient {
    constructor(stores: any, config?: any);
    initialize(): void;
    connect(providerType: any): Promise<void>;
    requestAccounts(): Promise<string[]>;
    getBalance(): Promise<number | string | { toNumber: () => number } | any>;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string, address?: string): Promise<string>;
    signPsbt(psbtHex: string, finalize?: boolean, broadcast?: boolean): Promise<any>;
    getPublicKey(): Promise<string>;
    getInscriptions(offset?: number, limit?: number): Promise<any[]>;
    inscribe(content: string, contentType: string): Promise<string>;
    disconnect(): void;
    dispose(): void;
    $store: any;
  }

  export function createStores(): any;
  export function createConfig(options: { network: string }): any;
  
  export const UNISAT: any;
  export const XVERSE: any;
  export const LEATHER: any;
  export const MAGIC_EDEN: any;
  export const OKX: any;
  export const OP_NET: any;
  export const ORANGE: any;
  export const OYL: any;
  export const PHANTOM: any;
  export const SPARROW: any;
  export const WIZZ: any;
  
  export type ProviderType = any;
  export type NetworkType = 'mainnet' | 'testnet' | 'testnet4' | 'signet' | 'fractal' | 'fractal testnet';
} 