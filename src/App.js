import './App.css'
import { useState } from 'react'

import Arweave from 'arweave'

/* connect to an Arweave node or specify a gateway  */
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http',
})

function App() {
  const [state, setState] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loadingState, setLoadingState] = useState('')

  async function createTransaction() {
    if (!state) return
    try {
      const formData = state
      setState('')
      setLoadingState('sendingTransaction')
      let transaction = await arweave.createTransaction({ data: formData })
      await arweave.transactions.sign(transaction)
      let uploader = await arweave.transactions.getUploader(transaction)

      while (!uploader.isComplete) {
        await uploader.uploadChunk()
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`)
      }
      setTransactionId(transaction.id)
      setLoadingState('transactionSent')
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function readFromArweave() {
    arweave.transactions
      .getData(transactionId, {
        decode: true,
        string: true,
      })
      .then((data) => {
        console.log('data: ', data)
      })
  }

  if (loadingState === 'sendingTransaction')
    return (
      <div className='container'>
        <p>Sending Transaction...</p>
      </div>
    )

  return (
    <div className='container'>
      <button style={button} onClick={createTransaction}>
        Create Transaction
      </button>

      {loadingState === 'transactionSent' && (
        <button style={button} onClick={readFromArweave}>
          Log Transaction Data
        </button>
      )}

      <input
        style={input}
        onChange={(e) => {
          setState(e.target.value)
          setLoadingState('')
        }}
        placeholder='text'
        value={state}
      />
    </div>
  )
}

const button = {
  outline: 'none',
  border: '1px solid black',
  backgroundColor: 'white',
  padding: '10px',
  width: '200px',
  marginBottom: 10,
  cursor: 'pointer',
}

const input = {
  backgroundColor: '#ddd',
  outline: 'none',
  border: 'none',
  width: '200px',
  fontSize: '16px',
  padding: '10px',
}

export default App
