import useLockings from "../hooks/useLockings"
import { Locking } from "../types"

const LockingComp: React.FC<{ locking: Locking }> = ({ locking }) => {
  return (
    <div>
      <h3>locking "{locking.id}"</h3>
      <p>
        Coords are{" "}
        {`(${locking.x - 2 ** 15}, ${locking.y - 2 ** 15}) to
          (${locking.xx - 2 ** 15}, ${locking.yy - 2 ** 15})`}
      </p>
      <p>
        Submitted by{" "}
        <a href={`https://etherscan.io/address/${locking.requester}`}>
          {locking.requester}
        </a>
      </p>
      <p>Submitted in {new Date(locking.timestamp).toDateString()}</p>
    </div>
  )
}

const Lockings: React.FC<{ lockings: Locking[] }> = ({ lockings }) => {
  return (
    <div>
      {lockings.map((locking) => (
        <LockingComp key={locking.id} locking={locking} />
      ))}
    </div>
  )
}

const LockingsContainer: React.FC<{ lockings: Locking[] | undefined }> = ({
  lockings,
}) => {
  if (lockings === undefined) {
    return <div>loading..........</div>
  }
  return <Lockings lockings={lockings} />
}

const LockingsPage: React.FC = () => {
  const lockings = useLockings()

  return (
    <div>
      <h1>
        <a href="/">Back to placeth</a>
      </h1>
      <LockingsContainer lockings={lockings} />
    </div>
  )
}

export default LockingsPage
