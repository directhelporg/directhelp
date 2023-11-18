import * as MultiBaas from '@curvegrid/multibaas-sdk';
import { Meteor } from 'meteor/meteor';

const { url: baseUrl, key: accessToken } = Meteor.settings.public.MultiBaas;

// Configure the SDK using environment variables
const basePath = new URL('/api/v0', baseUrl);
const config = new MultiBaas.Configuration({
  basePath: basePath.toString(),
  accessToken,
});
const chain = 'ethereum';

export const Chains = new MultiBaas.ChainsApi(config);

Meteor.startup(async () => {
  const { data } = await Chains.getChainStatus(chain);
  const { chainID, blockNumber } = data.result;
  console.log(`MultiBaas is connected to #${chainID}, the latest block is #${blockNumber}`);
});
