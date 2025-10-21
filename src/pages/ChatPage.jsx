import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SessionType } from '../lib/MessengerConst'
import { setFlashNoticeMessage } from '../store/slices/UserSlice'
import ListSession from '../components/Chat/ListSession'
import AvatarName from '../components/AvatarName'
import ChatMessage from '../components/Chat/ChatMessage'

export default function ChatPage() {

  const [message, setMessage] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { SessionList, CurrentSession, CurrentSessionMessageList } = useSelector(state => state.Messenger)

  useEffect(() => {
    dispatch({ type: 'LoadSessionList' })
  }, [dispatch])

  useEffect(() => {
    if (CurrentSession) {
      setSessionTitle(CurrentSession.remote)
    } else {
      setSessionTitle('')
    }
  }, [CurrentSession])

  const send = async () => {
    if (message !== '') {
      let payload = {
        ...CurrentSession,
        content: message
      }
      dispatch({ type: 'SendContent', payload: payload })

      // reset
      setMessage('')
    } else {
      dispatch(setFlashNoticeMessage({ message: 'content is empty...', duration: 3000 }))
    }
  }

  return (
    <div className="p-1 my-5 card h-full flex flex-row justify-start items-start">
      <div className='p-1 w-1/4 h-full flex flex-col justify-start'>
        <div className="card-title">
          session list
        </div>
        <div className={`mt-1 flex flex-col`}>
          {
            SessionList.length === 0 ?
              <div className="mx-auto rounded-full p-1 border-2 border-gray-200 dark:border-gray-700 px-4">
                <h3 className='text-2xl text-gray-500 dark:text-gray-200'>
                  no session yet...
                </h3>
              </div>
              :
              SessionList.map((session, index) => (
                <div key={index} className='text-xs text-gray-200 mt-1 p-1'>
                  <ListSession session={session} />
                </div>
              ))
          }
        </div>
      </div>

      <div className='p-1 w-3/4 h-full flex flex-col'>
        {
          CurrentSession &&
          <div className='h-full' >
            {
              CurrentSession.type === SessionType.Private &&
              <div className='flex flex-col h-full' >
                {
                  sessionTitle !== '' &&
                  <div className="card-title" key={sessionTitle} >
                    <AvatarName address={sessionTitle} />
                  </div>
                }

                <div className="h-[50vh] flex-grow overflow-y-auto" >
                  {
                    CurrentSessionMessageList.length > 0 ?
                      CurrentSessionMessageList.map((message, index) => (
                        <div key={message.Hash} className='mt-1 px-1'>
                          <ChatMessage message={message} />
                        </div>
                      ))
                      :
                      <div className="shrink-0 flex flex-row" >
                        no messages yet...
                      </div>
                  }
                </div>

                {
                  CurrentSession.aes_key === undefined ?
                    <div className="shrink-0 flex flex-row" >
                      friend request is not approved or handshake not ready
                    </div>
                    :
                    <div className="shrink-0 flex flex-row" >
                      <textarea type={"text"}
                        id={`message:`}
                        name={'message:'}
                        value={message}
                        // disabled={CurrentSession.aes_key !== undefined}
                        rows="3"
                        onChange={(e) => setMessage(e.target.value)}
                        className={`p-2 w-full border rounded shadow-xl appearance-none input-color`}
                      />
                      <button onClick={() => send()} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-green-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        send
                      </button>
                    </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div >
  )
}