import React, { useEffect, useState } from 'react';
import { ethers } from "ethers"
import abi from "../utils/WavePortal.json"

import './Faucet.css';
import githubLogo from '../assets/icons8-github.svg';


const Main = () => {
  // constants for socials
  const GITHUB_HANDLE = 'parthpatel176'
  const GITHUB_LINK = `https://github.com/parthpatel176`;

  // testnet address
  const contractAddress = "0x0C552eff679AD1aeDBdA937e0aa1ca8704F92159"
  const contractABI = abi.abi

  // state variable to store user wallet info (public only)
  const [currentAccount, setCurrentAccount] = useState("")

  // state variable to store error messages
  const [connectError, setConnectError] = useState("")

  // state variable to store all waves
  const [allWaves, setAllWaves] = useState([])

  // state variable to track text input
  const [inputText, setInputText] = useState("")

  // function to check if ethereum object exists in react window
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      // !ethereum = no wallet
      if (!ethereum) {
        setConnectError("No wallet installed, get metamask at: https://metamask.io/")
        return;
      }

      // check if user has authorised use of wallet
      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length !== 0) {
        const account = accounts[0]
        setCurrentAccount(account)

        // refresh local variables if account found
        getAllWaves()
      
      } else {
        setConnectError("No authorized account found, connect wallet to continue!")
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
  

  // return html render
  return (
    <div className="main">
      <div className="header">
        <p className="title"> Rinkeby Testnet Faucet </p>
        <p className="sub-text"> Get the Ethereum you need to start experimenting on the Rinkeby testnet! </p>
        {!currentAccount && (
          <button
            className='button'
            onClick = {connectWallet}
          >Connect Wallet
          </button>
        )}
      </div>

      {!currentAccount && (
        <div className="un-authed-container">
          <div style={
            {color: 'red', marginTop: '20px'}
          }>{connectError}</div>
        </div>
      )}
      {currentAccount && (
        <div className="authed-container">
        </div>
      )}
      
      <div className="footer-container">
        <img alt="Twitter Logo" className="gh-logo" src={githubLogo} />
        <a
          className="footer-text"
          href={GITHUB_LINK}
          target="_blank"
          rel="noreferrer"
        >{`built by @${GITHUB_HANDLE}`}</a>
      </div>
    </div>
  );
};

export default Main;