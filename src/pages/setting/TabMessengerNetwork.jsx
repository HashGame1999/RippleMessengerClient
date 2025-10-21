import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { SettingPageTab } from '../../lib/AppConst'
import TextInput from '../../components/Form/TextInput'

export default function TabMessengerNetwork() {
  const [chatServer, setChatServer] = useLocalStorage('ChatServer', '')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const updateChatServer = (value) => {
    value = value.trim()
    setChatServer(value)
    // dispatch(setUserError(null))

    if (value !== '') {
    }
  }

  return (
    <div className="tab-page">
      <div className="mx-auto flex flex-col mt-4">
        <div className="card-title">
          {SettingPageTab.MessengerNetwork}
        </div>
        <div className="min-w-full p-2 rounded-lg shadow-xl justify-center">
          <div className="mx-auto space-y-2">
            <TextInput label={'Chat Server:'} value={chatServer} autoComplete={"on"} placeholder={"wss://......"} onChange={(e) => updateChatServer(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}       
