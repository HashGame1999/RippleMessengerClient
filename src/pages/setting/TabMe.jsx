import { convertFileSrc } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SettingPageTab } from '../../lib/AppConst'
import Avatar from '../../components/Avatar'
import TextInput from '../../components/Form/TextInput'
import AvatarCropper from '../../components/AvatarCropper'

export default function TabMe() {
  const [displayNickname, setDisplayNickname] = useState('')
  const [imageSrc, setImageSrc] = useState(null)
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { Address, Nickname, activeTabSetting } = useSelector(state => state.User)

  useEffect(() => {
    if (activeTabSetting === SettingPageTab.Me) {
      setDisplayNickname(Nickname)
    }
  }, [activeTabSetting])

  const browseAvatarSource = async () => {
    const file = await open({
      multiple: false,
      directory: false,
    })
    console.log(file)

    if (file) {
      const webPath = convertFileSrc(file)
      console.log(webPath)
      setImageSrc(webPath)
    }
  }

  const updateNickname = (value) => {
    value = value.trim()
    setDisplayNickname(value)

    if (value !== '') {
      dispatch({ type: 'UpdateNickname', payload: { address: Address, nickname: value } })
    }
  }

  const closeAvatarCropper = () => {
    setImageSrc(null)
    setImageTimestamp(Date.now())
  }

  return (
    <div className="tab-page">
      <div className="mx-auto flex flex-col mt-4">
        <div className="card-title">
          {SettingPageTab.Me}
        </div>
        <div className="min-w-full p-2 flex flex-col rounded-lg shadow-xl justify-center">
          <div className="justify-center flex flex-col">
            <span className={`lable`} >
              Avatar:
            </span>
            {
              Address &&
              <Avatar address={Address} timestamp={imageTimestamp} onClick={() => browseAvatarSource()} style={'avatar'} />
            }
          </div>
          <TextInput label={'Nick Name:'} value={displayNickname} autoComplete={"off"} placeholder={"Alice"} onChange={(e) => updateNickname(e.target.value)} />
          {
            imageSrc &&
            <AvatarCropper address={Address} imageSrc={imageSrc} onClose={() => closeAvatarCropper()} />
          }
        </div>
      </div>
    </div>
  )
}