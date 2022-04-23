const Help: React.FC = () => {
  return (
    <div style={{padding: 20}}>
      <h1>Placeth</h1>
      <p>Welcome!</p>
      <p>Place pixels and create some art</p>
      <p>Yes, this is on mainnet</p>
      <p>
        You can send a bunch of pixels at the same time, no problem. It's preferable.
        Each transaction will cost ~21_000 gas, plus 80 gas per pixel. Placing 250 pixels
        costs the same as a regular Mainnet transaction.
      </p>
      <p>The UI is a bit messy, bear with me and drag the canvas around, the pixels will load.</p>

      <p>Pixels aren't stored in the contract, they're fetched from The Graph, wow!</p>
      <h3>warning, below is WIP</h3>
      <p>You can lock areas!</p>
      <p>To do so, you'll place a deposit per pixel (1 mΞ, ~3 USD at this time).
        We're not keeping any of it.
        It needs to be that amount to ensure that it can be profitable to escalate,
        even if just for an area that covers one pixel.
      </p>
      <p>For a period of time (1 day), the users, if they decide that the region
        shouldn't be locked, can escalate it and challenge your submission.
        The reasons this can happen are:
      </p>
      <ul>
        <li>The art is bad</li>
        <li>The region is colliding with an already locked region (either solved or ongoing)</li>
      </ul>
      <a href="/">Go back to Place pixels!!!!!!!!</a>
    </div>
  )
}

export default Help