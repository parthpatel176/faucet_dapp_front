import React, { useEffect, useState } from 'react';
import { ethers } from "ethers"
import abi from "../utils/Faucet.json"

import './Faucet.css';
import githubLogo from '../assets/icons8-github.svg';
import tap from '../assets/tap-svgrepo-com.svg';


const Main = () => {
  // constants for socials
  const GITHUB_HANDLE = 'parthpatel176'
  const GITHUB_LINK = `https://github.com/parthpatel176`;

  // testnet address
  const contractAddress = "0x25d3610F0b02B68D7c8E2b3C7E7943D7D9416622"
  const contractABI = abi.abi

  // state variable to store user wallet info (public only)
  const [currentAccount, setCurrentAccount] = useState("")

  // state variable to store error messages
  const [connectError, setConnectError] = useState("")


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
        // refresh local variables if account found 
        setCurrentAccount(accounts[0])
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

      // refresh local variables when account connected
      setCurrentAccount(accounts[0])
      setConnectError("")

    } catch (error) {
      console.log(error)
    }
  }

  // function to use Faucet
  const useFaucet = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, contractABI, signer)

        const waveTxn = await contract.useFaucet()
        console.log("Initiated transaction:", waveTxn.hash)
        await waveTxn.wait() // if doing more than read only (actual transaction) you must wait for transaction to finish
        console.log("Transaction completed:", waveTxn.hash)

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
      // if (provider.getBalance(address) < )
      setConnectError("Faucet is currently dry, please check back later")
    }
  }



  // return html render
  return (
    <div className="main">
      <div className="header">
        <p className="title"> Rinkeby Testnet Faucet </p>
        <p className="sub-text"> Connect wallet to recieve some ethereum on the Rinkeby testnet </p>
        <p className="disc-text" style={{marginTop: '0px'}
          }> Please note that this is not real (mainnet) ethereum </p>
      </div>

      <div className="tap_bg" > 
        <img alt="Tap Pic" className="tap" src={tap} />
      </div>

      {!currentAccount && (
        <div className="un-authed-container">
          <button
              className='button'
              onClick = {connectWallet}
            >Connect Wallet
            </button>
          
        </div>
      )}
      {currentAccount && (
        <div className="authed-container">
          <button
            className='button'
            onClick = {useFaucet}
          >Recieve 0.1 ETH
          </button>
          <p className="disc-text" style={{marginTop: '20px'}
            }> Faucet is limited to once per day per wallet</p>
        </div>
      )}

      <div className="disc-text" style={
            {color: 'red', marginTop: '10px'}
      }>{connectError}</div>
      
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