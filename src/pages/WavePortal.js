import React, {useEffect, useState } from "react"
import { ethers } from "ethers"
import './WavePortal.css'
import abi from "../utils/WavePortal.json"

const App = () => {

  // testnet address
  const contractAddress = "0x0C552eff679AD1aeDBdA937e0aa1ca8704F92159"
  const contractABI = abi.abi

  // state variable to store user wallet info (public only)
  const [currentAccount, setCurrentAccount] = useState("")
  // state variable to store all waves
  const [allWaves, setAllWaves] = useState([])

  // state variable to track text input
  const [inputText, setInputText] = useState("")

  // function to check if ethereum object exists in react window
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log("Make sure you have metamask!")
        return;
      } else {
        console.log("There is a wallet installed", ethereum)
      }

      // check if user has authorised use of wallet
      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("First authorized account:", account)
        setCurrentAccount(account)
        // if connected account found, fetch waves
        getAllWaves()
      } else {
        console.log("No authorized account found")
        // connectWallet()
      }

    } catch (error) {
      console.log(error)
    }
  }
  
  // function to run check on wallet connection
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // function to connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask to connect!")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      console.log("Connected wallet:", accounts[0])
      setCurrentAccount(accounts[0])
      getAllWaves()

    } catch (error) {
      console.log(error)
    }
  }

  // function to wave 
  const wave = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waveTxn = await wavePortalContract.wave(inputText)
        console.log("Initiated transaction:", waveTxn.hash)
        await waveTxn.wait() // if doing more than read only (actual transaction) you must wait for transaction to finish
        console.log("Transaction completed:", waveTxn.hash)

        // uses read command to output total to log for test
        let count = await wavePortalContract.getTotalWaves()
        console.log("Retrieved total wave count: ", count.toNumber())

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // method to retireve all waves from contract
  const getAllWaves = async () => {
    const { ethereum } = window

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        // retrieve waves array
        const waves = await wavePortalContract.getAllWaves()

        // clean array to only have address, timestamp and message
        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        })

        // update waves state variable
        setAllWaves(wavesCleaned)        
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // listen for broadcasted events from other clients and update local record
  useEffect(() => {
    let wavePortalContract;

    // function for executing info from new wave
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      // update setAllWaves with new array (non-mutative concatenation)
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ])
    }

    // search for events 
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      // switch on event listener
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
  }, [])
  
  // return html
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 SALAM
        </div>

        <div className="bio">
        I am creating a test project on ethereum innit, drop a wave.
        </div>

        <label style={{marginTop: "16px", padding: "8px"}}>Enter your message before sending wave: 
          <input 
            type="text" 
            style={{marginLeft: "8px"}}
            onChange={(x) => setInputText(x.target.value)}
          />
        </label>

        <button className="button" onClick={wave}>
          Wave at me
        </button>

        {/* if no current account then show connect wallet button */}
        {!currentAccount && (
          <button className="button" onClick={connectWallet}>
            Connect wallet
          </button>
        )}

        <label style={{marginTop: "16px", padding: "8px"}}>
        History of waves on this contract:
        </label>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)}
        )}
        
      </div>
    </div>
  )
}

export default App