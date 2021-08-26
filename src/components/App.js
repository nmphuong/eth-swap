import React, { Component } from 'react';
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar.jsx'
import Main from './Main.jsx'
import './App.css'
// import { abi } from "../abis/abi/abi/pairUni.abi.json"


// const web3 = new Web3('https://mainnet.infura.io/v3/fa9f23bdd4bf4af5b8d407b6059fdba6');

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })
    const ethBalance= await web3.eth.getBalance(this.state.account)
    this.setState({
      ethBalance: ethBalance
    })

    // Load token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      console.log(tokenData.address)
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({
        token
      })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({
        tokenBalance: tokenBalance.toString()
      })
    } else {
      window.alert('Token contract not deployed to detected network')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({
        ethSwap
      })
    } else {
      window.alert('EthSwap contract not deployed to detected network')
    }

    this.setState({
      loading: false
    })
  }

  async loadWeb3() {
    // const contract = new web3.eth.Contract( abi, '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc')
    window.web3 = new Web3(window.ethereum)
    if (window.ethereum) {
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
    }
    // const methodEncode = contract.methods.getReserves().encodeABI();
    // console.log('ccccccc', methodEncode)
    const mmmm = window.web3.utils.hexToNumber("1")
    console.log(mmmm)
  }

  buyTokens = (etherAmount) => {
    this.setState({
      loading: true
    })
    this.state.ethSwap.methods.buyTokens()
    .send({
      value: etherAmount,
      from: this.state.account
    })
    .on('transactionHash', (hash) => {
      this.setState({
        loading: false
      })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({
      loading: true
    })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount)
    .send({
      from: this.state.account
    })
    .on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({
          loading: false
        })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethBalance: '0',
      ethSwap: {},
      tokenBalance: '0',
      loading: true
     }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id='loader' className='text-center'>loading...</p>
    } else {
      content = <Main 
                  ethBalance={this.state.ethBalance}
                  tokenBalance={this.state.tokenBalance}
                  buyTokens={this.buyTokens}
                  sellTokens={this.sellTokens}
                />
    }
    return (
      <div>
        <Navbar 
          account={this.state.account}
        />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 m-auto" style={{maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {
                  content
                }
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
