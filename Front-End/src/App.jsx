import { useEffect } from 'react'
import './App.css'

function App() {

  useEffect(()=>{
    fetch("http://localhost:3000/books").then((result)=>result.json()).then(data=>console.log(data))

  },[])
  return (
    <>
      <h1>HelloOo</h1>
    </>
  )
}

export default App
