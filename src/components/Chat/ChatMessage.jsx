import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Avatar from '../Avatar'
import TextTimestamp from '../TextTimestamp'
import { setDisplayJson } from '../../store/slices/UserSlice'
import { MessageObjectType } from '../../lib/MessengerConst'
import BulletinLink from '../Bulletin/BulletinLink'
import ChatFileLink from './ChatFileLink'

const ChatMessage = ({ message }) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { Address } = useSelector(state => state.User)

  return (
    <div className={`flex ${message.Sour !== Address ? 'mr-auto flex-row' : 'ml-auto flex-row-reverse'}`}>
      <Avatar address={message.Sour} timestamp={Date.now()} style={'avatar-sm'} />

      <div className={`flex flex-col  ${message.Sour !== Address ? 'items-start' : 'items-end'}`}>
        <div className={`flex flex-row justify-between`}>
          <div className={`rounded-full px-1 border border-gray-400 shrink-0`} onClick={() => { dispatch(setDisplayJson({ json: message.Json, isExpand: true })) }}>
            <span className={`text-xs text-gray-500 dark:text-slate-200 text-left`}>
              #{message.Sequence}
            </span>
          </div>
          <TextTimestamp timestamp={message.SignedAt} textSize={'text-xs'} />
        </div>

        <div className={`${message.Sour !== Address ? 'mr-auto' : 'ml-auto'}`}>
          {
            typeof message.Content === "string" &&
            <span className={`w-full text-base text-slate-800 dark:text-slate-200`} >
              {message.Content}
            </span>
          }
          {
            typeof message.Content === "object" && message.Content.ObjectType === MessageObjectType.Bulletin &&
            <BulletinLink address={message.Content.Address} sequence={message.Content.Sequence} hash={message.Content.Hash} />
          }
          {
            typeof message.Content === "object" && message.Content.ObjectType === MessageObjectType.ChatFile &&
            <ChatFileLink name={message.Content.Name} ext={message.Content.Ext} size={message.Content.Size} hash={message.Content.Hash} />
          }
        </div>
      </div>
    </div>
  )
}

export default ChatMessage