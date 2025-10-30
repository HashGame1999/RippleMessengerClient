import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SettingPageTab } from '../../lib/AppConst'
import TextInput from '../../components/Form/TextInput'
import ToggleSwitch from '../../components/ToggleSwitch'
import Avatar from '../../components/Avatar'
import TextTimestamp from '../../components/TextTimestamp'
import { IoCloseOutline } from "react-icons/io5"
import AvatarName from '../../components/AvatarName'
import { AiOutlineUserAdd } from "react-icons/ai"
import { MdOutlineVerifiedUser } from "react-icons/md"
import { GrGroup, GrChannel } from "react-icons/gr"

export default function TabContact() {
  const [contactAddress, setContactAddress] = useState('')
  const [contactNickname, setContactNickname] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showFriendRequest, setShowFriendRequest] = useState(false)

  const [channelName, setChannelName] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { ContactList, activeTabSetting } = useSelector(state => state.User)
  const { FriendRequestList, ComposeMemberList, ComposeSpeakerList } = useSelector(state => state.Messenger)

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
    setShowAddContact(false)
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

  const addComposeMember = async (address) => {
    dispatch({
      type: 'ComposeMemberAdd',
      payload: {
        address: address
      }
    })
  }

  const delComposeMember = async (address) => {
    dispatch({
      type: 'ComposeMemberDel',
      payload: {
        address: address
      }
    })
  }

  const createGroup = async () => {
    dispatch({
      type: 'CreateGroup'
    })
  }

  const addComposeSpeaker = async (address) => {
    dispatch({
      type: 'ComposeSpeakerAdd',
      payload: {
        address: address
      }
    })
  }

  const delComposeSpeaker = async (address) => {
    dispatch({
      type: 'ComposeSpeakerDel',
      payload: {
        address: address
      }
    })
  }

  const createChannel = async () => {
    dispatch({
      type: 'CreateChannel',
      payload: {
        name: channelName
      }
    })
    setChannelName('')
    setShowCreateChannel(false)
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
        showAddContact &&
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-5 backdrop-blur-sm`}>
          <div className="flex flex-row items-center justify-center">
            <button onClick={() => setShowAddContact(false)} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              <IoCloseOutline className='icon' /> cancel
            </button>
          </div>
          <div className="mx-auto flex flex-col mt-4">
            <div className="card-title">
              Add/Update Contact
            </div>
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
        showCreateGroup &&
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-5 backdrop-blur-sm`}>
          <div className="flex flex-row items-center justify-center">
            <button onClick={() => setShowCreateGroup(false)} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              <IoCloseOutline className='icon' /> cancel
            </button>
          </div>
          <div className="mx-auto flex flex-col mt-4">
            <div className="card-title">
              Create Group
            </div>
            <div className="max-w-7xl overflow-x-auto overflow-y-auto whitespace-normal break-words p-2 rounded-xl shadow-2xl items-center">
              {
                ComposeMemberList.length > 0 ?
                  <div className='flex flex-wrap'>
                    {
                      ComposeMemberList.map((member, index) => (
                        <div key={member} className='mt-1 px-1 flex flex-col justify-center items-center' onClick={() => delComposeMember(member)}>
                          <Avatar address={member} timestamp={Date.now()} style={'avatar'} />
                          <AvatarName address={member} />
                        </div>
                      ))
                    }
                  </div>
                  :
                  <div>
                    no group member yet...
                  </div>
              }
              <hr />
              {
                ContactList.length > 0 ?
                  <div className='flex flex-wrap'>
                    {
                      ContactList.map((contact, index) => (
                        <div key={contact.Address} className='mt-1 px-1 flex flex-col justify-center items-center' onClick={() => addComposeMember(contact.Address)}>
                          <Avatar address={contact.Address} timestamp={Date.now()} style={'avatar-sm'} />
                          <div>
                            <span className='avatar-name text-xs' title={contact.Address}>
                              {contact.Nickname}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  :
                  <div>
                    no contact yet...
                  </div>
              }
            </div>
            <button
              className="btn-primary"
              disabled={ComposeMemberList.length === 0}
              onClick={() => createGroup()}>
              Create
            </button>
          </div>
        </div>
      }
      {
        showCreateChannel &&
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-5 backdrop-blur-sm`}>
          <div className="flex flex-row items-center justify-center">
            <button onClick={() => setShowCreateChannel(false)} className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              <IoCloseOutline className='icon' /> cancel
            </button>
          </div>
          <div className="mx-auto flex flex-col mt-4">
            <div className="card-title">
              Create Channel
            </div>
            <div className="max-w-7xl overflow-x-auto overflow-y-auto whitespace-normal break-words p-2 rounded-xl shadow-2xl items-center">
              <TextInput label={'Channel Name:'} value={channelName} onChange={(e) => setChannelName(e.target.value.trim())} />
              {
                ComposeSpeakerList.length > 0 ?
                  <div className='flex flex-wrap'>
                    {
                      ComposeSpeakerList.map((speaker, index) => (
                        <div key={speaker} className='mt-1 px-1 flex flex-col justify-center items-center' onClick={() => delComposeSpeaker(speaker)}>
                          <Avatar address={speaker} timestamp={Date.now()} style={'avatar'} />
                          <AvatarName address={speaker} />
                        </div>
                      ))
                    }
                  </div>
                  :
                  <div>
                    no channel speaker yet...
                  </div>
              }
              <hr />
              {
                ContactList.length > 0 ?
                  <div className='flex flex-wrap'>
                    {
                      ContactList.map((contact, index) => (
                        <div key={contact.Address} className='mt-1 px-1 flex flex-col justify-center items-center' onClick={() => addComposeSpeaker(contact.Address)}>
                          <Avatar address={contact.Address} timestamp={Date.now()} style={'avatar-sm'} />
                          <div>
                            <span className='avatar-name text-xs' title={contact.Address}>
                              {contact.Nickname}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  :
                  <div>
                    no contact yet...
                  </div>
              }
            </div>
            <button
              className="btn-primary"
              disabled={ComposeSpeakerList.length === 0}
              onClick={() => createChannel()}>
              Create
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
              <AiOutlineUserAdd className="icon" onClick={() => setShowAddContact(true)} />
              <GrGroup className="icon" onClick={() => setShowCreateGroup(true)} />
              <GrChannel className="icon" onClick={() => setShowCreateChannel(true)} />
              {
                FriendRequestList.length > 0 &&
                <MdOutlineVerifiedUser className="icon" onClick={() => setShowFriendRequest(true)} />
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