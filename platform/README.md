# Development

Create a file `.env/settings.json` and fill it with the necessary data:

```json
{
  "public": {
    "MultiBaas": {
      "url": "<deployment_url>",
      "key": "<access_key>",
      "DirectHelp": {
        "label": "<contract_label>",
        "address": "<contract_address>",
        "symbol": "<currency_symbol>"
      }
    }
  },
  "rpcUrl": "<json_rpc_url>",
  "signer": "<ethereum_account_private_key>"
}
```

Then just run this:

```bash
meteor npm start
```

Open http://localhost:3000 in your preferred browser.

# Deploying

You are free to build an application bundle and deploy it as a common Node app.

Or you could use Meteor Cloud hosting:

```bash
meteor deploy YOUR_DOMAIN_NAME --settings=.env/settings.json --free --mongo
```

Refer to the official Meteor [docs](https://docs.meteor.com/commandline.html#meteordeploy) for more information.