import { useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
// import abi from "../constants/abi.json"
// import contractAddresses from "../constants/contractAddresses.json"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useNotification } from "web3uikit"

import styles from "../styles/Lottery.module.css"

export default function LotteryEntrance() {
    // const chainIdHex = useMoralis().chainId // returns hex value of the chain id
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex).toString()
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null

    //useState hooks
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlyaers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0x")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    // getEntranceFee()
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function listenEvent() {
        if (typeof window.ethereum !== "undefined") {
            await new Promise(async (resolve, reject) => {
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum,
                    "any"
                )
                const raffle = new ethers.Contract(raffleAddress, abi, provider)
                raffle.on("WinnerPicked", async (address) => {
                    try {
                        console.log("Winner Picked ", address)
                        updateUI()
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
    }

    async function updateUI() {
        const entranceFeeCall = (await getEntranceFee()).toString()
        const numPlayerCall = (await getNumPlayers()).toString()
        const recentWinnerCall = (await getRecentWinner()).toString()
        setEntranceFee((prev) => entranceFeeCall)
        setNumPlyaers((prev) => numPlayerCall)
        setRecentWinner((prev) => recentWinnerCall)
        //console.log(entranceFeeCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            listenEvent()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async (tx) => {
        //
        await new Promise(async (resolve, reject) => {
            // raffle.once("WinnerPicked", async (address) => {})
            const provider = new ethers.providers.Web3Provider(
                window.ethereum,
                "any"
            )
            const raffle = new ethers.Contract(raffleAddress, abi, provider)

            raffle.once("RaffleEnter", async (address) => {
                try {
                    console.log(address, " entered")
                    //updateUI()
                    handleNewNotifitation(tx)
                    resolve()
                } catch (e) {
                    reject(e)
                }
            })
        })

        await tx.wait(1)
        updateUI()
    }

    const handleNewNotifitation = async function (tx) {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className={styles.main}>
            {raffleAddress ? (
                <div className={styles.lotteryBox}>
                    <div className={styles.buttonBox}>
                        {isLoading || isFetching ? (
                            <div className={styles.loader}></div>
                        ) : (
                            <button
                                className={styles.enterBtn}
                                onClick={async () => {
                                    await enterRaffle({
                                        onSuccess: handleSuccess,
                                        onError: (error) => console.log(error),
                                    })
                                }}
                                disabled={isLoading || isFetching}
                            >
                                <div>Enter the Lottery</div>
                            </button>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <div>
                            Entrance fee:{" "}
                            <span>
                                {ethers.utils.formatUnits(entranceFee, "ether")}{" "}
                                Eth
                            </span>
                        </div>

                        <div>
                            Players: <span>{numPlayers}</span>
                        </div>
                    </div>

                    <div className={styles.winner}>Recent winner: </div>
                    <span className={styles.winnerText}>{recentWinner}</span>
                </div>
            ) : (
                <div className={styles.notConnected}>
                    No contract address detected!
                </div>
            )}
        </div>
    )
}
