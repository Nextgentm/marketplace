This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file..

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Compile and Deploy on Smartcontract

```
truffle compile
```

This command will compile all smartcontracts we have. For first time it will compile all, after that it will only those which had some modification.
Parameters:
--all
e.g. `truffle compile --all`
Compile all contracts instead of only the contracts changed since last compile.

```
truffle migrate
```

This command will deploy all the smartcontracts on the blockchain network which is mention in truffle-config file. after firsttime if this command only deploy smartcontracts which has added or modified.

This command has parameters:
--network NETWORK_NAME
e.g. `truffle migrate --network goerli`
The network name that we are passsing should have in truffle config file. default network is `development`.

--reset
e.g. `truffle migrate --reset`
Run all migrations from the beginning, instead of running from the last completed migration.

```
truffle console
```

## SmartContract Logic deployment

```bash
#Mainnet Networks
#Polygon Network
- NFTMarketplace Logic = 0x626045803Ffdb8b8261C54FA37663BFE01808d68
- OwnCollection721Beacon = 0xD8963F3e5CB8F44C5667d33f0D584f6A3BF6A4D7
- LootmogulUser1155Token Logic = 0x7eBD02f8FA47be3161C0D9539b82B22C23954923
- OwnCollection1155Beacon = 0x2F2C4afA688a20c0a3e81DA3c57f93924786234b
#Binance Network
- NFTMarketplace Logic = 0x69F8E24BEc5039750cc1c013C056cF3e22b7D2Fc
- OwnCollection721Beacon = 0x99A45B942700cf3347498B72D0d099dDfCF6ea2d
- LootmogulUser1155Token Logic = 0x3C6e2f4487ADd25027C576fDF5C29a43bd853e1E
- OwnCollection1155Beacon = 0xF23dBd4BBaC0d641C67dc8A00B8db455d9A0f0b5
//----------------------------------------------------------------//
#Testnet Networks
#Polygon mumbai Network (closed)
- NFTMarketplace Logic = 0x029a5e38c811FD8264B4bd5e518DA54429D888ff
- OwnCollection721Beacon = 0xe861560231D308faD14ffBd2dFBf783eA60D3df8
- LootmogulUser1155Token Logic = 0x2b96589204fF6F89dB24dB90bb05eFe30291643e
- OwnCollection1155Beacon = 0xd6Aa6e9a6fBB2fce3FB621C8ffA1B7A35A0082f1
#Binance Network
- NFTMarketplace Logic = 0xD524c69c4Fcf9f21Eb2d12aFAB0F6B9FA90d914b
- OwnCollection721Beacon = 0x99d73B59B4DA39e8380AA590d53C808780002152
- LootmogulUser1155Token Logic = 0xcE30e36B7a93f4552035f4baf4245578Fe7E03E1
- OwnCollection1155Beacon = 0x62f173b38b171c94A20d5ec8C627492220CDA109
#Ethereum Gorli Network  (closed)
- NFTMarketplace Logic = 0xc032A7358df83dDad4fC8731DaCA0800326D6939
- OwnCollection721Beacon = 0x6e63c0EFC1FfB803670696419Ba40817Fd0612D6
- LootmogulUser1155Token Logic = 0xBe24e32933FD9acA93d4D5271931f342c4A883d3
- OwnCollection1155Beacon = 0x12E7B5983Cf7b7D93DC49668cDF37fb178A9F19E

# Polygon Amoy Testnet
- ERC721Instance = 0xa07673d995898940731495F387dBa53CDBA9c136
- ERC721Instance Beacon = 0x37Bfe99Af5085a4241c3005068CFB0f5b94fC86b
- ERC721Instance Proxy = 0x7690c434500cED8E9742461910ac9949e620af7A
- ERC1155Instance = 0x8189cC9E9304A5f31748DA42d92e603864601C2C
- ERC1155Instance Beacon = 0x182b57A07ed42067A24D220958A2561e54E0003E
- ERC1155Instance Proxy = 0x3728E40Ef83b166de4549A443EF005b97ee49758

- Transfer Proxy = 0xB4451D1F30009128EAa5eCEE8529a4C49EF9BC30
- Trade = 0x0ED4C96208e4BEB9079844C5cdB3F341a2BF6eB4

- Token address = 0x6dee57AFe5862fBB3fE206035fdD9c892E5389cA
```

# ntest-nextjs
