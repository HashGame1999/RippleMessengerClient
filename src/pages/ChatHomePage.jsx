import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { open } from '@tauri-apps/plugin-dialog'
import { MessageObjectType, SessionType } from '../lib/MessengerConst'
import { setFlashNoticeMessage } from '../store/slices/UserSlice'
import ListSession from '../components/Chat/ListSession'
import AvatarName from '../components/AvatarName'
import ChatMessage from '../components/Chat/ChatMessage'

export default function ChatHomePage() {

  const [messageType, setMessageType] = useState(MessageObjectType.NotObject)
  const [message, setMessage] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { SessionList, CurrentSession, CurrentSessionMessageList } = useSelector(state => state.Messenger)
  const { Address, ContactMap, FriendList } = useSelector(state => state.User)


  function scrollToBottom() {
    let MessageListContainer = document.getElementById('MessageListContainer')
    if (MessageListContainer !== null) {
      requestAnimationFrame(() => {
        MessageListContainer.scrollTop = MessageListContainer.scrollHeight
      })
    }
  }

  useEffect(() => {
    dispatch({ type: 'LoadSessionList' })
  }, [dispatch])

  useEffect(() => {
    console.log(CurrentSession)
    console.log(Address)
    console.log(ContactMap[Address])
    console.log(FriendList)
  }, [CurrentSession])

  useEffect(() => {
    scrollToBottom()
  }, [CurrentSessionMessageList])

  const send = async () => {
    if (message !== '') {
      dispatch({
        type: 'SendContent',
        payload: {
          content: message
        }
      })

      // reset
      setMessage('')
    } else {
      dispatch(setFlashNoticeMessage({ message: 'content is empty...', duration: 3000 }))
    }
  }

  const browseFile = async () => {
    const file_path = await open({
      multiple: false,
      directory: false,
    })
    if (file_path) {
      dispatch({
        type: 'SendFile', payload: {
          file_path: file_path
        }
      })
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
                <div className="card-title" key={CurrentSession.remote} >
                  <AvatarName address={CurrentSession.remote} />
                </div>

                <div id='MessageListContainer' className="min-h-[50vh] max-h-[75vh] flex-grow overflow-y-auto" >
                  {
                    CurrentSessionMessageList.length > 0 ?
                      CurrentSessionMessageList.map((message, index) => (
                        <div key={message.Hash} className='mt-1 px-1'>
                          <ChatMessage message={message} />
                        </div>
                      ))
                      :
                      <div>
                        no message yet...
                      </div>
                  }
                </div>

                {
                  CurrentSession.aes_key !== undefined ?
                    <div className="mt-1 flex flex-row shrink-0" >
                      <textarea type={"text"}
                        id={`message:`}
                        name={'message:'}
                        value={message}
                        rows="3"
                        onChange={(e) => setMessage(e.target.value)}
                        className={`p-2 w-full border rounded shadow-xl appearance-none input-color`}
                      />
                      <button onClick={() => browseFile()} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        send file
                      </button>
                      <button onClick={() => send()} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-green-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        send msg
                      </button>
                    </div>
                    :
                    <div>
                      handshake not ready...
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