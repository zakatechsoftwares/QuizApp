import { StyleSheet, Text, View } from 'react-native'
import { useState, useEffect } from 'react'

const CountDown = ({timers}) => {

   const [timer, setTimer] = useState(timers)
     const [clock, setClock] = useState('')
     const [countDown, setCountDown] = useState('')


useEffect(()=>{
    let todaySec = Date.parse(new Date())/1000
    let timerSec=timer/1000
  //  console.log(today)
     let timeout = setTimeout(()=>{
       timerSec > 0  && setTimer(timer-1);
      // setClock( new Date(timer).toLocaleString())
        // console.log(timer)
        let countDown=timerSec-todaySec
        let day = Math.floor(countDown/86400)
        let hr= Math.floor(countDown%86400/3600)
        let min = Math.floor(countDown%3600/60)
        let sec = Math.floor(countDown%3600%60)
        
       // console.log(countDown)
       setClock( new Date(timer).toLocaleString())
       setCountDown( `${day<0 ? 0 : day}day  : ${hr<0 ? 0 : hr}hr : ${min>0 ? min : 0}min : ${sec>0 ? sec : 0}s`)
      
      timer === 0 && alert('Time up') 
      },1000) 
    
      return ()=> clearTimeout(timeout)
   
  }
  ,[timer
  ])



  return (
    <View>
      <Text>Schedule: {clock} {"\n"} Countdown: {countDown}</Text>

    </View>
  )
}

export default CountDown

const styles = StyleSheet.create({})