import Head from "next/head"
import Image from "next/image"
//import styles from "../styles/Home.module.css"

//import Header from "../components/Header"
import HeaderNew from "../components/HeaderNew"
import LotteryEntrance from "../components/LotteryEntrance"

export default function Home() {
    return (
        <div className="container">
            <Head>
                <title>Smart Contract Lottery</title>
                <meta name="description" content="Smart Contract Lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HeaderNew />
            <LotteryEntrance />
        </div>
    )
}
