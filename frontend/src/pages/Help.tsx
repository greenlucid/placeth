const Help: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Placeth</h1>
      <p>Welcome!</p>
      <p>Place pixels and create some art</p>
      <p>This proof of concept is intended for a L1.</p>
      <p>
        You can send a bunch of pixels at the same time, no problem. It's
        preferable. Each transaction will cost ~21_000 gas, plus 80 gas per
        pixel. Placing 250 pixels costs the same as a regular EVM base transaction.
      </p>
      <p>
        On an OR like Optimism or Arbitrum, the cost will greatly be reduced,
        due to eliminating the 21k gas overhead per transaction. The Graph and
        Realit.io work on them too, so the real product will be deployed on
        them.
      </p>
      <p>
        The UI is a bit messy, please bear w ith me and drag the canvas around, the
        pixels will only load while they're being dragged or painted.
      </p>

      <p>
        Pixels aren't stored in the contract, they're fetched from The Graph,
        wow!
      </p>
      <h3>warning, below is unsupported in frontend</h3>
      <p>You can lock areas! go to etherscan or blockscout and do it there</p>
      <p>
        To do so, you'll place a deposit per pixel (unknown amount). We're not
        keeping any of it.
      </p>
      <p>
        For a period of time (1 day), the users, if they decide that the region
        shouldn't be locked, can escalate it and challenge your submission. This
        will be done using a subjective oracle (like realit.io) The reasons this
        can happen are:
      </p>
      <ul>
        <li>The art is bad</li>
        <li>
          The region is colliding with an already locked region (either solved
          or ongoing)
        </li>
      </ul>
      <a href="/">Go back to Place pixels!!!!!!!!</a>
    </div>
  )
}

export default Help
