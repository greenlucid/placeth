# placeth
Decentralized pixel art graffiti wall arbitrable dapp
# Description 
The pixel art graffiti leverages the graph for data availability. State changes are registered by calldata passed on-chain (deployed on Eth Kovan testnet). Pixels are encoded in 5 Bytes, 2 Bytes for each coordinate, and 1 Byte for color. Each pixel change costs 80 gas, so encoding a cryptopunk (24x24) pixel art on the graffiti wall costs ~45k gas (~$10 at 80 gwei gas). The Graph handles indexing the calldata.

Preseving art:

Unlike Banksy street art, we can't cut art out of a wall --- but we can cut an erc-721 out of the pixels indexed in the Graph. Is every pixel worth preserving? What even is art anyways? --- beauty is in the eye of the beholder. Art isn't really something that an individual owns anyways, its a reflection of the society that produced it. In placeth, preserving art immortalizes in the limited real estate of the 65536 x 65536 canvas. Like a statue in a town square, we want the community to decide which pixels to preserve. We use Reality.eth backed by Kleros as a subjective oracle to crowd-source the question "is this art?". 

Reality.eth is a bond escalation mechanism which Placeth integrates along with Kleros arbitration services to have a decentralized and fair source of truth. (see example question below)

<img width="1120" alt="Screen Shot 2022-04-24 at 1 43 51 AM" src="https://user-images.githubusercontent.com/10378902/164949688-19239271-6f77-4243-91e7-91e7bdff6fc0.png">

After placeth art preservation requests are finalized, an erc-721 is minted to memorialize the event.

# Directories:
- sc
- subgraph
- frontend
