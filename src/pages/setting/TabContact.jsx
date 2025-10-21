import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SettingPageTab } from '../../lib/AppConst'
import TextInput from '../../components/Form/TextInput'
import ToggleSwitch from '../../components/ToggleSwitch'
import Avatar from '../../components/Avatar'
import TextTimestamp from '../../components/TextTimestamp'
import { MdPostAdd } from "react-icons/md"
import { IoCloseOutline } from "react-icons/io5"
import { LiaUserFriendsSolid } from "react-icons/lia"
import AvatarName from '../../components/AvatarName'

export default function TabContact() {
  const [contactAddress, setContactAddress] = useState('')
  const [contactNickname, setContactNickname] = useState('')
  const [showUpdateContact, setShowUpdateContact] = useState(false)
  const [showFriendRequest, setShowFriendRequest] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { ContactList, activeTabSetting } = useSelector(state => state.User)
  const { FriendRequestList } = useSelector(state => state.Messenger)

  useEffect(() => {
    console.log(ContactList)
    if (activeTabSetting === SettingPageTab.Contact) {
    }
  }, [dispatch, activeTabSetting])

  const addContact = async () => {
    dispatch({
      type: 'ContactAdd',
      payload: {
        address: contactAddress,
        nickname: contactNickname
      }
    })
    setContactAddress('')
    setContactNickname('')
    setShowUpdateContact(false)
  }

  const delContact = async (address) => {
    dispatch({
      type: 'ContactDel',
      payload: { contact_address: address }
    })
  }

  const toggleIsFollow = async (address) => {
    dispatch({
      type: 'ContactToggleIsFollow',
      payload: { contact_address: address }
    })
  }

  const toggleIsFriend = async (address) => {
    dispatch({
      type: 'ContactToggleIsFriend',
      payload: { contact_address: address }
    })
  }

  const acceptFriendRequest = async (address) => {
    dispatch({
      type: 'AcceptFriendRequest',
      payload: { remote: address }
    })
    setShowFriendRequest(false)
  }

  return (
    <div className="tab-page">
      {
        showUpdateContact &&
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-5 backdrop-blur-sm`}>
          <div className="flex flex-row items-center justify-center">
            <button onClick={() => setShowUpdateContact(false)} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              <IoCloseOutline className='icon' /> cancel
            </button>
          </div>
          <div>
            <TextInput label={'Address:'} value={contactAddress} onChange={(e) => setContactAddress(e.target.value.trim())} />
            <TextInput label={'Nickname:'} value={contactNickname} onChange={(e) => setContactNickname(e.target.value.trim())} />
            <button
              className="btn-primary"
              disabled={contactAddress === '' || contactNickname === ''}
              onClick={() => addContact()}>
              Add/Update
            </button>
          </div>
        </div>
      }
      {
        showFriendRequest &&
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-5 backdrop-blur-sm`}>
          <div className="flex flex-row items-center justify-center">
            <button onClick={() => setShowFriendRequest(false)} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              <IoCloseOutline className='icon' /> cancel
            </button>
          </div>
          <div className={`table-container`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr className="p-2 text-center font-bold text-sm text-gray-800 dark:text-gray-300 tracking-wider">
                  <th>Avatar</th>
                  <th>Nickname</th>
                  <th>Updated At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {
                  FriendRequestList.map((request, index) => (
                    <tr key={index} className='border border-gray-200 dark:border-gray-700 hover:bg-gray-500'>
                      <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300"
                        title={request.Remote}>
                        <Avatar address={request.Remote} timestamp={Date.now()} style={'avatar'} />
                      </td>
                      <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300"
                        title={request.Remote}>
                        <AvatarName address={request.Remote} />
                      </td>
                      <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                        <TextTimestamp timestamp={request.UpdatedAt} />
                      </td>
                      <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                        <button className="p-2 text-base font-bold bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={() => acceptFriendRequest(request.Remote)}>
                          Accept
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <div className="mx-auto flex flex-col mt-4">
        <div className="card-title">
          {SettingPageTab.Contact}
        </div>

        <div className="min-w-full p-2 flex gap-1 rounded-lg shadow-xl justify-center">
          <div className={`mt-1 flex-1`}>
            <div className='flex flex-row'>
              <MdPostAdd className="icon" onClick={() => setShowUpdateContact(true)} />
              {
                FriendRequestList.length > 0 &&
                <LiaUserFriendsSolid className="icon" onClick={() => setShowFriendRequest(true)} />
              }
            </div>
            {
              ContactList.length > 0 ?
                <div className={`table-container`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="">
                      <tr className="p-2 text-center font-bold text-sm text-gray-800 dark:text-gray-300 tracking-wider">
                        <th>Avatar</th>
                        <th>Nickname</th>
                        <th>Follow?</th>
                        <th>Friend?</th>
                        <th>Updated At</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {
                        ContactList.map((contact, index) => (
                          <tr key={index} className='border border-gray-200 dark:border-gray-700 hover:bg-gray-500'>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300"
                              title={contact.Address}>
                              <Avatar address={contact.Address} timestamp={Date.now()} style={'avatar'} />
                            </td>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300"
                              title={contact.Address}>
                              {contact.Nickname}
                            </td>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                              <ToggleSwitch isChecked={contact.IsFollow} onClick={() => { toggleIsFollow(contact.Address) }} />
                            </td>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                              <ToggleSwitch isChecked={contact.IsFriend} onClick={() => { toggleIsFriend(contact.Address) }} />
                            </td>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                              <TextTimestamp timestamp={contact.UpdatedAt} />
                            </td>
                            <td className="p-2 whitespace-nowrap text-base text-gray-800 dark:text-gray-300">
                              {
                                contact.IsFollow === false && contact.IsFriend === false &&
                                <button className="p-2 text-base font-bold bg-red-500 text-white rounded hover:bg-green-600"
                                  onClick={() => delContact(contact.Address)}>
                                  Delete
                                </button>
                              }
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                :
                <div>
                  no contact yet..
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}