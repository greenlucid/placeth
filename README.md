# placeth
Decentralized pixel art graffiti wall arbitrable dapp.
# Description 

Placeth is a crowd-sourced pixel art board where the community coordinates entirely on-chain. In placeth, art is collaborative; and, like a graffiti wall, the pixels are ephemeral. Placeth is permissionless, anyone can tag/paint over anyone else's pixels. Art can however be preserved, if the community decides the pixels are worthy. Leveraging the Graph, data-availability on-chain is minimized and intensive indexing is pushed onto the graph, so placing pixels on-chain is made so cheap that it's reasonable on mainet Eth. Leveraging Reality.eth and Kleros, the decisions to preserve art is crowd-sourced and placeth is owned by the community.

<img width="1183" alt="Screen Shot 2022-04-24 at 2 07 54 AM" src="https://user-images.githubusercontent.com/10378902/164950203-f2450baa-d0d9-472a-b229-0d6e367a0d3b.png">


Unlike Banksy street art, we can't cut art out of a wall --- but we can cut an erc-721 out of the pixels placeth. Is every pixel worth preserving? What even is art anyways? --- beauty is in the eye of the beholder. Art isn't really something that an individual owns anyways, its a reflection of the society that produced it. In placeth, preserving art immortalizes pixels the limited real estate of the 65536 x 65536 canvas. Like a statue in a town square, we want the community to decide which pixels to preserve. We use Reality.eth backed by Kleros as a subjective oracle to crowd-source the question "is this art?". 

# How It's Made 

The state changes to placeth are registered by calldata passed on-chain (deployed on Eth Kovan testnet). Placeth leverages the graph for data availability. Pixels are encoded in 5 Bytes, 2 Bytes for each coordinate, and 1 Byte for color. Each pixel change costs 80 gas, so encoding a cryptopunk (24x24) pixel art on the graffiti wall costs ~ 45k gas (~$10 at 80 gwei gas on mainet). The Graph handles indexing the calldata with event and call handlers. No storage about the pixels are maintained on-chain, the graph ensures data availability for the front-end rendering of the entire canvas.

Placeth integrates Reality.eth, a bond escalation mechanism along with Kleros arbitration services to have a decentralized and fair source of truth. (see example question below)

<img width="1120" alt="Screen Shot 2022-04-24 at 1 43 51 AM" src="https://user-images.githubusercontent.com/10378902/164949688-19239271-6f77-4243-91e7-91e7bdff6fc0.png">

When users request to preserve an area of placeth, a question is created on [Reality.eth](https://realityeth.github.io/#!/question/0xcb71745d032e16ec838430731282ff6c10d29dea-0x1091bed16155baed316e157a76a4cd6601fbd1877f33e669d48fd30441be7c30) (currently on Kovan testnet). Moreover, users stake a small deposit proportional to the number of pixels in the requested area and anyone can challenge the request for a period of 1 day. If anyone in the community thinks the requested area is not art, then they can play an escalation game doubling the bond. Moreover, any user can request arbitration from Kleros, a decentralized justice protocol, to resolve the question.

After a challenge period of 1 day, if the art preservation request is accepted, then an erc-721 is minted to memorialize the event. Moreover, the pixels are 'frozen' in the graph and the area cannot be rewritten.

# Directories:
- sc
- subgraph
- frontend
