import {useEffect, useState} from "react";
import { ethers } from "ethers";
import abi from "../utils/WavePortal.json";


export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(""); 
  const [allWaves, setAllWaves] = useState([]);
  const [allPokes, setAllPokes] = useState([]);
  const [friend, setFriend] = useState("");

  const[waveMessage, setWaveMessage] = useState("");
  const[pokeMessage, setPokeMessage] = useState("");

  const contractAddress = "0x562622F58B15ea0Bf8508a6b0DAC6cB47180467b";
  const contractABI = abi.abi;

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
        };
      });
        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

   /*
   * Create a method that gets all pokes from your contract
   */
   const getAllPokes = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const pokes = await wavePortalContract.getAllPokes();

        const pokesCleaned = pokes.map(poke => {
          return {
            address: poke.poker,
            timestamp: new Date(poke.timestamp * 1000),
            message: poke.message,
          };
        });

        /*
         * Store our data in React State
         */
        setAllPokes(pokesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try{
      const ethereum = window; 
      
      if(!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /*
      * Check if we're authorized to access the user's wallet
      */

      const accounts = await window.ethereum.request({method: "eth_accounts"}); 

      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account); 

        getAllWaves(); 
        getAllPokes();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }

    setWaveMessage("");
  }

  const poke = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); 
        const signer = provider.getSigner(); 
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer); 

        let count = await wavePortalContract.getTotalPokes(); 
        console.log("Retrieved total poke count...", count.toNumber()); 

        /*
        * Execute the actual wave from your smart contract
        */
        const pokeTxn = await wavePortalContract.poke(pokeMessage, { gasLimit: 300000 });
        console.log("Mining...", pokeTxn.hash);

        await pokeTxn.wait();
        console.log("Mined -- ", pokeTxn.hash);

        count = await wavePortalContract.getTotalPokes();
        console.log("Retrieved total poke count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }

    setPokeMessage("");
  }

  const addFriend = async () => {
    try {
      const {ethereum} = window; 

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); 
        const signer = provider.getSigner(); 
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer); 

        const accounts = await window.ethereum.request({method: "eth_accounts"}); 

        const friendTxn = await wavePortalContract.addFriends(accounts[0]); 
        console.log("Mining...", friendTxn.hash);

        await friendTxn.wait();
        console.log("Mined --", friendTxn.hash);
        setFriend(accounts[0]);

      }else {
        console.log("Ethereum object doesn't exist!"); 
      }
    } catch (error) {
        console.log(error);
      }
  }

  const handleWaveState = (e) => {
    setWaveMessage(e.target.value);
  }

  const handlePokeState = (e) => {
    setPokeMessage(e.target.value);
  }
  

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    const onNewPoke = (from, timestamp, message) => {
      console.log("NewPoke", from, timestamp, message);
      setAllPokes(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
      wavePortalContract.on("NewPoke", onNewPoke);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
        wavePortalContract.off("NewPoke", onNewPoke);
      }
    };
  }, [])

  return (
    <div className="flex flex-col bg-gradient-to-r from-yellow-500 w-screen h-screen text-center justify-center items-center space-y-4">
      <p className="text-center text-4xl font-bold">
        Hello 👋🏾!
      </p>
      <p className="text-center text-2xl font-medium">
        I am Abigail. Connect your Ethereum wallet and wave at me!
      </p>

      <form className="flex flex-col" onSubmit={wave}>
        <input className="rounded-lg h-10 px-1 focus:outline-none" value={waveMessage} onChange={handleWaveState}/>
        <button type="submit" className="bg-violet-700 w-96 py-1.5 text-white font-semibold rounded-lg hover:cursor-pointer hover:bg-violet-900">Wave at Me</button>
      </form>
      
      <form className="flex flex-col" onSubmit={poke}>
        <input className="rounded-lg h-10 px-1 focus:outline-none" value={pokeMessage} onChange={handlePokeState}/>
        <button className="bg-violet-700 w-96 py-1.5 text-white font-semibold rounded-lg hover:cursor-pointer hover:bg-violet-900" onClick={poke}>Poke Me (only friends)</button>
      </form>
      
      {!friend && currentAccount && (
        <p className="hover:cursor-pointer underline" onClick={addFriend}>Add Friend</p>
      )}
      

      {/*
        If there is not currentAccount render thsi button
      */}
      {!currentAccount && (
        <button onClick={connectWallet} className="underline">
          Connect Wallet
        </button>
      )}

      <div className="flex">
        <div className="flex flex-col mb-20">
          {allWaves.map((wave, index) => {
              return (
            
                <div className="mt-10 p-8 bg-gradient-to-r from-slate-200 to-white rounded-lg" key={index}>
                  <div>From: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              )

          })}
        </div>

        <div className="flex flex-col">
          {allPokes.map((poke, index) => {
              return (
                <div className="mt-10 p-8 bg-red-500 rounded-lg" key={index}>
                  <div>Address: {poke.address}</div>
                  <div>Time: {poke.timestamp.toString()}</div>
                  <div>Message: {poke.message}</div>
                </div>)
          })}
        </div>

      </div>

    </div>
 
  )
}
