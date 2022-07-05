import { ConnectButton } from "web3uikit"

//import styles from "../styles/HeaderNew.module.css"
import styles from "../styles/Lottery.module.css"

export default function HeaderNew() {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Lottery Dapp</h1>
            <div className={styles.connect}>
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}
