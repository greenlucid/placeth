import useLockings from "../hooks/useLockings"
import { Locking } from "../types"

const LockingComp: React.FC<{ locking: Locking }> = ({ locking }) => {
  return (
    <div>
      <p>
        Coords are{" "}
        {`(${(locking.x, locking.y)}) to (${(locking.xx, locking.yy)})`}
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
        <LockingsContainer lockings={lockings} />
      </h1>
    </div>
  )
}

export default LockingsPage
